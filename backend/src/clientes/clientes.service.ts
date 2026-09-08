import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ClienteDto } from './dto/client.dto';

@Injectable()
export class ClientesService {
  constructor(private prisma: PrismaService) {}

  // Função para cadastrar cliente manualmente 
  // (components > component > ClientPage > ClientSheet)
  async create(dto: ClienteDto) {
    return this.prisma.cliente.create({
      data: {
        nome: dto.nome,
        email: dto.email,
        telefone: dto.telefone,
        cpf: dto.cpf,
        cidade: dto.cidade,
        estado: dto.estado,
        aceitaMarketing: dto.aceitaMarketing,
      },
    });
  }

  // Função para trazer todos os clientes do banco com os campos necessários 
  // (components > component > ClientPage > ClientTable)
  async findAll() {
    const clientes = await this.prisma.cliente.findMany({
      include: {
        pedidos: {
          select: {
            valorTotal: true,
            realizadoEm: true,
          },
        },

        campanhas: {
          select: {
            criadoEm: true,
          },
        },

        analises: {
          orderBy: {
            calculadoEm: 'desc',
          },
          take: 1,
          include: {
            segmento: {
              select: {
                nome: true,
              },
            },
          },
        },
      },
    });

    return clientes.map((cliente) => {
      // Quantidade de pedidos
      const pedidos = cliente.pedidos.length;

      // Valor total gasto
      const valor = cliente.pedidos.reduce(
        (total, pedido) => total + Number(pedido.valorTotal),
        0,
      );

      // Quantidade de campanhas recebidas
      const campanhas = cliente.campanhas.length;

      // Último pedido
      const ultimaDataPedido = cliente.pedidos.reduce<Date | null>(
        (ultima, pedido) => {
          if (!ultima || pedido.realizadoEm > ultima) {
            return pedido.realizadoEm;
          }

          return ultima;
        },
        null,
      );

      // Última campanha recebida
      const ultimaDataCampanha = cliente.campanhas.reduce<Date | null>(
        (ultima, campanha) => {
          if (!ultima || campanha.criadoEm > ultima) {
            return campanha.criadoEm;
          }

          return ultima;
        },
        null,
      );

      // Última atividade do cliente
      const datas = [
        ultimaDataPedido,
        ultimaDataCampanha,
      ].filter((data): data is Date => data !== null);

      const ultimaData =
        datas.length > 0
          ? new Date(
              Math.max(...datas.map((data) => data.getTime())),
            )
          : cliente.criadoEm;

      // Se ainda não passou pelo RFM, é Lead
      const segmento =
        cliente.analises[0]?.segmento?.nome ?? 'Leads';

      return {
        id: cliente.id,
        cliente: cliente.nome,
        email: cliente.email,
        segmento,
        campanhas,
        pedidos,
        valor,
        data: ultimaData,
      };
    });
  }

  // Função para excluir do banco um cliente específico 
  // (components > component > ClientPage > columns)
  async remove(id: string) {
    return this.prisma.cliente.delete({
      where: {
        id,
      },
    });
}
  
  // Função para buscar do banco um cliente específico 
  // (components > component > ClientPage > ClientDetailsPage)
  async findOne(id: string) {
    const cliente = await this.prisma.cliente.findUnique({
      where: {
        id,
      },
      include: {
        pedidos: {
          select: {
            id: true,
            valorTotal: true,
            realizadoEm: true,
          },
          orderBy: {
            realizadoEm: 'desc',
          },
        },

        campanhas: {
          select: {
            criadoEm: true,
            campanha: {
              select: {
                id: true,
                titulo: true,
              },
            },
          },
        },

        analises: {
          orderBy: {
            calculadoEm: 'desc',
          },
          take: 1,
          include: {
            segmento: {
              select: {
                nome: true,
              },
            },
          },
        },
      },
    });

    if (!cliente) {
      throw new NotFoundException('Cliente não encontrado');
    }

    const pedidos = cliente.pedidos;

    const totalGasto = pedidos.reduce(
      (total, pedido) => total + Number(pedido.valorTotal),
      0,
    );

    const quantidadePedidos = pedidos.length;

    const ticketMedio =
      quantidadePedidos > 0
        ? totalGasto / quantidadePedidos
        : 0;

    const ultimaCompra = pedidos[0]?.realizadoEm ?? null;

    return {
      id: cliente.id,
      nome: cliente.nome,
      email: cliente.email,
      telefone: cliente.telefone,
      cpf: cliente.cpf,
      cidade: cliente.cidade,
      estado: cliente.estado,
      aceitaMarketing: cliente.aceitaMarketing,

      segmento: cliente.analises[0]?.segmento?.nome ?? 'Leads',

      totalGasto,
      ticketMedio,
      quantidadePedidos,
      ultimaCompra,

      campanhas: cliente.campanhas,
      pedidos: cliente.pedidos,
    };
  }

  async update(id: string, dto: ClienteDto) {
  return this.prisma.cliente.update({
    where: { id },
    data: {
      nome: dto.nome,
      email: dto.email,
      telefone: dto.telefone,
      cpf: dto.cpf,
      cidade: dto.cidade,
      estado: dto.estado,
      aceitaMarketing: dto.aceitaMarketing,
    },
  });
}

}



