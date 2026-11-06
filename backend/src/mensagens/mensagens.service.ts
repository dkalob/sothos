import { Injectable, NotFoundException } from '@nestjs/common';
import { StatusExecucaoIa, TipoCampanha } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { GeminiService } from '../ia/gemini.service';
import type { ResultadoTexto } from '../ia/gemini.service';
import { AtualizarMensagemDto, GerarMensagemDto } from './dto/mensagens.dto';

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
          select: { valor: true, caracteristica: { select: { nome: true } } },
        },
      },
    });

    if (!produto) throw new NotFoundException('Produto não encontrado');

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
          tipo: dto.tipo,
          titulo: `${OBJETIVO[dto.objetivo]} - ${produto.nome}`.slice(0, 160),
          tom: dto.tom,
          objetivo: dto.objetivo,
          observacoes: dto.observacoes ?? null,
          assunto,
          conteudo,
          imagemUrl: produto.imagem, // por enquanto, a foto do produto
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
      select: { id: true }
    })

    if (!existente) throw new NotFoundException("Mensagem não encontrada")
     
    return this.prisma.mensagemIa.update({
      where: { id },
      data: {
        conteudo: dto.conteudo,
        ...(dto.assunto !== undefined && { assunto: dto.assunto.trim() || null }),
        ...(dto.textoBotao !== undefined && {
          textoBotao: dto.textoBotao.trim() || null,
        }),
      },
    })  
  }

  async listar(contaId: string, tipo?: TipoCampanha) {
    const existente = await this.prisma.mensagemIa.findMany({
      where: { contaId, ...(tipo && { tipo}) }
    })

    if (!existente) throw new NotFoundException("Mensagem não encontrada")

    return this.prisma.mensagemIa.findMany({
      where: { contaId, ...(tipo && { tipo }) },
      select: {
        id: true,
        titulo: true,
        tipo: true,
        assunto: true,
        conteudo: true,
        imagemUrl: true,
        criadoEm: true,
      },
      orderBy: { criadoEm: 'desc' },
    });  
  }

  private montarPrompt(
    dto: GerarMensagemDto,
    produto: {
      nome: string;
      precoAtual: unknown;
      categoria: { nome: string } | null;
      caracteristicas: { valor: string; caracteristica: { nome: string } }[];
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

  private separarEmail(texto: string) {
    const [primeira, ...resto] = texto.split('\n');
    const achou = primeira.match(/^[\s*_#]*assunto[\s*_]*:[\s*_]*(.*)$/i);

    if (achou) {
      return {
        assunto: achou[1].replace(/[*_]+$/, '').trim().slice(0, 200),
        conteudo: resto.join('\n').trim(),
      };
    }

    return { assunto: null, conteudo: texto };
  }
}