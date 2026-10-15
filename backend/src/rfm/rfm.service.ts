import { Injectable, Logger } from '@nestjs/common';
import { StatusPedido } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

// Só esses status entram no cálculo (regra do schema)
const STATUS_VALIDOS = [
  StatusPedido.PAGO,
  StatusPedido.ENVIADO,
  StatusPedido.ENTREGUE,
];

// A posição na lista vira o "cluster" salvo no banco
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

// Transforma valores em notas de 1 a 5 (quintis).
// Empates recebem a mesma nota, usando a posição média do grupo.
function pontuar(valores: number[], maiorEhMelhor: boolean): number[] {
  const n = valores.length;
  const ordenados = [...valores].sort((a, b) => a - b);
  const posicao = new Map<number, number>();

  let i = 0;
  while (i < n) {
    let j = i;
    while (j < n && ordenados[j] === ordenados[i]) j++;
    posicao.set(ordenados[i], (i + (j - 1)) / 2 / n); // posição média, entre 0 e 1
    i = j;
  }

  return valores.map((v) => {
    const nota = Math.min(5, Math.floor(posicao.get(v)! * 5) + 1);
    return maiorEhMelhor ? nota : 6 - nota;
  });
}

// Tabela de regras: notas de R e F -> segmento
function classificar(r: number, fm: number): NomeSegmento {
  if (r >= 4 && fm >= 4) return 'Campeões';
  if (r === 3 && fm >= 4) return 'Leais';
  if (r <= 2 && fm >= 4) return 'Não Podem Perder';
  if (r <= 2 && fm === 3) return 'Em Risco';
  if (r >= 4 && fm >= 2) return 'Potenciais Leais';
  if (r === 5 && fm === 1) return 'Recém-Chegados';
  if (r === 4 && fm === 1) return 'Promissores';
  if (r === 3 && fm >= 2) return 'Precisam de Atenção';
  if (r === 3 && fm === 1) return 'À Beira de Dormir';
  if (r === 2) return 'Hibernando'; // fm 1 ou 2
  return 'Perdidos'; // r === 1, fm 1 ou 2
}

@Injectable()
export class RfmService {
  private readonly logger = new Logger(RfmService.name);

  constructor(private prisma: PrismaService) {}

  async recalcular(contaId: string) {
    const hoje = new Date();

    // 1. Uma linha por cliente, já agregada pelo banco
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

    // Sem nenhum pedido válido: limpa as análises antigas e sai
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

    // 2. R, F e M brutos de cada cliente
    const clientes = grupos.map((g) => ({
      clienteId: g.clienteId as string,
      recenciaDias: Math.floor(
        (hoje.getTime() - g._max.realizadoEm!.getTime()) / MS_DIA,
      ),
      frequencia: g._count._all,
      valor: Number(g._sum.valorTotal ?? 0),
    }));

    // 3. Notas de 1 a 5 (recência: menos dias = nota maior)
    const notasR = pontuar(clientes.map((c) => c.recenciaDias), false);
    const notasF = pontuar(clientes.map((c) => c.frequencia), true);
    const notasM = pontuar(clientes.map((c) => c.valor), true);

    const analises = clientes.map((c, i) => {
      
      const fm = Math.round((notasF[i] + notasM[i]) / 2); 

      return {
        ...c,
        scoreR: notasR[i],
        scoreF: notasF[i],
        scoreM: notasM[i],
        segmento: classificar(notasR[i], fm)
      };
    });

    const tamanhos: Record<string, number> = {};
    for (const a of analises) {
      tamanhos[a.segmento] = (tamanhos[a.segmento] ?? 0) + 1;
    }

    const periodoInicio = new Date(
      Math.min(...grupos.map((g) => g._min.realizadoEm!.getTime())),
    );

    // 4. Grava tudo de uma vez: ou salva completo, ou não salva nada
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

        // Cria (ou atualiza) os 11 segmentos e guarda o id de cada um
        const idPorNome = new Map<string, string>();
        for (const [cluster, nome] of SEGMENTOS.entries()) {
          const segmento = await tx.segmento.upsert({
            where: {
              execucaoId_cluster: { execucaoId: execucao.id, cluster },
            },
            update: { tamanho: tamanhos[nome] ?? 0 },
            create: {
              execucaoId: execucao.id,
              cluster,
              nome,
              tamanho: tamanhos[nome] ?? 0,
            },
          });
          idPorNome.set(nome, segmento.id);
        }

        // Troca as análises antigas pelas novas
        await tx.analiseRfm.deleteMany({ where: { execucaoId: execucao.id } });
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
      { timeout: 20000 }, // o padrão é 5s, apertado para o banco na nuvem
    );

    this.logger.log(`RFM recalculado: conta ${contaId}, ${analises.length} clientes`);
  }
  
}