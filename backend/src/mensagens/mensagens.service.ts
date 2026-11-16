
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StatusExecucaoIa, TipoCampanha } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { GeminiService } from '../ia/gemini.service';
import type { ResultadoTexto } from '../ia/gemini.service';
import { AtualizarMensagemDto, GerarMensagemDto } from './dto/mensagens.dto';
import { CloudinaryImageService } from '../ia/cloudinary-image.service';

const TOM: Record<string, string> = {
  FORMAL: 'formal',
  DESCONTRAIDO: 'descontraído',
  PERSUASIVO: 'persuasivo',
  DIVERTIDO: 'divertido',
  PESSOAL: 'pessoal e próximo',
};

const OBJETIVO: Record<string, string> = {
  LANCAMENTO: 'lançamento',
  PROMOCAO: 'promoção',
  DIVULGACAO: 'divulgação',
  INDICACAO: 'indicação',
  ULTIMAS_UNIDADES: 'últimas unidades',
};

@Injectable()
export class MensagensIaService {
  constructor(
    private prisma: PrismaService,
    private gemini: GeminiService,
    private cloudinaryImage: CloudinaryImageService,
  ) {}

  async gerar(dto: GerarMensagemDto, contaId: string) {
    const produto = await this.prisma.produto.findFirst({
      where: { id: dto.produtoId, contaId },
      select: {
        id: true,
        nome: true,
        imagem: true,
        precoAtual: true,
        categoria: { select: { nome: true } },
        caracteristicas: {
          select: {
            valor: true,
            caracteristica: { select: { nome: true } },
          },
        },
      },
    });

    if (!produto) throw new NotFoundException('Produto não encontrado');

    let imagemFinal: string | null = null;
    let arteId: string | null = null;

    // Cada geração cria uma arte nova e independente.
    if (produto.imagem) {
      const promptImagem = this.montarPromptImagem(dto, produto);
      const inicio = Date.now();

      try {
        imagemFinal = await this.cloudinaryImage.gerarImagem(
          produto.imagem,
          promptImagem,
        );
      } catch (erro) {
        await this.prisma.execucaoIa.create({
          data: {
            provedor: 'cloudinary',
            modeloIa: 'nano-banana-2-lite-edit',
            prompt: promptImagem,
            status: StatusExecucaoIa.FALHA,
            duracaoMs: Date.now() - inicio,
            mensagemErro: erro instanceof Error ? erro.message : String(erro),
          },
        });

        throw erro;
      }

      // Salva a arte imediatamente, independentemente da mensagem.
      const arte = await this.prisma.arteIa.create({
        data: {
          imagemUrl: imagemFinal,
        },
      });

      arteId = arte.id;

      // A execução da geração da imagem pertence à arte.
      await this.prisma.execucaoIa.create({
        data: {
          arteId: arte.id,
          provedor: 'cloudinary',
          modeloIa: 'nano-banana-2-lite-edit',
          prompt: promptImagem,
          resposta: imagemFinal,
          status: StatusExecucaoIa.SUCESSO,
          duracaoMs: Date.now() - inicio,
        },
      });
    }

    // Continua gerando o texto normalmente com Gemini.
    const prompt = this.montarPrompt(dto, produto);

    let resultado: ResultadoTexto;

    try {
      resultado = await this.gemini.gerarTexto(prompt);
    } catch (erro) {
      await this.prisma.execucaoIa.create({
        data: {
          provedor: 'gemini',
          modeloIa: process.env.GEMINI_MODEL ?? 'gemini-3.8-flash',
          prompt,
          status: StatusExecucaoIa.FALHA,
          mensagemErro: erro instanceof Error ? erro.message : String(erro),
        },
      });

      throw erro;
    }

    const { assunto, conteudo } =
      dto.tipo === TipoCampanha.EMAIL
        ? this.separarEmail(resultado.texto)
        : { assunto: null, conteudo: resultado.texto };

    return this.prisma.$transaction(async (tx) => {
      const mensagem = await tx.mensagemIa.create({
        data: {
          contaId,
          criadoPorId: null,
          produtoId: produto.id,
          arteId,
          tipo: dto.tipo,
          titulo: `${OBJETIVO[dto.objetivo]} - ${produto.nome}`.slice(0, 160),
          tom: dto.tom,
          objetivo: dto.objetivo,
          observacoes: dto.observacoes ?? null,
          assunto,
          conteudo,
        },
      });

      await tx.execucaoIa.create({
        data: {
          mensagemId: mensagem.id,
          provedor: 'gemini',
          modeloIa: resultado.modelo,
          prompt,
          resposta: resultado.texto,
          status: StatusExecucaoIa.SUCESSO,
          tokensEntrada: resultado.tokensEntrada,
          tokensSaida: resultado.tokensSaida,
          duracaoMs: resultado.duracaoMs,
        },
      });

      return {
        ...mensagem,
        imagemUrl: imagemFinal,
      };
    });
    
  }

   async adaptar(
    id: string,
    novoTipo: TipoCampanha,
    contaId: string,
  ) {
    if (
      novoTipo !== TipoCampanha.EMAIL &&
      novoTipo !== TipoCampanha.WHATSAPP
    ) {
      throw new BadRequestException('Canal de destino inválido');
    }

    const original = await this.prisma.mensagemIa.findFirst({
      where: { id, contaId },
      select: {
        id: true,
        produtoId: true,
        arteId: true,
        tipo: true,
        tom: true,
        objetivo: true,
        observacoes: true,
        produto: {
          select: {
            id: true,
            nome: true,
            precoAtual: true,
            categoria: {
              select: { nome: true },
            },
            caracteristicas: {
              select: {
                valor: true,
                caracteristica: {
                  select: { nome: true },
                },
              },
            },
          },
        },
      },
    });

    if (!original) {
      throw new NotFoundException('Mensagem não encontrada');
    }

    if (!original.produto) {
      throw new BadRequestException(
        'Não é possível adaptar esta mensagem porque ela não possui um produto vinculado',
      );
    }

    if (original.tipo === novoTipo) {
      throw new BadRequestException(
        'O canal de destino deve ser diferente do canal da mensagem original',
      );
    }

    const dto: GerarMensagemDto = {
      produtoId: original.produtoId!,
      tipo: novoTipo,
      tom: original.tom,
      objetivo: original.objetivo,
      observacoes: original.observacoes ?? undefined,
    };

    const prompt = this.montarPrompt(dto, original.produto);

    let resultado: ResultadoTexto;

    try {
      resultado = await this.gemini.gerarTexto(prompt);
    } catch (erro) {
      await this.prisma.execucaoIa.create({
        data: {
          provedor: 'gemini',
          modeloIa: process.env.GEMINI_MODEL ?? 'gemini-3.8-flash',
          prompt,
          status: StatusExecucaoIa.FALHA,
          mensagemErro: erro instanceof Error ? erro.message : String(erro),
        },
      });

      throw erro;
    }

    const { assunto, conteudo } =
      novoTipo === TipoCampanha.EMAIL
        ? this.separarEmail(resultado.texto)
        : { assunto: null, conteudo: resultado.texto };

    return this.prisma.$transaction(async (tx) => {
      const mensagem = await tx.mensagemIa.create({
        data: {
          contaId,
          criadoPorId: null,
          produtoId: original.produtoId,
          arteId: original.arteId,
          tipo: novoTipo,
          titulo: `${OBJETIVO[original.objetivo]} - ${original.produto!.nome}`.slice(
            0,
            160,
          ),
          tom: original.tom,
          objetivo: original.objetivo,
          observacoes: original.observacoes,
          assunto,
          conteudo,
        },
      });

      await tx.execucaoIa.create({
        data: {
          mensagemId: mensagem.id,
          provedor: 'gemini',
          modeloIa: resultado.modelo,
          prompt,
          resposta: resultado.texto,
          status: StatusExecucaoIa.SUCESSO,
          tokensEntrada: resultado.tokensEntrada,
          tokensSaida: resultado.tokensSaida,
          duracaoMs: resultado.duracaoMs,
        },
      });

      return mensagem;
    });
  }

  async atualizar(id: string, dto: AtualizarMensagemDto, contaId: string) {
    const existente = await this.prisma.mensagemIa.findFirst({
      where: { id, contaId },
      select: { id: true },
    });

    if (!existente) throw new NotFoundException('Mensagem não encontrada');

    return this.prisma.mensagemIa.update({
      where: { id },
      data: {
        conteudo: dto.conteudo,
        ...(dto.titulo !== undefined && { titulo: dto.titulo.trim() }),
        ...(dto.assunto !== undefined && {
          assunto: dto.assunto.trim() || null,
        }),
        ...(dto.textoBotao !== undefined && {
          textoBotao: dto.textoBotao.trim() || null,
        }),
      },
    });
  }

  async listar(contaId: string, tipo?: TipoCampanha) {
    const mensagens = await this.prisma.mensagemIa.findMany({
      where: { contaId, ...(tipo && { tipo }) },
      orderBy: { criadoEm: 'desc' },
      select: {
        id: true,
        titulo: true,
        tipo: true,
        tom: true,
        objetivo: true,
        criadoEm: true,
        produto: { select: { nome: true } },
        _count: { select: { campanhas: true } },
      },
    });

    return mensagens.map((m) => ({
      id: m.id,
      titulo: m.titulo,
      tipo: m.tipo,
      tom: m.tom,
      objetivo: m.objetivo,
      criadoEm: m.criadoEm,
      produto: m.produto?.nome ?? null,
      campanhas: m._count.campanhas,
    }));
  }

  async buscarUma(id: string, contaId: string) {
    const mensagem = await this.prisma.mensagemIa.findFirst({
      where: { id, contaId },
      select: {
        id: true,
        titulo: true,
        tipo: true,
        tom: true,
        objetivo: true,
        observacoes: true,
        assunto: true,
        conteudo: true,
        textoBotao: true,
        produtoId: true,
        arte: {
          select: {
            imagemUrl: true,
          },
        },
      },
    });

    if (!mensagem) throw new NotFoundException('Mensagem não encontrada');

    // Mantém imagemUrl no retorno para compatibilidade com o frontend.
    return {
      ...mensagem,
      imagemUrl: mensagem.arte?.imagemUrl ?? null,
    };
  }

  async remover(id: string, contaId: string) {
    const mensagem = await this.prisma.mensagemIa.findFirst({
      where: { id, contaId },
      select: { id: true },
    });

    if (!mensagem) throw new NotFoundException('Mensagem não encontrada');

    const emUso = await this.prisma.campanha.count({
      where: {
        mensagemId: id,
        status: { in: ['AGENDADA', 'EM_EXECUCAO'] },
      },
    });

    if (emUso > 0) {
      throw new BadRequestException(
        'Esta mensagem está em uma campanha agendada e não pode ser excluída',
      );
    }

    await this.prisma.mensagemIa.delete({ where: { id } });
  }

  private montarPrompt(
    dto: GerarMensagemDto,
    produto: {
      nome: string;
      precoAtual: unknown;
      categoria: { nome: string } | null;
      caracteristicas: {
        valor: string;
        caracteristica: { nome: string };
      }[];
    },
  ) {
    const preco = produto.precoAtual
      ? Number(produto.precoAtual).toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        })
      : 'não informado';

    const caracteristicas = produto.caracteristicas.length
      ? produto.caracteristicas
          .map((c) => `${c.caracteristica.nome}: ${c.valor}`)
          .join(', ')
      : 'não informadas';

    const whatsapp = dto.tipo === TipoCampanha.WHATSAPP;

    const regrasCanal = whatsapp
      ? [
          'Use negrito do WhatsApp com UM asterisco (*assim*), nunca com dois.',
          'No máximo 600 caracteres e no máximo 3 emojis.',
          'Termine convidando a pessoa a responder a mensagem.',
        ]
      : [
          'Na primeira linha escreva "ASSUNTO: " seguido do assunto (até 60 caracteres).',
          'Depois, uma linha em branco e o corpo do e-mail em texto simples, sem markdown.',
          'NÃO inclua saudação (como "Olá, ...") nem assinatura ou despedida: o sistema adiciona essas partes.',
          'No máximo 900 caracteres no corpo e no máximo 2 emojis.',
        ];

    return [
      'Você é redator de marketing de uma loja virtual brasileira.',
      `Escreva UMA única mensagem de ${whatsapp ? 'WhatsApp' : 'e-mail'} com estas características:`,
      `- Tom: ${TOM[dto.tom]}`,
      `- Objetivo: ${OBJETIVO[dto.objetivo]}`,
      `- Produto: ${produto.nome}`,
      `- Categoria: ${produto.categoria?.nome ?? 'não informada'}`,
      `- Preço: ${preco}`,
      `- Características: ${caracteristicas}`,
      `- Observações do lojista: ${dto.observacoes?.trim() || 'nenhuma'}`,
      '',
      'Regras:',
      '- Responda SOMENTE com o texto da mensagem, sem introdução, sem opções e sem explicações.',
      '- Não invente preços, descontos ou prazos que não foram informados.',
      '- Não use marcadores como [LINK] ou [NOME].',
      ...regrasCanal.map((r) => `- ${r}`),
    ].join('\n');
  }

  private montarPromptImagem(
    dto: GerarMensagemDto,
    produto: {
      nome: string;
      precoAtual: unknown;
      categoria: { nome: string } | null;
      caracteristicas: {
        valor: string;
        caracteristica: { nome: string };
      }[];
    },
  ) {
    const preco = produto.precoAtual
      ? Number(produto.precoAtual).toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        })
      : 'não informado';

    const caracteristicas = produto.caracteristicas.length
      ? produto.caracteristicas
          .map((c) => `${c.caracteristica.nome}: ${c.valor}`)
          .join(', ')
      : 'não informadas';

    return `
Create a stunning, professional and eye-catching commercial advertisement using the exact product shown in reference image [1].

PRODUCT INFORMATION:
- Product: ${produto.nome}
- Category: ${produto.categoria?.nome ?? 'não informada'}
- Characteristics: ${caracteristicas}

CAMPAIGN DIRECTION:
- Tone: ${TOM[dto.tom]}
- Objective: ${OBJETIVO[dto.objetivo]}
- Store owner's instructions: ${dto.observacoes?.trim() || 'nenhuma'}

PRICE RULE:
- Do NOT display any price by default.
- Only display a price if the store owner's instructions explicitly request it.
- If a price is explicitly requested, use only this registered price: ${preco}.
- Never invent prices, discounts, percentages, payment conditions or promotional offers.

VISUAL REQUIREMENTS:
- Preserve the exact original product packaging, shape, proportions, colors, logo, label and brand identity.
- Never redesign, replace or distort the product.
- Create a visually striking advertising composition with professional lighting, realistic shadows and an attractive background.
- Use colors and visual elements that match the product and campaign tone.
- Make the product the main visual focus.
- Use attractive graphic elements, visual hierarchy and short, persuasive advertising headlines.
- All text displayed in the image must be written in Brazilian Portuguese.
- Text must be clear, correctly spelled, readable and well positioned.
- The visual style must reflect the campaign objective and tone.
- Do not invent product benefits, specifications or claims.
- Do not add fake logos, watermarks or unsupported information.

Create a polished, premium-quality advertisement suitable for both WhatsApp and email.
`;
  }

  private separarEmail(texto: string) {
    const [primeira, ...resto] = texto.split('\n');
    const achou = primeira.match(/^[\s*_#]*assunto[\s*_]*:[\s*_]*(.*)$/i);

    if (achou) {
      return {
        assunto: achou[1]
          .replace(/[*_]+$/, '')
          .trim()
          .slice(0, 200),
        conteudo: resto.join('\n').trim(),
      };
    }

    return { assunto: null, conteudo: texto };
  }
}
