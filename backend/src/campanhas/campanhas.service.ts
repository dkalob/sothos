import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  StatusCampanha,
  StatusEnvio,
  TipoCampanha,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CriarCampanhaDto } from './dto/campanhas.dto';

@Injectable()
export class CampanhasService {
  constructor(private prisma: PrismaService) {}

  private async validarReferencias(dto: CriarCampanhaDto, contaId: string) {
    const agendadaPara = new Date(dto.agendadaPara);

    if (agendadaPara.getTime() <= Date.now()) {
      throw new BadRequestException('A data do disparo deve ser no futuro');
    }

    const mensagem = await this.prisma.mensagemIa.findFirst({
      where: { id: dto.mensagemId, contaId },
      select: { id: true, tipo: true, produtoId: true },
    });
    if (!mensagem) throw new NotFoundException('Mensagem não encontrada');

    if (mensagem.tipo !== dto.tipo) {
      throw new BadRequestException(
        'A mensagem escolhida não é do mesmo tipo da campanha',
      );
    }

    const grupo = await this.prisma.grupoCliente.findFirst({
      where: { id: dto.grupoId, contaId },
      select: { id: true },
    });
    if (!grupo) throw new NotFoundException('Grupo não encontrado');

    const destinatarios = await this.prisma.clienteGrupo.findMany({
      where: { grupoId: grupo.id, cliente: { contaId, aceitaMarketing: true } },
      select: { clienteId: true },
    });

    if (destinatarios.length === 0) {
      throw new BadRequestException(
        'O grupo não possui clientes que aceitam receber campanhas',
      );
    }

    return { agendadaPara, mensagem, grupo, destinatarios };
  }

  async create(dto: CriarCampanhaDto, contaId: string) {
    const { agendadaPara, mensagem, grupo, destinatarios } =
      await this.validarReferencias(dto, contaId);

    return this.prisma.campanha.create({
      data: {
        contaId,
        titulo: dto.titulo,
        tipo: dto.tipo,
        status: StatusCampanha.AGENDADA,
        agendadaPara,
        grupoId: grupo.id,
        mensagemId: mensagem.id,
        clientes: { createMany: { data: destinatarios } },
        ...(mensagem.produtoId && {
          produtos: { create: [{ produtoId: mensagem.produtoId }] },
        }),
      },
      select: {
        id: true,
        titulo: true,
        status: true,
        agendadaPara: true,
        _count: { select: { clientes: true } },
      },
    });
  }

  async findOne(id: string, contaId: string) {
    const campanha = await this.prisma.campanha.findFirst({
      where: { id, contaId },
      select: {
        id: true,
        titulo: true,
        tipo: true,
        status: true,
        agendadaPara: true,
        criadoEm: true,
        grupoId: true,
        mensagemId: true,
        grupo: { select: { id: true, nome: true } },
        mensagem: {
          select: {
            id: true,
            titulo: true,
            tom: true,
            objetivo: true,
            assunto: true,
            conteudo: true,
            textoBotao: true,
            imagemUrl: true,
            produto: { select: { nome: true } },
          },
        },
        _count: { select: { clientes: true } },
      },
    });

    if (!campanha) throw new NotFoundException('Campanha não encontrada');

    return campanha;
  }

  async findAll(contaId: string) {
    const campanhas = await this.prisma.campanha.findMany({
      where: { contaId },
      orderBy: { criadoEm: 'desc' },
      select: {
        id: true,
        tipo: true,
        titulo: true,
        status: true,
        agendadaPara: true,
        criadoEm: true,
        mensagemId: true,
        grupo: { select: { nome: true } },
        mensagem: { select: { titulo: true } },
        _count: { select: { clientes: true } },
      },
    });

    return campanhas.map((c) => ({
      id: c.id,
      tipo: c.tipo,
      titulo: c.titulo,
      status: c.status,
      mensagemId: c.mensagemId,
      grupo: c.grupo?.nome ?? null,
      clientes: c._count.clientes,
      mensagem: c.mensagem?.titulo ?? null,
      agendadaPara: c.agendadaPara,
      criadoEm: c.criadoEm,
    }));
  }

  async update(id: string, dto: CriarCampanhaDto, contaId: string) {
    const existente = await this.prisma.campanha.findFirst({
      where: { id, contaId },
      select: { status: true },
    });

    if (!existente) throw new NotFoundException('Campanha não encontrada');

    if (
      existente.status !== StatusCampanha.AGENDADA &&
      existente.status !== StatusCampanha.RASCUNHO
    ) {
      throw new BadRequestException(
        'Só é possível editar campanhas agendadas ou em rascunho',
      );
    }

    const { agendadaPara, mensagem, grupo, destinatarios } =
      await this.validarReferencias(dto, contaId);

    // Troca os destinatários e o produto junto com os dados da campanha
    return this.prisma.$transaction(async (tx) => {
      await tx.campanhaCliente.deleteMany({ where: { campanhaId: id } });
      await tx.campanhaProduto.deleteMany({ where: { campanhaId: id } });

      return tx.campanha.update({
        where: { id },
        data: {
          titulo: dto.titulo,
          tipo: dto.tipo,
          agendadaPara,
          grupoId: grupo.id,
          mensagemId: mensagem.id,
          clientes: { createMany: { data: destinatarios } },
          ...(mensagem.produtoId && {
            produtos: { create: [{ produtoId: mensagem.produtoId }] },
          }),
        },
        select: { id: true, titulo: true, status: true },
      });
    });
  }

  async remove(id: string, contaId: string) {
    const campanha = await this.prisma.campanha.findFirst({
      where: { id, contaId },
      select: { id: true, status: true },
    });

    if (!campanha) throw new NotFoundException('Campanha não encontrada');

    if (campanha.status === StatusCampanha.EM_EXECUCAO) {
      throw new BadRequestException(
        'Não é possível excluir uma campanha em execução',
      );
    }

    await this.prisma.campanha.delete({ where: { id } });
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

  // 1. CAMPANHAS CADASTRADAS

  const [totalCampanhas, campanhasNovas, campanhasAnteriores] =
    await Promise.all([
      this.prisma.campanha.count({
        where: { contaId },
      }),

      this.prisma.campanha.count({
        where: {
          contaId,
          criadoEm: {
            gte: inicioMesAtual,
            lt: inicioProximoMes,
          },
        },
      }),

      this.prisma.campanha.count({
        where: {
          contaId,
          criadoEm: {
            gte: inicioMesAnterior,
            lt: inicioMesAtual,
          },
        },
      }),
    ]);

  // 2. MENSAGENS ENVIADAS

  const [whatsappAtual, whatsappAnterior, emailAtual, emailAnterior] =
    await Promise.all([
      this.prisma.campanhaCliente.count({
        where: {
          status: StatusEnvio.ENVIADO,
          enviadoEm: {
            gte: inicioMesAtual,
            lt: inicioProximoMes,
          },
          campanha: {
            contaId,
            tipo: TipoCampanha.WHATSAPP,
          },
        },
      }),

      this.prisma.campanhaCliente.count({
        where: {
          status: StatusEnvio.ENVIADO,
          enviadoEm: {
            gte: inicioMesAnterior,
            lt: inicioMesAtual,
          },
          campanha: {
            contaId,
            tipo: TipoCampanha.WHATSAPP,
          },
        },
      }),

      this.prisma.campanhaCliente.count({
        where: {
          status: StatusEnvio.ENVIADO,
          enviadoEm: {
            gte: inicioMesAtual,
            lt: inicioProximoMes,
          },
          campanha: {
            contaId,
            tipo: TipoCampanha.EMAIL,
          },
        },
      }),

      this.prisma.campanhaCliente.count({
        where: {
          status: StatusEnvio.ENVIADO,
          enviadoEm: {
            gte: inicioMesAnterior,
            lt: inicioMesAtual,
          },
          campanha: {
            contaId,
            tipo: TipoCampanha.EMAIL,
          },
        },
      }),
    ]);

  const mensagensAtual = whatsappAtual + emailAtual;
  const mensagensAnterior = whatsappAnterior + emailAnterior;

  // 3. CLIENTES ATINGIDOS

  const totalClientes = await this.prisma.cliente.count({
    where: { contaId },
  });

  const [clientesAtual, clientesAnterior] = await Promise.all([
    this.prisma.campanhaCliente.findMany({
      where: {
        status: StatusEnvio.ENVIADO,
        enviadoEm: {
          gte: inicioMesAtual,
          lt: inicioProximoMes,
        },
        campanha: { contaId },
      },
      select: {
        clienteId: true,
      },
      distinct: ['clienteId'],
    }),

    

    this.prisma.campanhaCliente.findMany({
      where: {
        status: StatusEnvio.ENVIADO,
        enviadoEm: {
          gte: inicioMesAnterior,
          lt: inicioMesAtual,
        },
        campanha: { contaId },
      },
      select: {
        clienteId: true,
      },
      distinct: ['clienteId'],
    }),
  ]);

  // 4. PRODUTOS EM CAMPANHAS

  const [produtosAtual, produtosAnterior, produtosAguardando] =
    await Promise.all([
      this.prisma.campanhaProduto.findMany({
        where: {
          criadoEm: {
            gte: inicioMesAtual,
            lt: inicioProximoMes,
          },
          campanha: { contaId },
        },
        select: {
          produtoId: true,
        },
        distinct: ['produtoId'],
      }),

      this.prisma.campanhaProduto.findMany({
        where: {
          criadoEm: {
            gte: inicioMesAnterior,
            lt: inicioMesAtual,
          },
          campanha: { contaId },
        },
        select: {
          produtoId: true,
        },
        distinct: ['produtoId'],
      }),

      this.prisma.produto.count({
        where: {
          contaId,
          campanhas: {
            none: {
              campanha: { contaId },
            },
          },
        },
      }),
    ]);

  // Produtos distintos já vinculados a campanhas
  const totalProdutosEmCampanhas = await this.prisma.campanhaProduto.findMany({
    where: {
      campanha: { contaId },
    },
    select: {
      produtoId: true,
    },
    distinct: ['produtoId'],
  });

  return {
    campanhas: {
      value: totalCampanhas,
      novas: campanhasNovas,
      trend: calcularTrend(
        campanhasNovas,
        campanhasAnteriores,
      ),
    },

    mensagens: {
      value: mensagensAtual,
      whatsapp: whatsappAtual,
      email: emailAtual,
      trend: calcularTrend(
        mensagensAtual,
        mensagensAnterior,
      ),
    },

    clientesAtingidos: {
      value: clientesAtual.length,
      total: totalClientes,
      trend: calcularTrend(
        clientesAtual.length,
        clientesAnterior.length,
      ),
    },

    produtos: {
      value: totalProdutosEmCampanhas.length,
      aguardando: produtosAguardando,
      trend: calcularTrend(
        produtosAtual.length,
        produtosAnterior.length,
      ),
    },
  };
}

}