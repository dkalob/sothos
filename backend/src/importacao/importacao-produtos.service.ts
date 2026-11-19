import { Injectable, Logger } from '@nestjs/common';
import {
  StatusSincronizacao,
  TipoSincronizacao,
  TipoCaracteristica,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CAMPOS_PRODUTO, DefinicaoCampo, normalizarTexto } from './campos';
import {
  categoriaFinal,
  converterBooleano,
  converterValor,
} from './conversores';
import {
  LinhaCsv,
  lerCsv,
  montarPrevia,
  obterLojaCsv,
  Previa,
  validarMapeamento,
} from './leitor-csv';

// Limite de erros/avisos devolvidos na resposta (o total sempre é informado)
const MAX_OCORRENCIAS = 200;

type Ocorrencia = { linha?: number; produto?: string; mensagem: string };

// Um produto já montado a partir das suas linhas (variações)
type ProdutoConvertido = {
  linhaInicial: number;
  nome: string;
  categoria: string | null;
  preco: string | null;
  imagem: string | null;
  sku: string | null;
  ativo: boolean | null;
  caracteristicas: {
    caracteristicaId: string;
    valor: string;
  }[];
};

export type ResultadoImportacaoProdutos = {
  totalLinhas: number;
  produtosNovos: number;
  produtosAtualizados: number;
  produtosIgnorados: number;
  categoriasNovas: number;
  totalErros: number;
  totalAvisos: number;
  erros: Ocorrencia[];
  avisos: Ocorrencia[];
};

@Injectable()
export class ImportacaoProdutosService {
  private readonly logger = new Logger(ImportacaoProdutosService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Prévia: não grava nada
  async gerarPrevia(contaId: string, arquivo: Buffer): Promise<Previa<string>> {
  const caracteristicas = await this.prisma.caracteristicaProduto.findMany({
    where: {
      contaId,
      ativo: true,
    },
    select: {
      id: true,
      nome: true,
    },
  });

  const camposDinamicos: DefinicaoCampo<string>[] = caracteristicas.map(
    (caracteristica) => ({
      campo: `caracteristica_${caracteristica.id}`,
      rotulo: caracteristica.nome,
      obrigatorio: false,
      aliases: [caracteristica.nome],
    }),
  );

  const definicoes: DefinicaoCampo<string>[] = [
    ...CAMPOS_PRODUTO,
    ...camposDinamicos,
  ];

  return montarPrevia(lerCsv(arquivo), definicoes);
}

  // Importa o catálogo. Cada linha da planilha é uma variação (cor/tamanho);
  // as linhas com o mesmo identificador viram UM produto no Sothos.
  // Produto que já existe (mesmo nome) é atualizado, não duplicado.
  async executar(
  contaId: string,
  arquivo: Buffer,
  mapeamentoJson: string,
): Promise<ResultadoImportacaoProdutos> {
  const { colunas, linhas } = lerCsv(arquivo);

  const caracteristicas = await this.prisma.caracteristicaProduto.findMany({
    where: { contaId, ativo: true },
    select: {
      id: true,
      nome: true,
      tipo: true,
    },
  });

  const camposDinamicos: DefinicaoCampo<string>[] = caracteristicas.map(
    (caracteristica) => ({
      campo: `caracteristica_${caracteristica.id}`,
      rotulo: caracteristica.nome,
      obrigatorio: false,
      aliases: [caracteristica.nome],
    }),
  );

  const definicoes: DefinicaoCampo<string>[] = [
    ...CAMPOS_PRODUTO,
    ...camposDinamicos,
  ];

  const mapeamento = validarMapeamento(
    mapeamentoJson,
    colunas,
    definicoes,
  );

  const indice = new Map(colunas.map((c, i) => [c, i]));

  const ler = (linha: LinhaCsv, campo: string) => {
    const coluna = mapeamento[campo];
    if (!coluna) return '';

    return (linha.valores[indice.get(coluna)!] ?? '').trim();
  };

  const erros: Ocorrencia[] = [];
  const avisos: Ocorrencia[] = [];
  const produtos: ProdutoConvertido[] = [];

  // Cada linha é processada individualmente.
  for (const linha of linhas) {
    const nome = ler(linha, 'nome');
    const problemas: string[] = [];

    if (!nome) {
      problemas.push('nome do produto vazio');
    } else if (nome.length > 200) {
      problemas.push('nome com mais de 200 caracteres');
    }

    const precoTexto = ler(linha, 'preco');
    const preco = precoTexto ? converterValor(precoTexto) : null;

    if (precoTexto && (preco === null || Number(preco) < 0)) {
      problemas.push(`preço inválido (${precoTexto})`);
    }

    const imagem = ler(linha, 'imagem') || null;

    if (imagem && imagem.length > 1000) {
      problemas.push('link da imagem muito longo');
    }

    if (problemas.length > 0) {
      erros.push({
        linha: linha.numero,
        produto: nome || undefined,
        mensagem: problemas.join('; '),
      });
      continue;
    }

    const ativoTexto = ler(linha, 'ativo');
    const ativo = ativoTexto ? converterBooleano(ativoTexto) : null;

    if (ativoTexto && ativo === null) {
      avisos.push({
        linha: linha.numero,
        produto: nome,
        mensagem: `valor de "mostrar na loja" não reconhecido (${ativoTexto}); não foi alterado`,
      });
    }

    const skuTexto = ler(linha, 'sku');

    const valoresCaracteristicas = caracteristicas
      .map((caracteristica) => ({
        caracteristicaId: caracteristica.id,
        valor: ler(
          linha,
          `caracteristica_${caracteristica.id}`,
        ),
      }))
      .filter((item) => item.valor !== '');

    produtos.push({
      linhaInicial: linha.numero,
      nome,
      categoria: categoriaFinal(ler(linha, 'categoria')),
      preco,
      imagem,
      sku: skuTexto ? skuTexto.slice(0, 80) : null,
      ativo,
      caracteristicas: valoresCaracteristicas,
    });
  }

  const resultado: ResultadoImportacaoProdutos = {
    totalLinhas: linhas.length,
    produtosNovos: 0,
    produtosAtualizados: 0,
    produtosIgnorados: linhas.length - produtos.length,
    categoriasNovas: 0,
    totalErros: 0,
    totalAvisos: 0,
    erros: [],
    avisos: [],
  };

  if (produtos.length === 0) {
    return this.finalizar(resultado, erros, avisos);
  }

  const loja = await obterLojaCsv(this.prisma, contaId);

  const sincronizacao = await this.prisma.sincronizacao.create({
    data: {
      lojaId: loja.id,
      tipo: TipoSincronizacao.MANUAL,
    },
  });

  try {
    const categoriaPorNome = await this.salvarCategorias(
      contaId,
      produtos,
      resultado,
    );

    for (const p of produtos) {
      const categoriaId = p.categoria
        ? categoriaPorNome.get(normalizarTexto(p.categoria)) ?? null
        : null;

      try {
        await this.prisma.$transaction(async (tx) => {
          // Cadastra opções novas para características do tipo OPCAO.
          for (const item of p.caracteristicas) {
            const caracteristica = caracteristicas.find(
              (c) => c.id === item.caracteristicaId,
            );

            if (caracteristica?.tipo !== TipoCaracteristica.OPCAO) {
              continue;
            }

            const opcaoExistente = await tx.caracteristicaOpcao.findFirst({
              where: {
                caracteristicaId: item.caracteristicaId,
                valor: item.valor,
              },
            });

            if (!opcaoExistente) {
              await tx.caracteristicaOpcao.create({
                data: {
                  caracteristicaId: item.caracteristicaId,
                  valor: item.valor,
                },
              });
            }
          }

          // Cria o produto com seus dados e a imagem.
          const criado = await tx.produto.create({
            data: {
              contaId,
              lojaId: loja.id,
              nome: p.nome,
              precoAtual: p.preco,
              imagem: p.imagem,
              categoriaId,
              sku: p.sku,
              ativo: p.ativo ?? undefined,
            },
            select: { id: true },
          });

          // Salva os valores das características do produto.
          if (p.caracteristicas.length > 0) {
            await tx.produtoCaracteristica.createMany({
              data: p.caracteristicas.map((item) => ({
                produtoId: criado.id,
                caracteristicaId: item.caracteristicaId,
                valor: item.valor,
              })),
            });
          }
        });

        resultado.produtosNovos++;
      } catch (erro) {
        this.logger.error(
          `Falha ao salvar produto ${p.nome}`,
          erro as Error,
        );

        resultado.produtosIgnorados++;

        erros.push({
          linha: p.linhaInicial,
          produto: p.nome,
          mensagem: 'não foi importado por um erro ao gravar no banco',
        });
      }
    }

    const processados = resultado.produtosNovos;

    await this.prisma.sincronizacao.update({
      where: { id: sincronizacao.id },
      data: {
        status:
          processados === 0
            ? StatusSincronizacao.FALHA
            : erros.length > 0
              ? StatusSincronizacao.PARCIAL
              : StatusSincronizacao.CONCLUIDA,
        finalizadaEm: new Date(),
        produtosProcessados: processados,
        mensagemErro:
          erros.length > 0
            ? `${erros.length} erro(s) na importação`
            : null,
      },
    });

    await this.prisma.lojaConectada.update({
      where: { id: loja.id },
      data: { ultimaSincronizacaoEm: new Date() },
    });
  } catch (erro) {
    await this.prisma.sincronizacao
      .update({
        where: { id: sincronizacao.id },
        data: {
          status: StatusSincronizacao.FALHA,
          finalizadaEm: new Date(),
          mensagemErro: 'Falha inesperada durante a importação',
        },
      })
      .catch(() => undefined);

    throw erro;
  }

  return this.finalizar(resultado, erros, avisos);
}

  // Cria as categorias que ainda não existem na conta (comparação sem
  // acento e sem maiúscula: "Conjuntos" e "CONJUNTOS" são a mesma).
  private async salvarCategorias(
    contaId: string,
    produtos: ProdutoConvertido[],
    resultado: ResultadoImportacaoProdutos,
  ): Promise<Map<string, string>> {
    const existentes = await this.prisma.categoriaProduto.findMany({
      where: { contaId },
      select: { id: true, nome: true },
    });
    const idPorNome = new Map(existentes.map((c) => [normalizarTexto(c.nome), c.id]));

    for (const p of produtos) {
      if (!p.categoria) continue;
      const chave = normalizarTexto(p.categoria);
      if (idPorNome.has(chave)) continue;

      const criada = await this.prisma.categoriaProduto.create({
        data: { contaId, nome: p.categoria },
        select: { id: true },
      });
      idPorNome.set(chave, criada.id);
      resultado.categoriasNovas++;
    }
    return idPorNome;
  }

  async gerarModeloCsv(contaId: string): Promise<string[]> {
  const caracteristicas = await this.prisma.caracteristicaProduto.findMany({
    where: {
      contaId,
      ativo: true,
    },
    select: {
      nome: true,
    },
    orderBy: {
      nome: 'asc',
    },
  });

  return [
    ...CAMPOS_PRODUTO.map((campo) => campo.rotulo),
    ...caracteristicas.map((caracteristica) => caracteristica.nome),
  ];
}

  private finalizar(
    resultado: ResultadoImportacaoProdutos,
    erros: Ocorrencia[],
    avisos: Ocorrencia[],
  ): ResultadoImportacaoProdutos {
    resultado.totalErros = erros.length;
    resultado.totalAvisos = avisos.length;
    resultado.erros = erros.slice(0, MAX_OCORRENCIAS);
    resultado.avisos = avisos.slice(0, MAX_OCORRENCIAS);
    return resultado;
  }
}