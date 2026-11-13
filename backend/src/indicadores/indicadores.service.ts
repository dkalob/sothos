import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StatusEnvio, StatusPedido } from '@prisma/client';

@Injectable()
export class IndicadoresService {
  private readonly logger = new Logger(IndicadoresService.name);
  constructor(private prisma: PrismaService) {}

  async getCardClientes(
    contaId: string,
    periodo: 'DIARIO' | 'SEMANAL' | 'MENSAL',
  ) {
    const agora = new Date();

    const statusValidos = [
      StatusPedido.PAGO,
      StatusPedido.ENVIADO,
      StatusPedido.ENTREGUE,
    ];

    // Define o início e o fim do período atual e anterior
    const obterIntervalos = () => {
      let inicioAtual: Date;
      let fimAtual: Date;
      let inicioAnterior: Date;
      let fimAnterior: Date;

      if (periodo === 'DIARIO') {
        inicioAtual = new Date(
          agora.getFullYear(),
          agora.getMonth(),
          agora.getDate(),
        );

        fimAtual = new Date(inicioAtual);
        fimAtual.setDate(fimAtual.getDate() + 1);

        inicioAnterior = new Date(inicioAtual);
        inicioAnterior.setDate(inicioAnterior.getDate() - 1);

        fimAnterior = new Date(inicioAtual);
      } else if (periodo === 'SEMANAL') {
        // Semana começando na segunda-feira
        inicioAtual = new Date(
          agora.getFullYear(),
          agora.getMonth(),
          agora.getDate(),
        );

        const diaSemana = inicioAtual.getDay();
        const diferenca = diaSemana === 0 ? 6 : diaSemana - 1;

        inicioAtual.setDate(inicioAtual.getDate() - diferenca);

        fimAtual = new Date(inicioAtual);
        fimAtual.setDate(fimAtual.getDate() + 7);

        inicioAnterior = new Date(inicioAtual);
        inicioAnterior.setDate(inicioAnterior.getDate() - 7);

        fimAnterior = new Date(inicioAtual);
      } else {
        inicioAtual = new Date(agora.getFullYear(), agora.getMonth(), 1);

        fimAtual = new Date(agora.getFullYear(), agora.getMonth() + 1, 1);

        inicioAnterior = new Date(agora.getFullYear(), agora.getMonth() - 1, 1);

        fimAnterior = new Date(inicioAtual);
      }

      return {
        inicioAtual,
        fimAtual,
        inicioAnterior,
        fimAnterior,
      };
    };

    const { inicioAtual, fimAtual, inicioAnterior, fimAnterior } =
      obterIntervalos();

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
        direction: variacao >= 0 ? ('up' as const) : ('down' as const),
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
      compradoresAtual,
      compradoresAnterior,
      primeirasCompras,
    ] = await Promise.all([
      // Total de clientes cadastrados
      this.prisma.cliente.count({
        where: { contaId },
      }),

      // Compradores do período atual
      buscarCompradores(inicioAtual, fimAtual),

      // Compradores do período anterior
      buscarCompradores(inicioAnterior, fimAnterior),

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
    ]);

    // Novos clientes: primeira compra no período atual
    const novosClientes = primeirasCompras.filter((cliente) => {
      const primeiraCompra = cliente._min.realizadoEm;

      return (
        primeiraCompra !== null &&
        primeiraCompra >= inicioAtual &&
        primeiraCompra < fimAtual
      );
    }).length;

    // Novos clientes no período anterior
    const novosClientesAnterior = primeirasCompras.filter((cliente) => {
      const primeiraCompra = cliente._min.realizadoEm;

      return (
        primeiraCompra !== null &&
        primeiraCompra >= inicioAnterior &&
        primeiraCompra < fimAnterior
      );
    }).length;

    // Recorrentes: compraram no período atual e no anterior
    const clientesRecorrentes = [...compradoresAtual].filter((id) =>
      compradoresAnterior.has(id),
    ).length;

    // Recorrentes no período anterior:
    // compara o período anterior com o período imediatamente anterior a ele.
    const compradoresDoisPeriodosAtras = await buscarCompradores(
      new Date(
        inicioAnterior.getTime() -
          (fimAnterior.getTime() - inicioAnterior.getTime()),
      ),
      inicioAnterior,
    );

    const recorrentesAnterior = [...compradoresAnterior].filter((id) =>
      compradoresDoisPeriodosAtras.has(id),
    ).length;

    return {
      totalClientes: {
        value: totalClientes,
      },

      novos: {
        value: novosClientes,
        trend: calcularTrend(novosClientes, novosClientesAnterior),
      },

      recorrentes: {
        value: clientesRecorrentes,
        trend: calcularTrend(clientesRecorrentes, recorrentesAnterior),
      },
    };
  }

  async getCardLucro(
    contaId: string,
    periodo: 'DIARIO' | 'SEMANAL' | 'MENSAL',
    meta: number,
  ) {
    const agora = new Date();

    const statusValidos = [
      StatusPedido.PAGO,
      StatusPedido.ENVIADO,
      StatusPedido.ENTREGUE,
    ];

    // 1. DEFINIÇÃO DOS PERÍODOS

    const obterIntervalos = () => {
      let inicioAtual: Date;
      let fimAtual: Date;
      let inicioAnterior: Date;
      let fimAnterior: Date;

      if (periodo === 'DIARIO') {
        inicioAtual = new Date(
          agora.getFullYear(),
          agora.getMonth(),
          agora.getDate(),
        );

        fimAtual = new Date(inicioAtual);
        fimAtual.setDate(fimAtual.getDate() + 1);

        inicioAnterior = new Date(inicioAtual);
        inicioAnterior.setDate(inicioAnterior.getDate() - 1);

        fimAnterior = new Date(inicioAtual);
      } else if (periodo === 'SEMANAL') {
        inicioAtual = new Date(
          agora.getFullYear(),
          agora.getMonth(),
          agora.getDate(),
        );

        const diaSemana = inicioAtual.getDay();
        const diferenca = diaSemana === 0 ? 6 : diaSemana - 1;

        inicioAtual.setDate(inicioAtual.getDate() - diferenca);

        fimAtual = new Date(inicioAtual);
        fimAtual.setDate(fimAtual.getDate() + 7);

        inicioAnterior = new Date(inicioAtual);
        inicioAnterior.setDate(inicioAnterior.getDate() - 7);

        fimAnterior = new Date(inicioAtual);
      } else {
        inicioAtual = new Date(agora.getFullYear(), agora.getMonth(), 1);

        fimAtual = new Date(agora.getFullYear(), agora.getMonth() + 1, 1);

        inicioAnterior = new Date(agora.getFullYear(), agora.getMonth() - 1, 1);

        fimAnterior = new Date(inicioAtual);
      }

      return {
        inicioAtual,
        fimAtual,
        inicioAnterior,
        fimAnterior,
      };
    };

    const { inicioAtual, fimAtual, inicioAnterior, fimAnterior } =
      obterIntervalos();

    // 2. CÁLCULO DA TENDÊNCIA

    const calcularTrend = (atual: number, anterior: number) => {
      if (anterior === 0) {
        return {
          direction: 'up' as const,
          value: atual === 0 ? '0%' : 'Novo',
        };
      }

      const variacao = ((atual - anterior) / anterior) * 100;

      return {
        direction: variacao >= 0 ? ('up' as const) : ('down' as const),
        value: `${variacao > 0 ? '+' : ''}${variacao.toFixed(1)}%`,
      };
    };

    // 3. BUSCA DO FATURAMENTO

    const [faturamentoAtual, faturamentoAnterior] = await Promise.all([
      this.prisma.pedido.aggregate({
        where: {
          contaId,
          status: { in: statusValidos },
          realizadoEm: {
            gte: inicioAtual,
            lt: fimAtual,
          },
        },
        _sum: {
          valorTotal: true,
        },
      }),

      this.prisma.pedido.aggregate({
        where: {
          contaId,
          status: { in: statusValidos },
          realizadoEm: {
            gte: inicioAnterior,
            lt: fimAnterior,
          },
        },
        _sum: {
          valorTotal: true,
        },
      }),
    ]);

    const valorArrecadado = Number(faturamentoAtual._sum.valorTotal ?? 0);

    const valorArrecadadoAnterior = Number(
      faturamentoAnterior._sum.valorTotal ?? 0,
    );

    // 4. PROGRESSO DA META

    const percentualMeta = meta > 0 ? (valorArrecadado / meta) * 100 : 0;

    // 5. RETORNO

    return {
      faturamento: {
        value: valorArrecadado,
        trend: calcularTrend(valorArrecadado, valorArrecadadoAnterior),
      },

      meta: {
        value: meta,
        atingido: valorArrecadado,
        percentual: Number(percentualMeta.toFixed(1)),
      },
    };
  }

  async getCardCampanhas(
    contaId: string,
    periodo: 'DIARIO' | 'SEMANAL' | 'MENSAL',
  ) {
    const agora = new Date();

    // 1. DEFINIÇÃO DOS PERÍODOS

    const obterIntervalos = () => {
      let inicioAtual: Date;
      let fimAtual: Date;
      let inicioAnterior: Date;
      let fimAnterior: Date;

      if (periodo === 'DIARIO') {
        inicioAtual = new Date(
          agora.getFullYear(),
          agora.getMonth(),
          agora.getDate(),
        );

        fimAtual = new Date(inicioAtual);
        fimAtual.setDate(fimAtual.getDate() + 1);

        inicioAnterior = new Date(inicioAtual);
        inicioAnterior.setDate(inicioAnterior.getDate() - 1);

        fimAnterior = new Date(inicioAtual);
      } else if (periodo === 'SEMANAL') {
        // Semana iniciando na segunda-feira
        inicioAtual = new Date(
          agora.getFullYear(),
          agora.getMonth(),
          agora.getDate(),
        );

        const diaSemana = inicioAtual.getDay();
        const diferenca = diaSemana === 0 ? 6 : diaSemana - 1;

        inicioAtual.setDate(inicioAtual.getDate() - diferenca);

        fimAtual = new Date(inicioAtual);
        fimAtual.setDate(fimAtual.getDate() + 7);

        inicioAnterior = new Date(inicioAtual);
        inicioAnterior.setDate(inicioAnterior.getDate() - 7);

        fimAnterior = new Date(inicioAtual);
      } else {
        inicioAtual = new Date(agora.getFullYear(), agora.getMonth(), 1);

        fimAtual = new Date(agora.getFullYear(), agora.getMonth() + 1, 1);

        inicioAnterior = new Date(agora.getFullYear(), agora.getMonth() - 1, 1);

        fimAnterior = new Date(inicioAtual);
      }

      return {
        inicioAtual,
        fimAtual,
        inicioAnterior,
        fimAnterior,
      };
    };

    const { inicioAtual, fimAtual, inicioAnterior, fimAnterior } =
      obterIntervalos();

    // 2. CÁLCULO DA TENDÊNCIA

    const calcularTrend = (atual: number, anterior: number) => {
      if (anterior === 0) {
        return {
          direction: 'up' as const,
          value: atual === 0 ? '0%' : 'Novo',
        };
      }

      const variacao = ((atual - anterior) / anterior) * 100;

      return {
        direction: variacao >= 0 ? ('up' as const) : ('down' as const),
        value: `${variacao > 0 ? '+' : ''}${variacao.toFixed(1)}%`,
      };
    };

    // 3. CONSULTAS EM PARALELO

    const [
      campanhasAtual,
      campanhasAnterior,
      mensagensAtual,
      mensagensAnterior,
      clientesAtual,
      clientesAnterior,
    ] = await Promise.all([
      // Campanhas criadas no período atual
      this.prisma.campanha.count({
        where: {
          contaId,
          criadoEm: {
            gte: inicioAtual,
            lt: fimAtual,
          },
        },
      }),

      // Campanhas criadas no período anterior
      this.prisma.campanha.count({
        where: {
          contaId,
          criadoEm: {
            gte: inicioAnterior,
            lt: fimAnterior,
          },
        },
      }),

      // Mensagens enviadas no período atual
      this.prisma.campanhaCliente.count({
        where: {
          status: StatusEnvio.ENVIADO,
          enviadoEm: {
            gte: inicioAtual,
            lt: fimAtual,
          },
          campanha: {
            contaId,
          },
        },
      }),

      // Mensagens enviadas no período anterior
      this.prisma.campanhaCliente.count({
        where: {
          status: StatusEnvio.ENVIADO,
          enviadoEm: {
            gte: inicioAnterior,
            lt: fimAnterior,
          },
          campanha: {
            contaId,
          },
        },
      }),

      // Clientes únicos atingidos no período atual
      this.prisma.campanhaCliente.findMany({
        where: {
          status: StatusEnvio.ENVIADO,
          enviadoEm: {
            gte: inicioAtual,
            lt: fimAtual,
          },
          campanha: {
            contaId,
          },
        },
        select: {
          clienteId: true,
        },
        distinct: ['clienteId'],
      }),

      // Clientes únicos atingidos no período anterior
      this.prisma.campanhaCliente.findMany({
        where: {
          status: StatusEnvio.ENVIADO,
          enviadoEm: {
            gte: inicioAnterior,
            lt: fimAnterior,
          },
          campanha: {
            contaId,
          },
        },
        select: {
          clienteId: true,
        },
        distinct: ['clienteId'],
      }),
    ]);

    // 4. TOTAL DE CLIENTES ÚNICOS

    const quantidadeClientesAtual = clientesAtual.length;
    const quantidadeClientesAnterior = clientesAnterior.length;

    // 5. RETORNO DOS CARDS

    return {
      campanhas: {
        value: campanhasAtual,
        trend: calcularTrend(campanhasAtual, campanhasAnterior),
      },

      clientesAtingidos: {
        value: quantidadeClientesAtual,
        trend: calcularTrend(
          quantidadeClientesAtual,
          quantidadeClientesAnterior,
        ),
      },

      mensagens: {
        value: mensagensAtual,
        trend: calcularTrend(mensagensAtual, mensagensAnterior),
      },
    };
  }

  async getCardProdutos(
  contaId: string,
  periodo: 'DIARIO' | 'SEMANAL' | 'MENSAL',
) {
  const agora = new Date();

  const statusValidos = [
    StatusPedido.PAGO,
    StatusPedido.ENVIADO,
    StatusPedido.ENTREGUE,
  ];

  // 1. DEFINIÇÃO DOS PERÍODOS

  const obterIntervalos = () => {
    let inicioAtual: Date;
    let fimAtual: Date;
    let inicioAnterior: Date;
    let fimAnterior: Date;

    if (periodo === 'DIARIO') {
      inicioAtual = new Date(
        agora.getFullYear(),
        agora.getMonth(),
        agora.getDate(),
      );

      fimAtual = new Date(inicioAtual);
      fimAtual.setDate(fimAtual.getDate() + 1);

      inicioAnterior = new Date(inicioAtual);
      inicioAnterior.setDate(inicioAnterior.getDate() - 1);

      fimAnterior = new Date(inicioAtual);
    } else if (periodo === 'SEMANAL') {
      // Semana iniciando na segunda-feira
      inicioAtual = new Date(
        agora.getFullYear(),
        agora.getMonth(),
        agora.getDate(),
      );

      const diaSemana = inicioAtual.getDay();
      const diferenca = diaSemana === 0 ? 6 : diaSemana - 1;

      inicioAtual.setDate(inicioAtual.getDate() - diferenca);

      fimAtual = new Date(inicioAtual);
      fimAtual.setDate(fimAtual.getDate() + 7);

      inicioAnterior = new Date(inicioAtual);
      inicioAnterior.setDate(inicioAnterior.getDate() - 7);

      fimAnterior = new Date(inicioAtual);
    } else {
      inicioAtual = new Date(
        agora.getFullYear(),
        agora.getMonth(),
        1,
      );

      fimAtual = new Date(
        agora.getFullYear(),
        agora.getMonth() + 1,
        1,
      );

      inicioAnterior = new Date(
        agora.getFullYear(),
        agora.getMonth() - 1,
        1,
      );

      fimAnterior = new Date(inicioAtual);
    }

    return {
      inicioAtual,
      fimAtual,
      inicioAnterior,
      fimAnterior,
    };
  };

  const {
    inicioAtual,
    fimAtual,
    inicioAnterior,
    fimAnterior,
  } = obterIntervalos();

  // 2. CÁLCULO DA TENDÊNCIA

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

  // 3. PRODUTOS DISTINTOS VENDIDOS

  const [produtosAtuais, produtosAnteriores] = await Promise.all([
    this.prisma.itemPedido.findMany({
      where: {
        pedido: {
          is: {
            contaId,
            status: { in: statusValidos },
            realizadoEm: {
              gte: inicioAtual,
              lt: fimAtual,
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
    }),

    this.prisma.itemPedido.findMany({
      where: {
        pedido: {
          is: {
            contaId,
            status: { in: statusValidos },
            realizadoEm: {
              gte: inicioAnterior,
              lt: fimAnterior,
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
    }),
  ]);

  const quantidadeProdutosVendidos = produtosAtuais.length;
  const quantidadeProdutosAnteriores = produtosAnteriores.length;

  // 4. CATEGORIA MAIS VENDIDA

  const itensVendidos = await this.prisma.itemPedido.findMany({
    where: {
      pedido: {
        is: {
          contaId,
          status: { in: statusValidos },
          realizadoEm: {
            gte: inicioAtual,
            lt: fimAtual,
          },
        },
      },
      produto: {
        is: {
          contaId,
          categoriaId: { not: null },
        },
      },
    },
    select: {
      quantidade: true,
      produto: {
        select: {
          categoria: {
            select: {
              id: true,
              nome: true,
            },
          },
        },
      },
    },
  });

  const vendasPorCategoria = new Map<
    string,
    { nome: string; quantidade: number }
  >();

  for (const item of itensVendidos) {
    const categoria = item.produto?.categoria;

    if (!categoria) continue;

    const categoriaExistente = vendasPorCategoria.get(categoria.id);

    if (categoriaExistente) {
      categoriaExistente.quantidade += item.quantidade;
    } else {
      vendasPorCategoria.set(categoria.id, {
        nome: categoria.nome,
        quantidade: item.quantidade,
      });
    }
  }

  const categoriaMaisVendida = [...vendasPorCategoria.values()].sort(
    (a, b) => b.quantidade - a.quantidade,
  )[0] ?? {
    nome: 'Sem vendas',
    quantidade: 0,
  };

  // 5. RETORNO

  return {
    produtosVendidos: {
      value: quantidadeProdutosVendidos,
      trend: calcularTrend(
        quantidadeProdutosVendidos,
        quantidadeProdutosAnteriores,
      ),
    },

    categoriaMaisVendida: {
      value: categoriaMaisVendida.nome,
      quantidade: categoriaMaisVendida.quantidade,
    },
  };
  }

  async getGrafico(contaId: string, meta: number) {
    const agora = new Date();

    // 1. DEFINIÇÃO DO MÊS ATUAL

    const inicioMes = new Date(
      agora.getFullYear(),
      agora.getMonth(),
      1,
    );

    const inicioProximoMes = new Date(
      agora.getFullYear(),
      agora.getMonth() + 1,
      1,
    );

    const totalDiasMes = new Date(
      agora.getFullYear(),
      agora.getMonth() + 1,
      0,
    ).getDate();

    // 2. BUSCAR PEDIDOS DO MÊS

    const statusValidos = [
      StatusPedido.PAGO,
      StatusPedido.ENVIADO,
      StatusPedido.ENTREGUE,
    ];

    const pedidos = await this.prisma.pedido.findMany({
      where: {
        contaId,
        status: {
          in: statusValidos,
        },
        realizadoEm: {
          gte: inicioMes,
          lt: inicioProximoMes,
        },
      },
      select: {
        realizadoEm: true,
        valorTotal: true,
      },
      orderBy: {
        realizadoEm: 'asc',
      },
    });

    // 3. AGRUPAR FATURAMENTO POR DIA

    const faturamentoPorDia = new Map<number, number>();

    for (const pedido of pedidos) {
      const dia = pedido.realizadoEm.getDate();

      const valor = Number(pedido.valorTotal ?? 0);

      faturamentoPorDia.set(
        dia,
        (faturamentoPorDia.get(dia) ?? 0) + valor,
      );
    }

    // 4. MONTAR DADOS DO GRÁFICO

    let faturamentoAcumulado = 0;

    const dadosGrafico = Array.from(
      { length: totalDiasMes },
      (_, index) => {
        const dia = index + 1;

        // Faturamento do dia
        const faturamentoDia = faturamentoPorDia.get(dia) ?? 0;

        // Atualiza faturamento acumulado
        faturamentoAcumulado += faturamentoDia;

        // Meta esperada proporcional ao dia do mês
        const metaEsperada = meta > 0
          ? (meta / totalDiasMes) * dia
          : 0;

        return {
          dia: String(dia).padStart(2, '0'),
          metaAtingida: Number(faturamentoAcumulado.toFixed(2)),
          metaEsperada: Number(metaEsperada.toFixed(2)),
        };
      },
    );

    // 5. RETORNO

    return {
      meta,
      faturamentoTotal: Number(faturamentoAcumulado.toFixed(2)),
      percentualMeta:
        meta > 0
          ? Number(((faturamentoAcumulado / meta) * 100).toFixed(1))
          : 0,
      dados: dadosGrafico,
    };
  }


}
