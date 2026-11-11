import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ClienteDto } from './dto/client.dto';
import { RfmService } from '../rfm/rfm.service';
import { StatusPedido } from '@prisma/client';

@Injectable()
export class ClientesService {
  private readonly logger = new Logger(ClientesService.name);
  constructor(private prisma: PrismaService, private readonly rfmService: RfmService) {}

  // Função para cadastrar cliente manualmente
  // (components > component > ClientPage > ClientSheet)
  async create(dto: ClienteDto, contaId: string) {
    return this.prisma.cliente.create({
      data: {
        contaId,
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

  // Função para trazer todos os clientes do banco
  // com os campos necessários
  // (components > component > ClientPage > ClientTable)
  async findAll(contaId: string) {
    const clientes = await this.prisma.cliente.findMany({
      where: { contaId },
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
  async remove(id: string, contaId: string) {
    const cliente = await this.prisma.cliente.findUnique({ where: { id } });

    if (!cliente || cliente.contaId !== contaId) {
      throw new NotFoundException('Cliente não encontrado');
    }

    const removido = await this.prisma.cliente.delete({ where: { id } });

    await this.atualizarRfm(contaId);

    return removido
  }

  // Função para buscar do banco um cliente específico
  // (components > component > ClientPage > ClientDetailsPage)
  async findOne(id: string, contaId: string) {
    const cliente = await this.prisma.cliente.findUnique({
      where: {
        id
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

    if (!cliente || cliente.contaId !== contaId) {
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

  async update(id: string, dto: ClienteDto, contaId: string) {
    const cliente = await this.prisma.cliente.findUnique({ where: { id } });

    if (!cliente || cliente.contaId !== contaId) { // NOVO — checa dono antes de editar
      throw new NotFoundException('Cliente não encontrado');
    }

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

  async findAllComboBox(contaId: string) {
    return this.prisma.cliente.findMany({
      where: { contaId },
      select: {
        id: true,
        nome: true,
        cpf: true,
      },
      orderBy: {
        nome: 'asc',
      },
    });
  }

  async atualizarRfm(contaId: string) {
    try {
      await this.rfmService.recalcular(contaId);
    } catch (error) {
      this.logger.error(`Falha ao recalcular RFM da conta ${contaId}`, error);
    }
  }

  
  // Preenche o PageCards de clientes
  async getCard(contaId: string) {
    const agora = new Date();

    // Início e fim dos meses
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

    const inicioDoisMesesAtras = new Date(
      agora.getFullYear(),
      agora.getMonth() - 2,
      1,
    );

    const inicioTresMesesAtras = new Date(
      agora.getFullYear(),
      agora.getMonth() - 3,
      1,
    );

    const statusValidos = [
      StatusPedido.PAGO,
      StatusPedido.ENVIADO,
      StatusPedido.ENTREGUE,
    ];

    // Calcula tendência percentual
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

    // Busca compradores distintos de determinado período
    const buscarCompradores = async (inicio: Date, fim: Date) => {
      const resultado = await this.prisma.pedido.groupBy({
        by: ['clienteId'],
        where: {
          contaId,
          clienteId: { not: null },
          status: { in: statusValidos },
          realizadoEm: {
            gte: inicio,
            lt: fim,
          },
        },
      });

      return new Set(
        resultado
          .map((pedido) => pedido.clienteId)
          .filter((id): id is string => id !== null),
      );
    };

    // Consultas em paralelo
    const [
      totalClientes,
      pedidosMes,
      pedidosMesAnterior,
      gruposTotais,
      gruposMes,
      gruposMesAnterior,
      clientesEmGrupos,
      primeiraCompraClientes,
      compradoresMesAtual,
      compradoresMesAnterior,
      compradoresDoisMesesAtras,
      compradoresTresMesesAtras,
    ] = await Promise.all([
      // Total de clientes
      this.prisma.cliente.count({
        where: { contaId },
      }),

      // Faturamento e pedidos do mês atual
      this.prisma.pedido.aggregate({
        where: {
          contaId,
          status: { in: statusValidos },
          realizadoEm: {
            gte: inicioMesAtual,
            lt: inicioProximoMes,
          },
        },
        _sum: { valorTotal: true },
        _count: { _all: true },
      }),

      // Faturamento do mês anterior
      this.prisma.pedido.aggregate({
        where: {
          contaId,
          status: { in: statusValidos },
          realizadoEm: {
            gte: inicioMesAnterior,
            lt: inicioMesAtual,
          },
        },
        _sum: { valorTotal: true },
      }),

      // Quantidade total de grupos
      this.prisma.grupoCliente.count({
        where: { contaId },
      }),

      // Grupos criados no mês atual
      this.prisma.grupoCliente.count({
        where: {
          contaId,
          criadoEm: {
            gte: inicioMesAtual,
            lt: inicioProximoMes,
          },
        },
      }),

      // Grupos criados no mês anterior
      this.prisma.grupoCliente.count({
        where: {
          contaId,
          criadoEm: {
            gte: inicioMesAnterior,
            lt: inicioMesAtual,
          },
        },
      }),

      // Clientes distintos que pertencem a pelo menos um grupo
      this.prisma.clienteGrupo.findMany({
        where: {
          cliente: { contaId },
        },
        select: {
          clienteId: true,
        },
        distinct: ['clienteId'],
      }),

      // Primeira compra válida de cada cliente
      this.prisma.pedido.groupBy({
        by: ['clienteId'],
        where: {
          contaId,
          clienteId: { not: null },
          status: { in: statusValidos },
        },
        _min: {
          realizadoEm: true,
        },
      }),

      // Compradores de cada mês
      buscarCompradores(inicioMesAtual, inicioProximoMes),
      buscarCompradores(inicioMesAnterior, inicioMesAtual),
      buscarCompradores(inicioDoisMesesAtras, inicioMesAnterior),
      buscarCompradores(inicioTresMesesAtras, inicioDoisMesesAtras),
    ]);

    // 1. Novos clientes:
    // Primeira compra válida aconteceu no mês atual.
    const novosClientes = primeiraCompraClientes.filter((cliente) => {
      const primeiraCompra = cliente._min.realizadoEm;

      return (
        primeiraCompra !== null &&
        primeiraCompra >= inicioMesAtual &&
        primeiraCompra < inicioProximoMes
      );
    }).length;

    // Primeiras compras do mês anterior
    const novosClientesMesAnterior = primeiraCompraClientes.filter(
      (cliente) => {
        const primeiraCompra = cliente._min.realizadoEm;

        return (
          primeiraCompra !== null &&
          primeiraCompra >= inicioMesAnterior &&
          primeiraCompra < inicioMesAtual
        );
      },
    ).length;

    // 2. Retenção:
    // Compraram no mês atual e em pelo menos um dos dois meses anteriores.
    const compradoresAnteriores = new Set([
      ...compradoresMesAnterior,
      ...compradoresDoisMesesAtras,
    ]);

    const clientesRecorrentes = [...compradoresMesAtual].filter((id) =>
      compradoresAnteriores.has(id),
    ).length;

    const taxaRetencao =
      compradoresMesAtual.size > 0
        ? (clientesRecorrentes / compradoresMesAtual.size) * 100
        : 0;

    // Retenção do mês anterior para comparação
    const compradoresAnterioresMesAnterior = new Set([
      ...compradoresDoisMesesAtras,
      ...compradoresTresMesesAtras,
    ]);

    const clientesRecorrentesMesAnterior = [
      ...compradoresMesAnterior,
    ].filter((id) =>
      compradoresAnterioresMesAnterior.has(id),
    ).length;

    const taxaRetencaoMesAnterior =
      compradoresMesAnterior.size > 0
        ? (clientesRecorrentesMesAnterior /
            compradoresMesAnterior.size) *
          100
        : 0;

    // 3. Grupos
    const percentualClientesEmGrupos =
      totalClientes > 0
        ? (clientesEmGrupos.length / totalClientes) * 100
        : 0;

    // 4. Gastos
    const valorGastoMes = Number(
      pedidosMes._sum.valorTotal ?? 0,
    );

    const valorGastoMesAnterior = Number(
      pedidosMesAnterior._sum.valorTotal ?? 0,
    );

    return {
      totalClientes: {
        value: totalClientes,
        novosMes: novosClientes,
        trend: calcularTrend(
          novosClientes,
          novosClientesMesAnterior,
        ),
      },

      retencao: {
        value: Number(taxaRetencao.toFixed(1)),
        clientesRecorrentes,
        trend: calcularTrend(
          taxaRetencao,
          taxaRetencaoMesAnterior,
        ),
      },

      grupos: {
        value: gruposTotais,
        percentualClientesEmGrupos: Number(
          percentualClientesEmGrupos.toFixed(1),
        ),
        trend: calcularTrend(
          gruposMes,
          gruposMesAnterior,
        ),
      },

      gastos: {
        value: valorGastoMes,
        pedidosMes: pedidosMes._count._all,
        trend: calcularTrend(
          valorGastoMes,
          valorGastoMesAnterior,
        ),
      },
    };
  }





}
