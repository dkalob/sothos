import { Injectable, NotFoundException } from '@nestjs/common';
import { StatusPedido } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

/* 
1. ASSOCIAR CLIENTES
  O objetivo é selecionar um cliente e recomendar produtos que ele ainda não comprou.

  Cálculo colaborativo
    Busca todos os produtos que o cliente selecionado já comprou em pedidos com status válido.
    Todos os outros produtos cadastrados são considerados candidatos.
    Para cada produto candidato, identifica os clientes que já o compraram.
    Será feita a comparação do cosseno entre os produtos candidatos e os que cliente ja comprou, 
    se for mais de 1 soma todos (não importa se passar de 1,0 pois será convertido)
    A fórmula do cosseno entre dois produtos é:

    Similaridade(P1, P2) = produtos em comum / raiz (compradores de P1 × compradores de P2)

    Se não houver produtos em comum, a similaridade será zero.
    Exemplo: existem os produtos A, B, C, D , E . O cliente escolhido comprou A e D. 
    Será feita o cosseno de A -> B, D -> B e esse valor é somado. 
    Depois A -> C e D -> C, valor é somado e atribuido ao produto que está sendo comparado. 

    A soma das similaridades pode ser maior que 1. 
    Por isso, o algoritmo normaliza os resultados dividindo a soma de cada candidato pela maior soma
    encontrada entre os candidatos.

  Cálculo das características
    Para cada produto candidato, o sistema compara suas características com as dos produtos que o cliente escolhido já comprou.

    A similaridade entre dois produtos é calculada por:

    Similaridade = características iguais / total características comparáveis e preenchidas

    Depois, o sistema calcula a média das similaridades entre o candidato e os produtos do histórico do cliente.

  Cálculo da categoria
    O sistema verifica quantos produtos comprados pelo cliente pertencem à categoria do produto candidato.

    Nota de categoria = produtos comprados na categoria do candidato / total de produtos comprados pelo cliente

    Essa nota é atribuída ao produto candidato.

  Cálculo final
    O sistema combina as três notas:

    Nota final = 0,5 × colaborativo normalizado + 0,3 × características + 0,2 × categoria

    Os produtos são ordenados da maior para a menor nota, e os que o cliente já comprou não são exibidos.

2. ASSOCIAR PRODUTOS
O objetivo é selecionar um produto e identificar clientes que ainda não o compraram, mas que apresentam afinidade com ele.

  Cálculo colaborativo
    Busca os clientes que já compraram o produto selecionado.
    Exclui esses clientes da lista de candidatos.
    Para cada cliente candidato, identifica os produtos que ele já comprou.
    Compara os compradores do produto selecionado com os compradores de cada produto do histórico do candidato.
    Soma as similaridades calculadas para o candidato.
    A fórmula do cosseno entre dois produtos é:

    Similaridade(P1, P2) = clientes em comum / raiz (compradores de P1 × compradores de P2)

   Se não houver clientes em comum, a similaridade será zero.

    A soma das similaridades de cada candidato é normalizada pela maior soma encontrada entre os candidatos.

  Cálculo das características
    O sistema compara as características do produto selecionado com as dos produtos comprados por cada cliente candidato.

    A similaridade entre dois produtos é:

    Similaridade = características iguais / total características comparáveis e preenchidas

    Depois, calcula a média das similaridades entre o produto selecionado e os produtos do histórico do candidato.

  Cálculo da categoria
    O sistema verifica quantos produtos comprados pelo cliente candidato pertencem à categoria do produto selecionado.

    Nota de categoria = produtos comprados na categoria do produto selecionado / total de produtos comprados pelo cliente

    Essa nota é atribuída ao cliente candidato.

  Cálculo final
  O sistema combina as três notas:

  Nota final = 0,5 × colaborativo normalizado + 0,3 × características + 0,2 × categoria

  Os clientes são ordenados da maior para a menor nota, e aqueles que já compraram o produto selecionado não são exibidos.

3. Interpretação dos resultados
A nota final varia de 0 a 1 e serve para classificar os candidatos.

Quanto maior a nota, maior a afinidade calculada pelo algoritmo segundo os três critérios. A nota não representa diretamente uma probabilidade de compra.
*/

const STATUS_VALIDOS = [
  StatusPedido.PAGO,
  StatusPedido.ENVIADO,
  StatusPedido.ENTREGUE,
];

const PESO_COLABORATIVO = 0.5;
const PESO_CARACTERISTICAS = 0.3;
const PESO_CATEGORIA = 0.2;

type CaracteristicaComparavel = {
  caracteristicaId: string;
  valor: string;
};

type ProdutoComparavel = {
  caracteristicas: CaracteristicaComparavel[];
};

function normalizarValor(valor: string): string {
  return valor.trim().replace(/\s+/g, ' ').toLowerCase();
}

// Similaridade entre as características de dois produtos.
// Cada característica comparável tem o mesmo peso.
function similaridadeCaracteristicas(
  a: ProdutoComparavel,
  b: ProdutoComparavel,
): number {
  const valoresB = new Map(
    b.caracteristicas.map((c) => [
      c.caracteristicaId,
      normalizarValor(c.valor),
    ]),
  );

  const comparaveis = a.caracteristicas.filter((c) => {
    const valorA = normalizarValor(c.valor);
    const valorB = valoresB.get(c.caracteristicaId);

    return valorB !== undefined && valorA !== '' && valorB !== '';
  });

  if (comparaveis.length === 0) return 0;

  const iguais = comparaveis.filter(
    (c) => normalizarValor(c.valor) === valoresB.get(c.caracteristicaId),
  ).length;

  return iguais / comparaveis.length;
}

// Média da similaridade do produto candidato com os produtos
// que o cliente já comprou.
function mediaSimilaridadeCaracteristicas(
  candidato: ProdutoComparavel,
  comprados: ProdutoComparavel[],
): number {
  if (comprados.length === 0) return 0;

  const soma = comprados.reduce(
    (total, produto) => total + similaridadeCaracteristicas(candidato, produto),
    0,
  );

  return soma / comprados.length;
}

// Similaridade do cosseno entre dois conjuntos de clientes:
// clientes em comum / raiz(tamanho A × tamanho B). Vai de 0 a 1.
function cosseno(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let comum = 0;
  for (const x of a) if (b.has(x)) comum++;
  return comum / Math.sqrt(a.size * b.size);
}

const arredondar = (n: number) => Number(n.toFixed(3));

@Injectable()
export class RecomendacoesService {
  constructor(private prisma: PrismaService) {}

  // Monta os dois "índices" de compras da conta, só com pedidos válidos
  private async carregarCompras(contaId: string) {
    const itens = await this.prisma.itemPedido.findMany({
      where: {
        produtoId: { not: null },
        pedido: {
          contaId,
          clienteId: { not: null },
          status: { in: STATUS_VALIDOS },
        },
      },
      select: {
        produtoId: true,
        pedido: { select: { clienteId: true } },
      },
    });

    const produtosPorCliente = new Map<string, Set<string>>();
    const clientesPorProduto = new Map<string, Set<string>>();

    for (const item of itens) {
      const produtoId = item.produtoId!;
      const clienteId = item.pedido.clienteId!;

      if (!produtosPorCliente.has(clienteId))
        produtosPorCliente.set(clienteId, new Set());
      if (!clientesPorProduto.has(produtoId))
        clientesPorProduto.set(produtoId, new Set());

      produtosPorCliente.get(clienteId)!.add(produtoId);
      clientesPorProduto.get(produtoId)!.add(clienteId);
    }

    return { produtosPorCliente, clientesPorProduto };
  }

  // ASSOCIAR CLIENTES: escolhe um cliente, recebe produtos
  async recomendarProdutos(contaId: string, clienteId: string, limite = 10) {
    const cliente = await this.prisma.cliente.findFirst({
      where: { id: clienteId, contaId },
    });

    if (!cliente) {
      throw new NotFoundException('Cliente não encontrado');
    }

    const { produtosPorCliente, clientesPorProduto } =
      await this.carregarCompras(contaId);

    const comprados = produtosPorCliente.get(clienteId) ?? new Set<string>();

    if (comprados.size === 0) return [];

    const produtos = await this.prisma.produto.findMany({
      where: { contaId },
      select: {
        id: true,
        nome: true,
        sku: true,
        imagem: true,
        precoAtual: true,
        categoriaId: true,
        ativo: true,
        categoria: { select: { nome: true } },
        caracteristicas: {
          select: {
            caracteristicaId: true,
            valor: true,
            caracteristica: { select: { nome: true } },
          },
        },
      },
    });

    const produtosComprados = produtos.filter((p) => comprados.has(p.id));

    // Conta quantos produtos comprados existem em cada categoria.
    const porCategoria = new Map<string, number>();

    for (const p of produtosComprados) {
      if (p.categoriaId) {
        porCategoria.set(
          p.categoriaId,
          (porCategoria.get(p.categoriaId) ?? 0) + 1,
        );
      }
    }

    // Exclui produtos já comprados e calcula as três pontuações.
    const candidatos = produtos
      .filter((p) => p.ativo && !comprados.has(p.id))
      .map((p) => {
        const compradoresP = clientesPorProduto.get(p.id) ?? new Set<string>();

        let colaborativo = 0;

        for (const comprado of comprados) {
          colaborativo += cosseno(
            compradoresP,
            clientesPorProduto.get(comprado) ?? new Set<string>(),
          );
        }

        const notaCaracteristicas = mediaSimilaridadeCaracteristicas(
          p,
          produtosComprados,
        );

        const notaCategoria = p.categoriaId
          ? (porCategoria.get(p.categoriaId) ?? 0) / comprados.size
          : 0;

        return {
          p,
          colaborativo,
          notaCaracteristicas,
          notaCategoria,
        };
      });

    const maximo = Math.max(...candidatos.map((c) => c.colaborativo), 0);

    return candidatos
      .map(({ p, colaborativo, notaCaracteristicas, notaCategoria }) => {
        const colabNorm = maximo > 0 ? colaborativo / maximo : 0;

        return {
          id: p.id,
          nome: p.nome,
          sku: p.sku,
          imagem: p.imagem,
          preco: p.precoAtual ? Number(p.precoAtual) : null,
          categoria: p.categoria?.nome ?? null,

          caracteristicas: Object.fromEntries(
            p.caracteristicas.map((c) => [c.caracteristica.nome, c.valor]),
          ),

          score: arredondar(
            PESO_COLABORATIVO * colabNorm +
              PESO_CARACTERISTICAS * notaCaracteristicas +
              PESO_CATEGORIA * notaCategoria,
          ),

          scoreColaborativo: arredondar(colabNorm),
          scoreCaracteristicas: arredondar(notaCaracteristicas),
          scoreCategoria: arredondar(notaCategoria),
        };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limite);
  }

  // ASSOCIAR PRODUTOS: escolhe um produto, recebe clientes
  async recomendarClientes(contaId: string, produtoId: string, limite = 10) {
    const produto = await this.prisma.produto.findFirst({
      where: { id: produtoId, contaId },
      select: {
        id: true,
        categoriaId: true,
        caracteristicas: {
          select: {
            caracteristicaId: true,
            valor: true,
          },
        },
      },
    });

    if (!produto) {
      throw new NotFoundException('Produto não encontrado');
    }

    const { produtosPorCliente, clientesPorProduto } =
      await this.carregarCompras(contaId);

    const compradores = clientesPorProduto.get(produtoId) ?? new Set<string>();

    const [clientes, produtos] = await Promise.all([
      this.prisma.cliente.findMany({
        where: { contaId },
        select: {
          id: true,
          nome: true,
          email: true,
          aceitaMarketing: true,
          pedidos: {
            where: { status: { in: STATUS_VALIDOS } },
            select: { valorTotal: true },
          },
          analises: {
            orderBy: { calculadoEm: 'desc' },
            take: 1,
            select: { segmento: { select: { nome: true } } },
          },
        },
      }),

      this.prisma.produto.findMany({
        where: { contaId },
        select: {
          id: true,
          categoriaId: true,
          caracteristicas: {
            select: {
              caracteristicaId: true,
              valor: true,
            },
          },
        },
      }),
    ]);

    const produtoPorId = new Map(produtos.map((p) => [p.id, p] as const));

    const categoriaPorProduto = new Map(
      produtos.map((p) => [p.id, p.categoriaId] as const),
    );

    const candidatos = clientes
      .filter((c) => !compradores.has(c.id))
      .map((c) => {
        const owned = produtosPorCliente.get(c.id) ?? new Set<string>();

        if (owned.size === 0) return null;

        let colaborativo = 0;
        let naCategoria = 0;
        let somaCaracteristicas = 0;
        let produtosEncontrados = 0;

        for (const o of owned) {
          colaborativo += cosseno(
            compradores,
            clientesPorProduto.get(o) ?? new Set<string>(),
          );

          const produtoComprado = produtoPorId.get(o);

          if (produtoComprado) {
            somaCaracteristicas += similaridadeCaracteristicas(
              produto,
              produtoComprado,
            );

            produtosEncontrados++;
          }

          if (
            produto.categoriaId &&
            categoriaPorProduto.get(o) === produto.categoriaId
          ) {
            naCategoria++;
          }
        }

        const notaCaracteristicas =
          produtosEncontrados > 0
            ? somaCaracteristicas / produtosEncontrados
            : 0;

        return {
          c,
          colaborativo,
          notaCategoria: naCategoria / owned.size,
          notaCaracteristicas,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    const maximo = Math.max(...candidatos.map((x) => x.colaborativo), 0);

    return candidatos
      .map(({ c, colaborativo, notaCategoria, notaCaracteristicas }) => {
        const colabNorm = maximo > 0 ? colaborativo / maximo : 0;

        return {
          id: c.id,
          nome: c.nome,
          email: c.email,
          aceitaMarketing: c.aceitaMarketing,
          segmento: c.analises[0]?.segmento?.nome ?? 'Leads',
          pedidos: c.pedidos.length,
          valor: c.pedidos.reduce(
            (total, p) => total + Number(p.valorTotal),
            0,
          ),

          score: arredondar(
            PESO_COLABORATIVO * colabNorm +
              PESO_CARACTERISTICAS * notaCaracteristicas +
              PESO_CATEGORIA * notaCategoria,
          ),

          scoreColaborativo: arredondar(colabNorm),
          scoreCaracteristicas: arredondar(notaCaracteristicas),
          scoreCategoria: arredondar(notaCategoria),
        };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limite);
  }
}
