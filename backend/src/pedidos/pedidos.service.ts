import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PedidoDto } from './dto/pedido.dto';
import { StatusPedido } from '@prisma/client';

@Injectable()
export class PedidosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(contaId: string, dto: PedidoDto) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Calcula o valor dos produtos
      const valorProdutos = dto.itens.reduce((total, item) => {
        return total + item.precoUnitario * item.quantidade;
      }, 0);

      // 2. Calcula o valor total do pedido
      const valorTotal = valorProdutos + dto.valorFrete - dto.valorDesconto;

      // 3. Cria o pedido
      const pedido = await tx.pedido.create({
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

      return pedido;
    });
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
      throw new NotFoundException(
        'Pedido não encontrado.',
      );
    }

    return {
      id: pedido.id,

      clienteId: pedido.clienteId,

      numero: pedido.numero,

      status: pedido.status,

      realizadoEm: pedido.realizadoEm,

      valorProdutos: Number(
        pedido.valorProdutos,
      ),

      valorFrete: Number(
        pedido.valorFrete,
      ),

      valorDesconto: Number(
        pedido.valorDesconto,
      ),

      valorTotal: Number(
        pedido.valorTotal,
      ),

      itens: pedido.itens.map((item) => ({
        id: item.id,

        produtoId: item.produtoId,

        nomeProduto: item.nomeProduto,

        sku: item.sku,

        quantidade: item.quantidade,

        precoUnitario: Number(
          item.precoUnitario,
        ),

        valorTotal: Number(
          item.valorTotal,
        ),
      })),
    };
  }

  async update(contaId: string, id: string, dto: PedidoDto, ) {
    return this.prisma.$transaction(async (tx) => {
      const pedido = await tx.pedido.findFirst({
        where: {
          id,
          contaId,
        },
      });

      if (!pedido) {
        throw new NotFoundException(
          'Pedido não encontrado.',
        );
      }

      if (!dto.itens || dto.itens.length === 0) {
        throw new BadRequestException(
          'O pedido precisa ter pelo menos um item.',
        );
      }

      const valorProdutos = dto.itens.reduce(
        (total, item) => {
          return (
            total +
            item.precoUnitario *
              item.quantidade
          );
        },
        0,
      );

      const valorTotal =
        valorProdutos +
        dto.valorFrete -
        dto.valorDesconto;

      await tx.itemPedido.deleteMany({
        where: {
          pedidoId: id,
        },
      });

      const pedidoAtualizado =
        await tx.pedido.update({
          where: {
            id,
          },

          data: {
            clienteId: dto.clienteId,
            numero: dto.numero,

            status:
              dto.status as StatusPedido,

            valorProdutos,

            valorFrete:
              dto.valorFrete,

            valorDesconto:
              dto.valorDesconto,

            valorTotal,

            realizadoEm:
              new Date(dto.realizadoEm),

            itens: {
              create: dto.itens.map(
                (item) => ({
                  produtoId:
                    item.produtoId,

                  nomeProduto:
                    item.nomeProduto,

                  sku:
                    item.sku,

                  quantidade:
                    item.quantidade,

                  precoUnitario:
                    item.precoUnitario,

                  valorTotal:
                    item.precoUnitario *
                    item.quantidade,
                }),
              ),
            },
          },

          include: {
            itens: true,
          },
        });

      return pedidoAtualizado;
    });
  }

  async remove(contaId: string, id: string, ) {
    const pedido =
      await this.prisma.pedido.findFirst({
        where: {
          id,
          contaId,
        },
      });

    if (!pedido) {
      throw new NotFoundException(
        'Pedido não encontrado.',
      );
    }

    await this.prisma.pedido.delete({
      where: {
        id,
      },
    });

    return {
      message:
        'Pedido excluído com sucesso.',
    };
  }

}
