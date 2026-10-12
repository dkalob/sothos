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
}
