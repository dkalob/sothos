import { Injectable, Logger } from '@nestjs/common';
import { StatusSincronizacao, TipoSincronizacao } from '@prisma/client';
import { createHash } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CAMPOS_PRODUTO, CampoProduto, normalizarTexto } from './campos';
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
  chave: string; // identificador ou nome: agrupa as variações
  linhaInicial: number;
  nome: string;
  categoria: string | null;
  preco: string; // preço atual: promocional quando houver
  sku: string | null;
  ativo: boolean | null; // null = não informado, não altera
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
  gerarPrevia(arquivo: Buffer): Previa<CampoProduto> {
    return montarPrevia(lerCsv(arquivo), CAMPOS_PRODUTO);
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
    const mapeamento = validarMapeamento(mapeamentoJson, colunas, CAMPOS_PRODUTO);
    const indice = new Map(colunas.map((c, i) => [c, i]));

    const ler = (linha: LinhaCsv, campo: CampoProduto) => {
      const coluna = mapeamento[campo];
      if (!coluna) return '';
      return (linha.valores[indice.get(coluna)!] ?? '').trim();
    };

    const erros: Ocorrencia[] = [];
    const avisos: Ocorrencia[] = [];

    // 1. Agrupa as linhas: pelo identificador, ou pelo nome se não houver
    const grupos = new Map<string, LinhaCsv[]>();
    for (const linha of linhas) {
      const chave = mapeamento.identificador
        ? ler(linha, 'identificador')
        : ler(linha, 'nome');
      if (!chave) {
        erros.push({
          linha: linha.numero,
          mensagem: mapeamento.identificador
            ? 'identificador do produto vazio'
            : 'nome do produto vazio',
        });
        continue;
      }
      const grupo = grupos.get(chave) ?? [];
      grupo.push(linha);
      grupos.set(chave, grupo);
    }

    // 2. Monta e valida cada produto
    const produtos: ProdutoConvertido[] = [];
    for (const [chave, grupo] of grupos) {
      const primeiraCom = (campo: CampoProduto) =>
        grupo.map((l) => ler(l, campo)).find((v) => v !== '') ?? '';

      const nome = primeiraCom('nome');
      const linhaInicial = grupo[0].numero;
      const problemas: string[] = [];

      if (!nome) problemas.push('nenhuma linha tem o nome do produto');
      else if (nome.length > 200) problemas.push('nome com mais de 200 caracteres');

      // Preço da primeira variação que tiver preço
      const linhaPreco = grupo.find((l) => ler(l, 'preco') !== '');
      const precoTexto = linhaPreco ? ler(linhaPreco, 'preco') : '';
      const preco = converterValor(precoTexto);
      if (!precoTexto) problemas.push('preço vazio');
      else if (preco === null || Number(preco) < 0) problemas.push(`preço inválido (${precoTexto})`);

      const promoTexto = linhaPreco ? ler(linhaPreco, 'precoPromocional') : '';
      const promo = promoTexto ? converterValor(promoTexto) : null;
      if (promoTexto && promo === null) {
        problemas.push(`preço promocional inválido (${promoTexto})`);
      }

      if (problemas.length > 0) {
        erros.push({ linha: linhaInicial, produto: nome || chave, mensagem: problemas.join('; ') });
        continue;
      }

      // Opcionais: problema aqui vira aviso, o produto entra mesmo assim
      const ativoTexto = primeiraCom('ativo');
      const ativo = ativoTexto ? converterBooleano(ativoTexto) : null;
      if (ativoTexto && ativo === null) {
        avisos.push({
          linha: linhaInicial,
          produto: nome,
          mensagem: `valor de "mostrar na loja" não reconhecido (${ativoTexto}); não foi alterado`,
        });
      }

      // SKU do produto só quando todas as variações têm o mesmo
      // (com cores e tamanhos, cada variação tem o seu SKU)
      const skus = new Set(grupo.map((l) => ler(l, 'sku')).filter(Boolean));
      const sku = skus.size === 1 ? [...skus][0].slice(0, 80) : null;

      produtos.push({
        chave,
        linhaInicial,
        nome,
        categoria: categoriaFinal(primeiraCom('categoria')),
        // Preço atual = o que a cliente paga hoje
        preco: promo !== null && Number(promo) > 0 ? promo : preco!,
        sku,
        ativo,
      });
    }

    const resultado: ResultadoImportacaoProdutos = {
      totalLinhas: linhas.length,
      produtosNovos: 0,
      produtosAtualizados: 0,
      produtosIgnorados: grupos.size - produtos.length,
      categoriasNovas: 0,
      totalErros: 0,
      totalAvisos: 0,
      erros: [],
      avisos: [],
    };

    if (produtos.length === 0) {
      return this.finalizar(resultado, erros, avisos);
    }

    // 3. Grava
    const loja = await obterLojaCsv(this.prisma, contaId);
    const sincronizacao = await this.prisma.sincronizacao.create({
      data: { lojaId: loja.id, tipo: TipoSincronizacao.MANUAL },
    });

    try {
      const categoriaPorNome = await this.salvarCategorias(contaId, produtos, resultado);

      // Produtos existentes da conta, por nome e pelo identificador da loja CSV
      const existentes = await this.prisma.produto.findMany({
        where: { contaId },
        select: { id: true, nome: true, lojaId: true, idExterno: true },
      });
      const idPorNome = new Map(existentes.map((p) => [normalizarTexto(p.nome), p.id]));
      const idPorExterno = new Map(
        existentes
          .filter((p) => p.lojaId === loja.id && p.idExterno)
          .map((p) => [p.idExterno!, p.id]),
      );

      for (const p of produtos) {
        const idExterno = this.idExterno(p);
        const categoriaId = p.categoria
          ? categoriaPorNome.get(normalizarTexto(p.categoria)) ?? null
          : null;

        const dados = {
          nome: p.nome,
          precoAtual: p.preco,
          // undefined = não altera o que já está cadastrado
          categoriaId: categoriaId ?? undefined,
          sku: p.sku ?? undefined,
          ativo: p.ativo ?? undefined,
        };

        try {
          const id = idPorExterno.get(idExterno) ?? idPorNome.get(normalizarTexto(p.nome));
          if (id) {
            await this.prisma.produto.update({ where: { id }, data: dados });
            resultado.produtosAtualizados++;
          } else {
            const criado = await this.prisma.produto.create({
              data: { contaId, lojaId: loja.id, idExterno, ...dados },
              select: { id: true },
            });
            // Evita duplicar se o mesmo nome aparecer de novo no arquivo
            idPorNome.set(normalizarTexto(p.nome), criado.id);
            idPorExterno.set(idExterno, criado.id);
            resultado.produtosNovos++;
          }
        } catch (erro) {
          this.logger.error(`Falha ao salvar produto ${p.nome}`, erro as Error);
          resultado.produtosIgnorados++;
          erros.push({
            linha: p.linhaInicial,
            produto: p.nome,
            mensagem: 'não foi importado por um erro ao gravar no banco',
          });
        }
      }

      const processados = resultado.produtosNovos + resultado.produtosAtualizados;
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
          mensagemErro: erros.length > 0 ? `${erros.length} erro(s) na importação` : null,
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

  // Identificador do produto na loja CSV: o da planilha, ou o nome
  private idExterno(p: ProdutoConvertido): string {
    const base = normalizarTexto(p.chave);
    return base.length <= 80 ? base : createHash('sha1').update(base).digest('hex');
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