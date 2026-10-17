import { Injectable, NotFoundException } from '@nestjs/common';
import { StatusPedido } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const STATUS_VALIDOS = [
  StatusPedido.PAGO,
  StatusPedido.ENVIADO,
  StatusPedido.ENTREGUE,
];

const PESO_COLABORATIVO = 0.7;
const PESO_CATEGORIA = 1 - PESO_COLABORATIVO;

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
    if (!cliente) throw new NotFoundException('Cliente não encontrado');

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
            valor: true,
            caracteristica: { select: { nome: true } },
          },
        },
      },
    });

    // Quantos produtos comprados o cliente tem em cada categoria
    const porCategoria = new Map<string, number>();
    for (const p of produtos) {
      if (comprados.has(p.id) && p.categoriaId) {
        porCategoria.set(
          p.categoriaId,
          (porCategoria.get(p.categoriaId) ?? 0) + 1,
        );
      }
    }

    const candidatos = produtos
      .filter((p) => p.ativo && !comprados.has(p.id))
      .map((p) => {
        const compradoresP = clientesPorProduto.get(p.id) ?? new Set<string>();
        let colaborativo = 0;
        for (const comprado of comprados) {
          colaborativo += cosseno(
            compradoresP,
            clientesPorProduto.get(comprado) ?? new Set(),
          );
        }
        const notaCategoria = p.categoriaId
          ? (porCategoria.get(p.categoriaId) ?? 0) / comprados.size
          : 0;
        return { p, colaborativo, notaCategoria };
      });

    const maximo = Math.max(...candidatos.map((c) => c.colaborativo), 0);

    return candidatos
      .map(({ p, colaborativo, notaCategoria }) => {
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
            PESO_COLABORATIVO * colabNorm + PESO_CATEGORIA * notaCategoria,
          ),
          scoreColaborativo: arredondar(colabNorm),
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
      select: { id: true, categoriaId: true },
    });
    if (!produto) throw new NotFoundException('Produto não encontrado');

    const { produtosPorCliente, clientesPorProduto } =
      await this.carregarCompras(contaId);

    const compradores = clientesPorProduto.get(produtoId) ?? new Set<string>();

    const [clientes, produtos] = await Promise.all([
      this.prisma.cliente.findMany({
        where: { contaId },
        select: { id: true, nome: true, email: true, aceitaMarketing: true },
      }),
      this.prisma.produto.findMany({
        where: { contaId },
        select: { id: true, categoriaId: true },
      }),
    ]);

    const categoriaPorProduto = new Map(
      produtos.map((p) => [p.id, p.categoriaId]),
    );

    const candidatos = clientes
      .filter((c) => !compradores.has(c.id))
      .map((c) => {
        const owned = produtosPorCliente.get(c.id) ?? new Set<string>();
        if (owned.size === 0) return null;

        let colaborativo = 0;
        let naCategoria = 0;
        for (const o of owned) {
          colaborativo += cosseno(
            compradores,
            clientesPorProduto.get(o) ?? new Set(),
          );
          if (
            produto.categoriaId &&
            categoriaPorProduto.get(o) === produto.categoriaId
          ) {
            naCategoria++;
          }
        }
        return { c, colaborativo, categoria: naCategoria / owned.size };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    const maximo = Math.max(...candidatos.map((x) => x.colaborativo), 0);

    return candidatos
      .map(({ c, colaborativo, categoria }) => {
        const colabNorm = maximo > 0 ? colaborativo / maximo : 0;
        return {
          id: c.id,
          nome: c.nome,
          email: c.email,
          aceitaMarketing: c.aceitaMarketing,
          score: arredondar(
            PESO_COLABORATIVO * colabNorm + PESO_CATEGORIA * categoria,
          ),
          colaborativo: arredondar(colabNorm),
          categoria: arredondar(categoria),
        };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limite);
  }
}
