import { BadRequestException, Injectable } from '@nestjs/common';
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
      id: pedido.numero ?? pedido.id,

      cliente: pedido.cliente?.nome ?? 'Cliente não informado',

      produto: pedido.itens
        .map((item) => `${item.nomeProduto} (${item.quantidade})`)
        .join(', '),

      valor: Number(pedido.valorTotal),

      data: pedido.realizadoEm,

      status: pedido.status,
    }));
  }
}
