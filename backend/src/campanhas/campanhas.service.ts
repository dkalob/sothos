import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StatusCampanha, StatusEnvio, TipoCampanha } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CriarCampanhaDto } from './dto/campanhas.dto';
import { TelegramService } from '../mensagens/telegram.service';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';

@Injectable()
export class CampanhasService {
  constructor(
    private prisma: PrismaService,
    private readonly telegramService: TelegramService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

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
            arte: {
              select: {
                imagemUrl: true,
              },
            },
            produto: { select: { nome: true } },
          },
        },
        _count: { select: { clientes: true } },
      },
    });

    if (!campanha) throw new NotFoundException('Campanha não encontrada');

    return {
      ...campanha,
      mensagem: campanha.mensagem
        ? {
            ...campanha.mensagem,
            imagemUrl: campanha.mensagem.arte?.imagemUrl ?? null,
          }
        : null,
    };
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

  async executar(id: string, contaId: string) {
    const campanha = await this.prisma.campanha.findFirst({
      where: {
        id,
        contaId,
      },
      select: {
        tipo: true,
      },
    });

    if (!campanha) {
      throw new NotFoundException('Campanha não encontrada');
    }

    if (campanha.tipo === TipoCampanha.EMAIL) {
      return this.executarEmail(id, contaId);
    }

    if (campanha.tipo === TipoCampanha.WHATSAPP) {
      return this.executarTelegram(id, contaId);
    }

    throw new BadRequestException(
      'Este tipo de campanha não possui execução automática',
    );
  }

  async executarTelegram(id: string, contaId: string) {
    const campanha = await this.prisma.campanha.findFirst({
      where: {
        id,
        contaId,
        tipo: TipoCampanha.WHATSAPP,
      },
      include: {
        mensagem: {
          select: {
            conteudo: true,
            arte: {
              select: {
                imagemUrl: true,
              },
            },
          },
        },
        clientes: {
          where: {
            status: {
              in: [StatusEnvio.PENDENTE, StatusEnvio.FALHA],
            },
            cliente: {
              aceitaMarketing: true,
            },
          },
          select: {
            clienteId: true,
          },
        },
      },
    });

    if (!campanha) {
      throw new NotFoundException('Campanha Telegram não encontrada');
    }

    if (!campanha.mensagem?.conteudo) {
      throw new BadRequestException('A campanha não possui conteúdo');
    }

    const chatId = this.configService.get<string>('TELEGRAM_CHAT_ID');

    if (!chatId) {
      throw new BadRequestException('TELEGRAM_CHAT_ID não configurado');
    }

    // Só permite iniciar ou retomar campanhas agendadas ou pausadas.
    const inicio = await this.prisma.campanha.updateMany({
      where: {
        id,
        contaId,
        status: {
          in: [StatusCampanha.AGENDADA, StatusCampanha.PAUSADA],
        },
      },
      data: {
        status: StatusCampanha.EM_EXECUCAO,
      },
    });

    if (inicio.count === 0) {
      throw new BadRequestException('A campanha não está agendada ou pausada');
    }

    let enviados = 0;
    let falhas = 0;

    for (const destinatario of campanha.clientes) {
      // Verifica se a campanha foi pausada antes do próximo envio.
      const estadoAtual = await this.prisma.campanha.findUnique({
        where: { id },
        select: { status: true },
      });

      if (estadoAtual?.status !== StatusCampanha.EM_EXECUCAO) {
        break;
      }

      try {
        await this.telegramService.enviarMensagem(
          chatId,
          campanha.mensagem.conteudo,
          campanha.mensagem.arte?.imagemUrl,
        );

        await this.prisma.campanhaCliente.update({
          where: {
            campanhaId_clienteId: {
              campanhaId: id,
              clienteId: destinatario.clienteId,
            },
          },
          data: {
            status: StatusEnvio.ENVIADO,
            enviadoEm: new Date(),
            erro: null,
          },
        });

        enviados++;
      } catch (error) {
        await this.prisma.campanhaCliente.update({
          where: {
            campanhaId_clienteId: {
              campanhaId: id,
              clienteId: destinatario.clienteId,
            },
          },
          data: {
            status: StatusEnvio.FALHA,
            erro: error instanceof Error ? error.message : 'Erro no envio',
          },
        });

        falhas++;
      }
    }

    const estadoFinal = await this.prisma.campanha.findUnique({
      where: { id },
      select: { status: true },
    });

    const pendentes = await this.prisma.campanhaCliente.count({
      where: {
        campanhaId: id,
        status: {
          in: [StatusEnvio.PENDENTE, StatusEnvio.FALHA],
        },
      },
    });

    // Não altera o status se a campanha tiver sido pausada.
    if (estadoFinal?.status === StatusCampanha.EM_EXECUCAO) {
      const aindaNaoEnviados = await this.prisma.campanhaCliente.count({
        where: {
          campanhaId: id,
          status: StatusEnvio.PENDENTE,
        },
      });

      if (aindaNaoEnviados === 0) {
        await this.prisma.campanha.update({
          where: { id },
          data: {
            status: StatusCampanha.CONCLUIDA,
            enviadaEm: new Date(),
          },
        });
      }
    }

    return {
      campanhaId: id,
      enviados,
      falhas,
      pendentes,
    };
  }

  async executarEmail(id: string, contaId: string) {
    const campanha = await this.prisma.campanha.findFirst({
      where: {
        id,
        contaId,
        tipo: TipoCampanha.EMAIL,
      },
      include: {
        mensagem: {
          select: {
            assunto: true,
            conteudo: true,
            textoBotao: true,
            arte: {
              select: {
                imagemUrl: true,
              },
            },
          },
        },
        clientes: {
          where: {
            status: {
              in: [StatusEnvio.PENDENTE, StatusEnvio.FALHA],
            },
            cliente: {
              aceitaMarketing: true,
            },
          },
          select: {
            clienteId: true,
            cliente: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });

    if (!campanha) {
      throw new NotFoundException('Campanha de e-mail não encontrada');
    }

    const conta = await this.prisma.conta.findUnique({
      where: { id: contaId },
      select: { nome: true },
    });

    if (!conta) {
      throw new NotFoundException('Conta não encontrada');
    }

    if (!campanha.mensagem?.conteudo) {
      throw new BadRequestException('A campanha não possui conteúdo');
    }

    if (!campanha.mensagem.assunto) {
      throw new BadRequestException('A mensagem não possui assunto');
    }

    const inicio = await this.prisma.campanha.updateMany({
      where: {
        id,
        contaId,
        status: {
          in: [StatusCampanha.AGENDADA, StatusCampanha.PAUSADA],
        },
      },
      data: {
        status: StatusCampanha.EM_EXECUCAO,
      },
    });

    if (inicio.count === 0) {
      throw new BadRequestException('A campanha não está agendada ou pausada');
    }

    let enviados = 0;
    let falhas = 0;

    for (const destinatario of campanha.clientes) {
      const estadoAtual = await this.prisma.campanha.findUnique({
        where: { id },
        select: { status: true },
      });

      if (estadoAtual?.status !== StatusCampanha.EM_EXECUCAO) {
        break;
      }

      try {
        if (!destinatario.cliente.email) {
          throw new Error('Cliente não possui e-mail cadastrado');
        }

        await this.emailService.enviarCampanha(
          destinatario.cliente.email,
          campanha.mensagem.assunto,
          campanha.mensagem.conteudo,
          campanha.mensagem.arte?.imagemUrl,
          campanha.mensagem.textoBotao ?? undefined,
          conta.nome,
        );

        await this.prisma.campanhaCliente.update({
          where: {
            campanhaId_clienteId: {
              campanhaId: id,
              clienteId: destinatario.clienteId,
            },
          },
          data: {
            status: StatusEnvio.ENVIADO,
            enviadoEm: new Date(),
            erro: null,
          },
        });

        enviados++;
      } catch (error) {
        await this.prisma.campanhaCliente.update({
          where: {
            campanhaId_clienteId: {
              campanhaId: id,
              clienteId: destinatario.clienteId,
            },
          },
          data: {
            status: StatusEnvio.FALHA,
            erro: error instanceof Error ? error.message : 'Erro no envio',
          },
        });

        falhas++;
      }
    }

    const estadoFinal = await this.prisma.campanha.findUnique({
      where: { id },
      select: { status: true },
    });

    const pendentes = await this.prisma.campanhaCliente.count({
      where: {
        campanhaId: id,
        status: {
          in: [StatusEnvio.PENDENTE, StatusEnvio.FALHA],
        },
      },
    });

    if (estadoFinal?.status === StatusCampanha.EM_EXECUCAO) {
      const aindaNaoEnviados = await this.prisma.campanhaCliente.count({
        where: {
          campanhaId: id,
          status: StatusEnvio.PENDENTE,
        },
      });

      if (aindaNaoEnviados === 0) {
        await this.prisma.campanha.update({
          where: { id },
          data: {
            status: StatusCampanha.CONCLUIDA,
            enviadaEm: new Date(),
          },
        });
      }
    }

    return {
      campanhaId: id,
      enviados,
      falhas,
      pendentes,
    };
  }

  async pausar(id: string, contaId: string) {
    const campanha = await this.prisma.campanha.findFirst({
      where: {
        id,
        contaId,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!campanha) {
      throw new NotFoundException('Campanha não encontrada');
    }

    if (
      campanha.status !== StatusCampanha.EM_EXECUCAO &&
      campanha.status !== StatusCampanha.AGENDADA
    ) {
      throw new BadRequestException(
        'Só é possível pausar campanhas agendadas ou em execução',
      );
    }

    await this.prisma.campanha.update({
      where: { id },
      data: {
        status: StatusCampanha.PAUSADA,
      },
    });

    return {
      campanhaId: id,
      status: StatusCampanha.PAUSADA,
      mensagem: 'Campanha pausada com sucesso',
    };
  }

  async getCard(contaId: string) {
    const agora = new Date();

    const inicioMesAtual = new Date(agora.getFullYear(), agora.getMonth(), 1);

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
        direction: variacao >= 0 ? ('up' as const) : ('down' as const),
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
    const totalProdutosEmCampanhas = await this.prisma.campanhaProduto.findMany(
      {
        where: {
          campanha: { contaId },
        },
        select: {
          produtoId: true,
        },
        distinct: ['produtoId'],
      },
    );

    return {
      campanhas: {
        value: totalCampanhas,
        novas: campanhasNovas,
        trend: calcularTrend(campanhasNovas, campanhasAnteriores),
      },

      mensagens: {
        value: mensagensAtual,
        whatsapp: whatsappAtual,
        email: emailAtual,
        trend: calcularTrend(mensagensAtual, mensagensAnterior),
      },

      clientesAtingidos: {
        value: clientesAtual.length,
        total: totalClientes,
        trend: calcularTrend(clientesAtual.length, clientesAnterior.length),
      },

      produtos: {
        value: totalProdutosEmCampanhas.length,
        aguardando: produtosAguardando,
        trend: calcularTrend(produtosAtual.length, produtosAnterior.length),
      },
    };
  }
}
