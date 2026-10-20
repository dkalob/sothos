import { Injectable, Logger } from '@nestjs/common';
import { StatusPedido } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const STATUS_VALIDOS = [
  StatusPedido.PAGO,
  StatusPedido.ENVIADO,
  StatusPedido.ENTREGUE,
];

const SEGMENTOS = [
  'Campeões',
  'Leais',
  'Potenciais Leais',
  'Recém-Chegados',
  'Promissores',
  'Precisam de Atenção',
  'À Beira de Dormir',
  'Em Risco',
  'Não Podem Perder',
  'Hibernando',
  'Perdidos',
] as const;

type NomeSegmento = (typeof SEGMENTOS)[number];

const MS_DIA = 1000 * 60 * 60 * 24;

// Calcula notas de 1 a 5 usando quintis.
// Valores empatados recebem a mesma nota.
function pontuar(valores: number[], maiorEhMelhor: boolean): number[] {
  const n = valores.length;
  const ordenados = [...valores].sort((a, b) => a - b);
  const posicao = new Map<number, number>();

  let i = 0;

  while (i < n) {
    let j = i;

    while (j < n && ordenados[j] === ordenados[i]) {
      j++;
    }

    posicao.set(ordenados[i], (i + j - 1) / 2 / n);

    i = j;
  }

  return valores.map((v) => {
    const nota = Math.min(5, Math.floor(posicao.get(v)! * 5) + 1);

    return maiorEhMelhor ? nota : 6 - nota;
  });
}

// Classifica usando R, F e M de forma independente.
function classificar(r: number, f: number, m: number): NomeSegmento {

  if (r >= 4 && f >= 4 && m >= 4)  return 'Campeões';
  if (r >= 3 && f >= 4 && m >= 3)  return 'Leais';
  if (r >= 4 && f <= 3 && m >= 3)  return 'Potenciais Leais';
  if (r <= 2 && f >= 4 && m >= 4)  return 'Não Podem Perder';
  if (r <= 2 && f >= 3 && m >= 3)  return 'Em Risco';
  if (r === 5 && f <= 2 && m <= 2) return 'Recém-Chegados';
  if (r >= 4 && f <= 3 && m <= 2)  return 'Promissores';
  if (r === 3 && f <= 2 && m >= 3) return 'À Beira de Dormir';
  if (r === 3)                     return 'Precisam de Atenção';
  if (r === 2 && f <= 2 && m <= 2) return 'Hibernando';
  if (r === 1 && f <= 2 && m <= 2) return 'Perdidos';
  if (r >= 4 && m >= 3)            return 'Potenciais Leais';
  if (r >= 4)                      return 'Promissores';
  if (r <= 2 && m >= 3)            return 'Em Risco';
  if (r === 2)                     return 'Hibernando';
  return                                  'Perdidos';
}

@Injectable()
export class RfmService {
  private readonly logger = new Logger(RfmService.name);

  constructor(private prisma: PrismaService) {}

  async recalcular(contaId: string) {
    const hoje = new Date();

    // 1. Agrega os pedidos válidos por cliente.
    const grupos = await this.prisma.pedido.groupBy({
      by: ['clienteId'],
      where: {
        contaId,
        clienteId: { not: null },
        status: { in: STATUS_VALIDOS },
      },
      _min: { realizadoEm: true },
      _max: { realizadoEm: true },
      _count: { _all: true },
      _sum: { valorTotal: true },
    });

    // Sem pedidos válidos, limpa as análises existentes.
    if (grupos.length === 0) {
      const existente = await this.prisma.execucaoSegmentacao.findUnique({
        where: { contaId },
      });

      if (existente) {
        await this.prisma.analiseRfm.deleteMany({
          where: { execucaoId: existente.id },
        });
      }

      return;
    }

    // 2. Calcula as métricas brutas.
    const clientes = grupos.map((g) => ({
      clienteId: g.clienteId as string,
      recenciaDias: Math.floor(
        (hoje.getTime() - g._max.realizadoEm!.getTime()) / MS_DIA,
      ),
      frequencia: g._count._all,
      valor: Number(g._sum.valorTotal ?? 0),
    }));

    // 3. Calcula R, F e M separadamente.
    const notasR = pontuar(
      clientes.map((c) => c.recenciaDias),
      false,
    );

    const notasF = pontuar(
      clientes.map((c) => c.frequencia),
      true,
    );

    const notasM = pontuar(
      clientes.map((c) => c.valor),
      true,
    );

    const analises = clientes.map((c, i) => {
      const scoreR = notasR[i];
      const scoreF = notasF[i];
      const scoreM = notasM[i];

      return {
        ...c,
        scoreR,
        scoreF,
        scoreM,
        segmento: classificar(scoreR, scoreF, scoreM),
      };
    });

    // 4. Conta clientes por segmento.
    const tamanhos: Record<string, number> = {};

    for (const a of analises) {
      tamanhos[a.segmento] = (tamanhos[a.segmento] ?? 0) + 1;
    }

    const periodoInicio = new Date(
      Math.min(...grupos.map((g) => g._min.realizadoEm!.getTime())),
    );

    // 5. Persiste a execução de forma transacional.
    await this.prisma.$transaction(
      async (tx) => {
        const execucao = await tx.execucaoSegmentacao.upsert({
          where: { contaId },
          update: {
            status: 'CONCLUIDA',
            periodoInicio,
            periodoFim: hoje,
            dataReferencia: hoje,
            k: SEGMENTOS.length,
            totalClientes: analises.length,
            finalizadaEm: new Date(),
            mensagemErro: null,
          },
          create: {
            contaId,
            status: 'CONCLUIDA',
            periodoInicio,
            periodoFim: hoje,
            dataReferencia: hoje,
            k: SEGMENTOS.length,
            totalClientes: analises.length,
            finalizadaEm: new Date(),
          },
        });

        // Mantém os 11 segmentos e seus índices.
        const idPorNome = new Map<string, string>();

        for (const [cluster, nome] of SEGMENTOS.entries()) {
          const segmento = await tx.segmento.upsert({
            where: {
              execucaoId_cluster: {
                execucaoId: execucao.id,
                cluster,
              },
            },
            update: {
              tamanho: tamanhos[nome] ?? 0,
            },
            create: {
              execucaoId: execucao.id,
              cluster,
              nome,
              tamanho: tamanhos[nome] ?? 0,
            },
          });

          idPorNome.set(nome, segmento.id);
        }

        // Substitui as análises anteriores.
        await tx.analiseRfm.deleteMany({
          where: { execucaoId: execucao.id },
        });

        await tx.analiseRfm.createMany({
          data: analises.map((a) => ({
            execucaoId: execucao.id,
            clienteId: a.clienteId,
            segmentoId: idPorNome.get(a.segmento)!,
            recenciaDias: a.recenciaDias,
            frequencia: a.frequencia,
            valorMonetario: a.valor,
            scoreR: a.scoreR,
            scoreF: a.scoreF,
            scoreM: a.scoreM,
            ticketMedio: Number((a.valor / a.frequencia).toFixed(2)),
          })),
        });
      },
      { timeout: 20000 },
    );

    this.logger.log(
      `RFM recalculado: conta ${contaId}, ${analises.length} clientes`,
    );
  }
}
