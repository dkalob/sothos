import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GrupoClientesDto } from './dto/grupo-clientes.dto';

@Injectable()
export class GrupoClientesService {
  constructor(private prisma: PrismaService) {}

  ///////////////////////////////////////////////////////////////////////////
  // MÉTODOS AUXILIARES PARA O MÉTODO DE CRIAR CLIENTES COM FILTRO //////////
  private dataInicio(data: string): Date {
    const resultado = new Date(`${data}T00:00:00.000`);

    if (Number.isNaN(resultado.getTime())) {
      throw new BadRequestException('Data inicial inválida.');
    }

    return resultado;
  }

  private dataFim(data: string): Date {
    const resultado = new Date(`${data}T00:00:00.000`);

    if (Number.isNaN(resultado.getTime())) {
      throw new BadRequestException('Data final inválida.');
    }

    resultado.setDate(resultado.getDate() + 1);
    return resultado;
  }

  private validarNumero(valor: unknown, campo: string): number {
    const numero = Number(valor);

    if (!Number.isFinite(numero) || numero < 0) {
      throw new BadRequestException(`${campo} inválido.`);
    }

    return numero;
  }

  private combinarIds(...listas: string[][]): string[] {
    return [...new Set(listas.flat())];
  }
  ///////////////////////////////////////////////////////////////////////////

  // Método que junta os clientes em um grupo com base nos filtros usados pelo usuário
  async buscarClientesPorFiltros(
    contaId: string,
    filtros: NonNullable<GrupoClientesDto['filtros']>,
  ): Promise<string[]> {
    const { opcoes, valores } = filtros;

    const idsPorFiltro: string[][] = [];

    for (const [filtroId, opcaoId] of Object.entries(opcoes)) {
      const campos = valores[filtroId] ?? {};
      let ids: string[] = [];

      if (filtroId === 'recencia') {
        const dias = this.validarNumero(campos.dias, 'Dias');
        const limite = new Date();
        limite.setDate(limite.getDate() - dias);

        const clientes = await this.prisma.cliente.findMany({
          where: {
            contaId,
            pedidos:
              opcaoId === 'compraram'
                ? { some: { realizadoEm: { gte: limite } } }
                : { none: { realizadoEm: { gte: limite } } },
          },
          select: { id: true },
        });

        ids = clientes.map((c) => c.id);
      } else if (filtroId === 'frequencia') {
        if (opcaoId === 'nunca') {
          const clientes = await this.prisma.cliente.findMany({
            where: { contaId, pedidos: { none: {} } },
            select: { id: true },
          });
          ids = clientes.map((c) => c.id);
        } else {
          const quantidade = this.validarNumero(
            campos.quantidade,
            'Quantidade de compras',
          );
          const inicio = this.dataInicio(String(campos['data-inicial'] ?? ''));
          const fim = this.dataFim(String(campos['data-final'] ?? ''));

          if (fim <= inicio) {
            throw new BadRequestException(
              'A data final deve ser posterior à data inicial.',
            );
          }

          const clientes = await this.prisma.cliente.findMany({
            where: {
              contaId,
              pedidos: {
                some: {
                  realizadoEm: { gte: inicio, lt: fim },
                },
              },
            },
            select: {
              id: true,
              pedidos: {
                where: {
                  realizadoEm: { gte: inicio, lt: fim },
                },
                select: { id: true },
              },
            },
          });

          ids = clientes
            .filter((c) =>
              opcaoId === 'exatamente'
                ? c.pedidos.length === quantidade
                : c.pedidos.length >= quantidade,
            )
            .map((c) => c.id);
        }
      } else if (filtroId === 'valor') {
        const limite = this.validarNumero(campos.valor, 'Valor');

        const clientes = await this.prisma.cliente.findMany({
          where: { contaId },
          select: {
            id: true,
            pedidos: {
              select: { valorTotal: true },
            },
          },
        });

        ids = clientes
          .filter((c) => {
            const total = c.pedidos.reduce(
              (soma, pedido) => soma + Number(pedido.valorTotal),
              0,
            );

            return opcaoId === 'maior-que' ? total > limite : total <= limite;
          })
          .map((c) => c.id);
      } else if (filtroId === 'localizacao') {
        const estado = String(campos.estado ?? '');

        if (!estado) {
          throw new BadRequestException('Selecione um estado.');
        }

        const clientes = await this.prisma.cliente.findMany({
          where: {
            contaId,
            estado: opcaoId === 'pertence' ? estado : { not: estado },
          },
          select: { id: true },
        });

        ids = clientes.map((c) => c.id);
      } else if (filtroId === 'status-pedido') {
        const status = String(campos.status ?? '');

        if (!status) {
          throw new BadRequestException('Selecione um status de pedido.');
        }

        const clientes = await this.prisma.cliente.findMany({
          where: {
            contaId,
            pedidos:
              opcaoId === 'possui'
                ? { some: { status: status as any } }
                : { none: { status: status as any } },
          },
          select: { id: true },
        });

        ids = clientes.map((c) => c.id);
      } else if (filtroId === 'categoria' || filtroId === 'produto') {
        const campo = filtroId === 'categoria' ? 'categoria' : 'produto';
        const selecionado = campos[campo] as
          { id?: string } | string | undefined;
        const selecionadoId =
          typeof selecionado === 'string' ? selecionado : selecionado?.id;

        if (!selecionadoId) {
          throw new BadRequestException(`Selecione uma ${campo} válida.`);
        }

        const condicaoItem =
          filtroId === 'categoria'
            ? {
                produto: {
                  categoriaId: selecionadoId,
                  contaId,
                },
              }
            : {
                produto: {
                  id: selecionadoId,
                  contaId,
                },
              };

        const clientes = await this.prisma.cliente.findMany({
          where: {
            contaId,
            pedidos: {
              some: {
                itens: {
                  some: condicaoItem,
                },
              },
            },
          },
          select: { id: true },
        });

        ids = clientes.map((c) => c.id);

        if (opcaoId === 'nao-compraram') {
          const encontrados = new Set(ids);
          const todos = await this.prisma.cliente.findMany({
            where: { contaId },
            select: { id: true },
          });
          ids = todos.filter((c) => !encontrados.has(c.id)).map((c) => c.id);
        }
      } 
      
      else if (filtroId === 'rfm') {
        const segmento = String(campos.segmento ?? '');

        const resultados = await this.prisma.segmento.findMany({
          where: {
            nome: { contains: segmento, mode: 'insensitive' },
            execucao: {
              loja: { contaId },
            },
          },
          select: {
            id: true,
            nome: true,
            execucaoId: true,
            analises: {
              select: {
                clienteId: true,
              },
            },
          },
        });

        console.log('[Diagnóstico RFM]', JSON.stringify(resultados, null, 2));

        ids = [];
      }

      idsPorFiltro.push(ids);
    }

    if (idsPorFiltro.length === 0) {
      return [];
    }

    return idsPorFiltro.reduce((resultado, ids) => {
      const permitidos = new Set(ids);
      return resultado.filter((id) => permitidos.has(id));
    });
  }

  // Método para criar um grupo
  async create(contaId: string, dto: GrupoClientesDto) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Verifica se todos os clientes pertencem à conta
      const clientesManuais = await tx.cliente.findMany({
        where: {
          id: {
            in: dto.clientesIds,
          },
          contaId,
        },
      });

      const clientesFiltrados = dto.filtros
        ? await this.buscarClientesPorFiltros(contaId, dto.filtros)
        : [];

      const clientesIds = [
        ...new Set([
          ...clientesManuais.map((cliente) => cliente.id),
          ...clientesFiltrados,
        ]),
      ];

      // 2. Garante que todos os clientes existem
      if (clientesManuais.length !== dto.clientesIds.length) {
        throw new BadRequestException(
          'Um ou mais clientes não foram encontrados.',
        );
      }

      // 3. Cria o grupo e seus relacionamentos
      const grupo = await tx.grupoCliente.create({
        data: {
          contaId,
          nome: dto.nome,

          clientes: {
            create: clientesIds.map((clienteId) => ({
              cliente: {
                connect: {
                  id: clienteId,
                },
              },
            })),
          },
        },

        include: {
          clientes: {
            include: {
              cliente: true,
            },
          },
        },
      });

      return grupo;
    });
  }

  // Método que preenche os dados na tabela na aba Grupo de clientes em /clientes
  async findAll(contaId: string) {
    const grupos = await this.prisma.grupoCliente.findMany({
      where: {
        contaId,
      },

      include: {
        clientes: {
          include: {
            cliente: {
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
                    campanhaId: true,
                    campanha: {
                      select: {
                        criadoEm: true,
                        alteradoEm: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    return grupos.map((grupo) => {
      /*
       * ---------------------------------------------------------
       * TOTAL DE CLIENTES
       * ---------------------------------------------------------
       */
      const totalClientes = grupo.clientes.length;

      /*
       * ---------------------------------------------------------
       * CAMPANHAS
       * ---------------------------------------------------------
       *
       * Um cliente pode participar da mesma campanha apenas uma vez
       * por causa da chave composta:
       *
       * @@id([campanhaId, clienteId])
       *
       * Mesmo assim usamos Set para garantir campanhas distintas
       * no grupo.
       */
      const campanhaIds = new Set<string>();

      grupo.clientes.forEach((clienteGrupo) => {
        clienteGrupo.cliente.campanhas.forEach((campanhaCliente) => {
          campanhaIds.add(campanhaCliente.campanhaId);
        });
      });

      const totalCampanhas = campanhaIds.size;

      /*
       * ---------------------------------------------------------
       * VALOR GASTO PELO GRUPO
       * ---------------------------------------------------------
       *
       * Soma o valorTotal de todos os pedidos dos clientes
       * pertencentes ao grupo.
       */
      const valor = grupo.clientes.reduce((total, clienteGrupo) => {
        const valorCliente = clienteGrupo.cliente.pedidos.reduce(
          (subtotal, pedido) => {
            return subtotal + Number(pedido.valorTotal);
          },
          0,
        );

        return total + valorCliente;
      }, 0);

      /*
       * ---------------------------------------------------------
       * ÚLTIMA ATIVIDADE
       * ---------------------------------------------------------
       *
       * Começamos considerando a alteração do próprio grupo.
       */
      let ultimaAtividade = grupo.alteradoEm;

      grupo.clientes.forEach((clienteGrupo) => {
        const cliente = clienteGrupo.cliente;

        /*
         * Pedidos
         */
        cliente.pedidos.forEach((pedido) => {
          if (pedido.realizadoEm > ultimaAtividade) {
            ultimaAtividade = pedido.realizadoEm;
          }
        });

        /*
         * Participações em campanhas
         */
        cliente.campanhas.forEach((campanhaCliente) => {
          const datas = [
            campanhaCliente.criadoEm,
            campanhaCliente.campanha.criadoEm,
            campanhaCliente.campanha.alteradoEm,
          ];

          datas.forEach((data) => {
            if (data > ultimaAtividade) {
              ultimaAtividade = data;
            }
          });
        });
      });

      return {
        id: grupo.id,
        data: ultimaAtividade,
        nome: grupo.nome,
        campanhas: totalCampanhas,
        clientes: totalClientes,
        valor,
      };
    });
  }

  // Método para excluir um grupo
  async delete(id: string, contaId: string) {
    const grupo = await this.prisma.grupoCliente.findFirst({
      where: {
        id,
        contaId,
      },
    });

    if (!grupo) {
      throw new NotFoundException('Grupo não encontrado.');
    }

    await this.prisma.grupoCliente.delete({
      where: {
        id: grupo.id,
      },
    });

    return {
      message: 'Grupo excluído com sucesso.',
    };
  }

  // Método que trás os dados do grupo.
  async findOne(id: string, contaId: string) {
    const grupo = await this.prisma.grupoCliente.findFirst({
      where: {
        id,
        contaId,
      },
      include: {
        clientes: {
          include: {
            cliente: {
              select: {
                id: true,
                nome: true,
              },
            },
          },
        },
      },
    });

    if (!grupo) {
      throw new NotFoundException('Grupo não encontrado.');
    }

    return {
      id: grupo.id,
      nome: grupo.nome,
      itens: grupo.clientes.map((item) => ({
        id: item.cliente.id,
        nome: item.cliente.nome,
      })),
    };
  }

  // Método para atualizar nome e/ou clientes do grupo.
  async update(id: string, contaId: string, dto: GrupoClientesDto) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Verifica se o grupo pertence à conta
      const grupo = await tx.grupoCliente.findFirst({
        where: {
          id,
          contaId,
        },
      });

      if (!grupo) {
        throw new NotFoundException('Grupo não encontrado.');
      }

      // 2. Verifica se todos os clientes pertencem à conta
      const clientes = await tx.cliente.findMany({
        where: {
          id: {
            in: dto.clientesIds,
          },
          contaId,
        },
      });

      if (clientes.length !== dto.clientesIds.length) {
        throw new BadRequestException(
          'Um ou mais clientes não foram encontrados.',
        );
      }

      // 3. Remove os clientes atuais do grupo
      await tx.clienteGrupo.deleteMany({
        where: {
          grupoId: id,
        },
      });

      // 4. Atualiza o grupo e recria os relacionamentos
      const grupoAtualizado = await tx.grupoCliente.update({
        where: {
          id,
        },
        data: {
          nome: dto.nome,

          clientes: {
            create: dto.clientesIds.map((clienteId) => ({
              cliente: {
                connect: {
                  id: clienteId,
                },
              },
            })),
          },
        },

        include: {
          clientes: {
            include: {
              cliente: true,
            },
          },
        },
      });

      return grupoAtualizado;
    });
  }
}
