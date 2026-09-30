import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GrupoClientesDto } from './dto/grupo-clientes.dto';

@Injectable()
export class GrupoClientesService {
  constructor(private prisma: PrismaService) {}

  async create(contaId: string, dto: GrupoClientesDto) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Verifica se todos os clientes pertencem à conta
      const clientes = await tx.cliente.findMany({
        where: {
          id: {
            in: dto.clientesIds,
          },
          contaId,
        },
      });

      // 2. Garante que todos os clientes existem
      if (clientes.length !== dto.clientesIds.length) {
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

      return grupo;
    });
  }

  // Função para a tabela em /clientes
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

  // Função que trás os dados do grupo
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
      throw new NotFoundException("Grupo não encontrado.");
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
        "Um ou mais clientes não foram encontrados.",
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
