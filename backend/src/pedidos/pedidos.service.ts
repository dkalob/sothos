import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PedidoDto } from './dto/pedido.dto';
import { StatusPedido } from '@prisma/client';
import { RfmService } from '../rfm/rfm.service';

@Injectable()
export class PedidosService {
  private readonly logger = new Logger(PedidosService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly rfmService: RfmService,
  ) {}

  async create(contaId: string, dto: PedidoDto) {
    const pedido = await this.prisma.$transaction(async (tx) => {
      const valorProdutos = dto.itens.reduce(
        (total, item) =>
          total + item.precoUnitario * item.quantidade,
        0,
      );

      const valorTotal =
        valorProdutos + dto.valorFrete - dto.valorDesconto;

      const pedidoCriado = await tx.pedido.create({
        data: {
          contaId,
          clienteId: dto.clienteId,
          numero: dto.numero,
          status: dto.status as StatusPedido,
          valorProdutos,
          valorFrete: dto.valorFrete,
          valorDesconto: dto.valorDesconto,
          valorTotal,
          realizadoEm: new Date(dto.realizadoEm),
          itens: {
            create: dto.itens.map((item) => ({
              produtoId: item.produtoId,
              nomeProduto: item.nomeProduto,
              sku: item.sku,
              quantidade: item.quantidade,
              precoUnitario: item.precoUnitario,
              valorTotal: item.precoUnitario * item.quantidade,
            })),
          },
        },
        include: {
          itens: true,
        },
      });

      await this.atualizarRfm(contaId);

      return pedidoCriado;
    });

    return pedido;
  }

  async findAll(contaId: string) {
    const pedidos = await this.prisma.pedido.findMany({
      where: {
        contaId,
      },
      orderBy: {
        realizadoEm: 'desc',
      },
      include: {
        cliente: {
          select: {
            nome: true,
          },
        },
        itens: {
          select: {
            nomeProduto: true,
            quantidade: true,
            precoUnitario: true,
          },
        },
      },
    });

    return pedidos.map((pedido) => ({
      id: pedido.id,
      numero: pedido.numero,

      cliente: pedido.cliente?.nome ?? 'Cliente não informado',

      produto: pedido.itens
        .map((item) => `${item.nomeProduto} (${item.quantidade})`)
        .join(', '),

      valor: Number(pedido.valorTotal),

      data: pedido.realizadoEm,

      status: pedido.status,
    }));
  }

  async findOne(contaId: string, id: string) {
    const pedido = await this.prisma.pedido.findFirst({
      where: {
        id,
        contaId,
      },

      include: {
        cliente: {
          select: {
            id: true,
            nome: true,
            cpf: true,
          },
        },

        itens: true,
      },
    });

    if (!pedido) {
      throw new NotFoundException('Pedido não encontrado.');
    }

    return {
      id: pedido.id,

      clienteId: pedido.clienteId,

      numero: pedido.numero,

      status: pedido.status,

      realizadoEm: pedido.realizadoEm,

      valorProdutos: Number(pedido.valorProdutos),

      valorFrete: Number(pedido.valorFrete),

      valorDesconto: Number(pedido.valorDesconto),

      valorTotal: Number(pedido.valorTotal),

      itens: pedido.itens.map((item) => ({
        id: item.id,

        produtoId: item.produtoId,

        nomeProduto: item.nomeProduto,

        sku: item.sku,

        quantidade: item.quantidade,

        precoUnitario: Number(item.precoUnitario),

        valorTotal: Number(item.valorTotal),
      })),
    };
  }

  async update(contaId: string, id: string, dto: PedidoDto) {
    const pedidoAtualizado = await this.prisma.$transaction(async (tx) => {
      const pedido = await tx.pedido.findFirst({
        where: { id, contaId },
      });

      if (!pedido) {
        throw new NotFoundException('Pedido não encontrado.');
      }

      if (!dto.itens || dto.itens.length === 0) {
        throw new BadRequestException('O pedido precisa ter pelo menos um item.');
      }

      const valorProdutos = dto.itens.reduce((total, item) => {
        return total + item.precoUnitario * item.quantidade;
      }, 0);

      const valorTotal = valorProdutos + dto.valorFrete - dto.valorDesconto;

      await tx.itemPedido.deleteMany({ where: { pedidoId: id } });

      return tx.pedido.update({
        where: { id },
        data: {
          clienteId: dto.clienteId,
          numero: dto.numero,
          status: dto.status as StatusPedido,
          valorProdutos,
          valorFrete: dto.valorFrete,
          valorDesconto: dto.valorDesconto,
          valorTotal,
          realizadoEm: new Date(dto.realizadoEm),
          itens: {
            create: dto.itens.map((item) => ({
              produtoId: item.produtoId,
              nomeProduto: item.nomeProduto,
              sku: item.sku,
              quantidade: item.quantidade,
              precoUnitario: item.precoUnitario,
              valorTotal: item.precoUnitario * item.quantidade,
            })),
          },
        },
        include: { itens: true },
      });
    });

    
    await this.atualizarRfm(contaId);

    return pedidoAtualizado;
  }

  async remove(contaId: string, id: string) {
    const pedido = await this.prisma.pedido.findFirst({
      where: {
        id,
        contaId,
      },
    });

    if (!pedido) {
      throw new NotFoundException('Pedido não encontrado.');
    }

    await this.prisma.pedido.delete({
      where: {
        id,
      },
    });

    await this.atualizarRfm(contaId);

    return {
      message: 'Pedido excluído com sucesso.',
    };
  }

  async atualizarRfm(contaId: string) {
    try {
      await this.rfmService.recalcular(contaId);
    } catch (error) {
      this.logger.error(`Falha ao recalcular RFM da conta ${contaId}`, error);
    }
  }

  
  async getCard(contaId: string) {
    const agora = new Date();

    const inicioMesAtual = new Date(
      agora.getFullYear(),
      agora.getMonth(),
      1,
    );

    const inicioProximoMes = new Date(
      agora.getFullYear(),
      agora.getMonth() + 1,
      1,
    );

    const inicioMesAnterior = new Date(
      agora.getFullYear(),
      agora.getMonth() - 1,
      1,
    );

    const statusValidos = [
      StatusPedido.PAGO,
      StatusPedido.ENVIADO,
      StatusPedido.ENTREGUE,
    ];

    const calcularTrend = (atual: number, anterior: number) => {
      if (anterior === 0) {
        return {
          direction: 'up' as const,
          value: atual === 0 ? '0%' : 'Novo',
        };
      }

      const variacao = ((atual - anterior) / anterior) * 100;

      return {
        direction: variacao >= 0 ? 'up' as const : 'down' as const,
        value: `${variacao > 0 ? '+' : ''}${variacao.toFixed(1)}%`,
      };
    };

    // 1. PEDIDOS REALIZADOS

    const [pedidosMes, pedidosMesAnterior] = await Promise.all([
      this.prisma.pedido.count({
        where: {
          contaId,
          realizadoEm: {
            gte: inicioMesAtual,
            lt: inicioProximoMes,
          },
        },
      }),

      this.prisma.pedido.count({
        where: {
          contaId,
          realizadoEm: {
            gte: inicioMesAnterior,
            lt: inicioMesAtual,
          },
        },
      }),
    ]);

    // Clientes distintos que compraram neste mês
    const clientesMes = await this.prisma.pedido.findMany({
      where: {
        contaId,
        clienteId: { not: null },
        status: { in: statusValidos },
        realizadoEm: {
          gte: inicioMesAtual,
          lt: inicioProximoMes,
        },
      },
      select: {
        clienteId: true,
      },
      distinct: ['clienteId'],
    });

    const clientesMesAnterior = await this.prisma.pedido.findMany({
      where: {
        contaId,
        clienteId: { not: null },
        status: { in: statusValidos },
        realizadoEm: {
          gte: inicioMesAnterior,
          lt: inicioMesAtual,
        },
      },
      select: {
        clienteId: true,
      },
      distinct: ['clienteId'],
    });

    const idsClientesMes = clientesMes
      .map((pedido) => pedido.clienteId)
      .filter((id): id is string => id !== null);

    // Clientes que já haviam comprado antes do mês atual
    const clientesAnteriores = idsClientesMes.length
      ? await this.prisma.pedido.findMany({
          where: {
            contaId,
            clienteId: { in: idsClientesMes },
            status: { in: statusValidos },
            realizadoEm: {
              lt: inicioMesAtual,
            },
          },
          select: {
            clienteId: true,
          },
          distinct: ['clienteId'],
        })
      : [];

    const idsRecorrentes = new Set(
      clientesAnteriores.map((pedido) => pedido.clienteId),
    );

    const clientesRecorrentes = idsClientesMes.filter(
      (id) => idsRecorrentes.has(id),
    ).length;

    const clientesNovos =
      idsClientesMes.length - clientesRecorrentes;

    // 2. CLIENTES QUE REALIZARAM COMPRA NO MÊS

    const totalClientes = await this.prisma.cliente.count({
      where: { contaId },
    });

    const quantidadeClientesCompradores = idsClientesMes.length;

    const percentualClientes =
      totalClientes > 0
        ? (quantidadeClientesCompradores / totalClientes) * 100
        : 0;

    // 3. VALOR ARRECADADO E PEDIDOS PENDENTES

    const [faturamento, pedidosPendentes] = await Promise.all([
      this.prisma.pedido.aggregate({
        where: {
          contaId,
          status: { in: statusValidos },
          realizadoEm: {
            gte: inicioMesAtual,
            lt: inicioProximoMes,
          },
        },
        _sum: {
          valorTotal: true,
        },
      }),

      this.prisma.pedido.aggregate({
        where: {
          contaId,
          status: StatusPedido.PENDENTE,
          realizadoEm: {
            gte: inicioMesAtual,
            lt: inicioProximoMes,
          },
        },
        _sum: {
          valorTotal: true,
        },
      }),
    ]);

    const valorArrecadado = Number(
      faturamento._sum.valorTotal ?? 0,
    );

    const valorPendente = Number(
      pedidosPendentes._sum.valorTotal ?? 0,
    );

    // Faturamento do mês anterior para calcular a tendência
    const faturamentoAnterior = await this.prisma.pedido.aggregate({
      where: {
        contaId,
        status: { in: statusValidos },
        realizadoEm: {
          gte: inicioMesAnterior,
          lt: inicioMesAtual,
        },
      },
      _sum: {
        valorTotal: true,
      },
    });

    const valorArrecadadoAnterior = Number(
      faturamentoAnterior._sum.valorTotal ?? 0,
    );

    // 4. PRODUTOS ADQUIRIDOS EM COMPRAS

    const [produtosVendidos, produtosVendidosAnterior, totalProdutos] =
      await Promise.all([
        this.prisma.itemPedido.aggregate({
          where: {
            pedido: {
              is: {
                contaId,
                status: { in: statusValidos },
                realizadoEm: {
                  gte: inicioMesAtual,
                  lt: inicioProximoMes,
                },
              },
            },
            produto: {
              is: { contaId },
            },
          },
          _sum: {
            quantidade: true,
          },
        }),

        this.prisma.itemPedido.aggregate({
          where: {
            pedido: {
              is: {
                contaId,
                status: { in: statusValidos },
                realizadoEm: {
                  gte: inicioMesAnterior,
                  lt: inicioMesAtual,
                },
              },
            },
            produto: {
              is: { contaId },
            },
          },
          _sum: {
            quantidade: true,
          },
        }),

        this.prisma.produto.count({
          where: { contaId },
        }),
      ]);

    const quantidadeProdutosVendidos =
      produtosVendidos._sum.quantidade ?? 0;

    const quantidadeProdutosVendidosAnterior =
      produtosVendidosAnterior._sum.quantidade ?? 0;

    // Produtos diferentes que tiveram venda no mês
    const produtosDistintos = await this.prisma.itemPedido.findMany({
      where: {
        pedido: {
          is: {
            contaId,
            status: { in: statusValidos },
            realizadoEm: {
              gte: inicioMesAtual,
              lt: inicioProximoMes,
            },
          },
        },
        produto: {
          is: { contaId },
        },
      },
      select: {
        produtoId: true,
      },
      distinct: ['produtoId'],
    });

    const percentualProdutos =
      totalProdutos > 0
        ? (produtosDistintos.length / totalProdutos) * 100
        : 0;

    // RETORNO DOS CARDS

    return {
      pedidos: {
        value: pedidosMes,
        novosClientes: clientesNovos,
        clientesRecorrentes,
        trend: calcularTrend(
          pedidosMes,
          pedidosMesAnterior,
        ),
      },

      clientesCompradores: {
        value: Number(percentualClientes.toFixed(1)),
        quantidade: quantidadeClientesCompradores,
        total: totalClientes,
        trend: calcularTrend(
          quantidadeClientesCompradores,
          clientesMesAnterior.length,
        ),
      },

      faturamento: {
        value: valorArrecadado,
        pendente: valorPendente,
        trend: calcularTrend(
          valorArrecadado,
          valorArrecadadoAnterior,
        ),
      },

      produtos: {
        value: quantidadeProdutosVendidos,
        totalProdutos,
        percentual: Number(percentualProdutos.toFixed(1)),
        trend: calcularTrend(
          quantidadeProdutosVendidos,
          quantidadeProdutosVendidosAnterior,
        ),
      },
    };
  }

}
