import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProdutoDto } from './dto/produtos.dto';
import { StatusPedido } from '@prisma/client';

@Injectable()
export class ProdutosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(contaId: string, dto: ProdutoDto) {
  return this.prisma.$transaction(async (tx) => {
    // 1. Se vieram características, confirma que todas pertencem à conta
    if (dto.caracteristicas && dto.caracteristicas.length > 0) {
      const idsEnviados = dto.caracteristicas.map((c) => c.caracteristicaId);

      const caracteristicasValidas = await tx.caracteristicaProduto.findMany({
        where: {
          id: { in: idsEnviados },
          contaId,
        },
      });

      if (caracteristicasValidas.length !== idsEnviados.length) {
        throw new BadRequestException(
          'Uma ou mais características não foram encontradas.',
        );
      }
    }

    // 2. Cria o produto e suas características relacionadas de uma vez
    const produto = await tx.produto.create({
      data: {
        contaId,
        categoriaId: dto.categoriaId,
        nome: dto.nome,
        sku: dto.sku,
        precoAtual: dto.preco,
        imagem: dto.imagem,
        ativo: dto.ativo,

        caracteristicas: dto.caracteristicas?.length
          ? {
              create: dto.caracteristicas.map((item) => ({
                caracteristicaId: item.caracteristicaId,
                valor: item.valor,
              })),
            }
          : undefined,
      },
      include: {
        caracteristicas: {
          include: {
            caracteristica: true,
          },
        },
      },
    });

    return produto;
  });
}

  async findAll(contaId: string) {
    const produtos = await this.prisma.produto.findMany({
      where: {
        contaId,
      },
      orderBy: {
        criadoEm: 'desc',
      },
      include: {
        itens: {
          orderBy: {
            pedido: {
              realizadoEm: 'desc',
            },
          },
          take: 1,
          include: {
            pedido: {
              select: {
                realizadoEm: true,
              },
            },
          },
        },
      },
    });

    return produtos.map((produto) => ({
      id: produto.id,
      imagem: produto.imagem ?? '',
      nome: produto.nome,
      sku: produto.sku ?? '',
      campanhas: [],
      ultimaCompra: produto.itens[0]?.pedido.realizadoEm ?? null,
    }));
  }

  async findAllCombobox(contaId: string) {
    return this.prisma.produto.findMany({
      where: {
        contaId,
        ativo: true,
      },
      select: {
        id: true,
        nome: true,
        sku: true,
        imagem: true,
        precoAtual: true,
      },
      orderBy: {
        nome: 'asc',
      },
    });
  }

  async findOne(id: string, contaId: string) {
    const produto = await this.prisma.produto.findFirst({
      where: {
        id,
        contaId,
      },
      include: {
        categoria: {
          select: {
            id: true,
            nome: true,
          },
        },
        caracteristicas: {
          include: {
            caracteristica: {
              include: {
                opcoes: {
                  where: {
                    ativo: true,
                  },
                  orderBy: {
                    ordem: 'asc',
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!produto) {
      throw new NotFoundException('Produto não encontrado');
    }

    return {
      id: produto.id,
      imagem: produto.imagem,
      nome: produto.nome,
      categoriaId: produto.categoriaId,
      categoria: produto.categoria,
      preco: produto.precoAtual?.toString() ?? '',
      sku: produto.sku,
      ativo: produto.ativo,

      caracteristicas: produto.caracteristicas.map((item) => ({
        caracteristicaId: item.caracteristicaId,
        valor: item.valor,
        caracteristica: {
          id: item.caracteristica.id,
          nome: item.caracteristica.nome,
          tipo: item.caracteristica.tipo,
          opcoes: item.caracteristica.opcoes.map(
            (opcao) => opcao.valor,
          ),
        },
      })),
    };
  }

  async update(id: string, contaId: string, dto: ProdutoDto) {
    return this.prisma.$transaction(async (tx) => {
      const produtoExistente = await tx.produto.findFirst({
        where: {
          id,
          contaId,
        },
      });

      if (!produtoExistente) {
        throw new NotFoundException('Produto não encontrado');
      }

      if (dto.caracteristicas !== undefined) {
        const idsEnviados = dto.caracteristicas.map(
          (item) => item.caracteristicaId,
        );

        const idsUnicos = new Set(idsEnviados);

        if (idsUnicos.size !== idsEnviados.length) {
          throw new BadRequestException(
            'Uma característica não pode ser adicionada mais de uma vez.',
          );
        }

        if (idsEnviados.length > 0) {
          const caracteristicasValidas =
            await tx.caracteristicaProduto.findMany({
              where: {
                id: { in: idsEnviados },
                contaId,
              },
            });

          if (caracteristicasValidas.length !== idsEnviados.length) {
            throw new BadRequestException(
              'Uma ou mais características não foram encontradas.',
            );
          }
        }
      }

      return tx.produto.update({
        where: {
          id,
        },
        data: {
          nome: dto.nome,
          categoriaId: dto.categoriaId,
          precoAtual: dto.preco,
          sku: dto.sku,
          ativo: dto.ativo,
          ...(dto.imagem !== undefined && {
            imagem: dto.imagem,
          }),

          ...(dto.caracteristicas !== undefined && {
            caracteristicas: {
              deleteMany: {},
              create: dto.caracteristicas.map((item) => ({
                caracteristicaId: item.caracteristicaId,
                valor: item.valor,
              })),
            },
          }),
        },
        include: {
          caracteristicas: {
            include: {
              caracteristica: true,
            },
          },
        },
      });
    });
  }

  async delete(id: string, contaId: string) {
    const produto = await this.prisma.produto.findFirst({
      where: {
        id,
        contaId,
      }
    })

    if (!produto) {
      throw new NotFoundException("Produto não encontrado")
    }
    
    await this.prisma.produto.delete({
      where: {
        id: produto.id
      }
    })

    return {
      message: "Produto Excluído"
    }

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

    const statusValidos = [
      StatusPedido.PAGO,
      StatusPedido.ENVIADO,
      StatusPedido.ENTREGUE,
    ];

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

    // 1. PRODUTOS CADASTRADOS

    const [
      totalProdutos,
      novosProdutos,
      totalProdutosAnterior,
    ] = await Promise.all([
      this.prisma.produto.count({
        where: { contaId },
      }),

      this.prisma.produto.count({
        where: {
          contaId,
          criadoEm: {
            gte: inicioMesAtual,
            lt: inicioProximoMes,
          },
        },
      }),

      this.prisma.produto.count({
        where: {
          contaId,
          criadoEm: {
            lt: inicioMesAtual,
          },
        },
      }),
    ]);

    // 2. PRODUTOS SEM VENDA

    const [
      totalProdutosAtivos,
      produtosSemVenda,
      produtosSemVendaAnterior,
    ] = await Promise.all([
      this.prisma.produto.count({
        where: {
          contaId,
          ativo: true,
        },
      }),

      this.prisma.produto.count({
        where: {
          contaId,
          ativo: true,
          itens: {
            none: {
              pedido: {
                is: {
                  contaId,
                  status: { in: statusValidos },
                  realizadoEm: {
                    gte: inicioMesAtual,
                    lt: inicioProximoMes,
                  },
                },
              },
            },
          },
        },
      }),

      this.prisma.produto.count({
        where: {
          contaId,
          ativo: true,
          itens: {
            none: {
              pedido: {
                is: {
                  contaId,
                  status: { in: statusValidos },
                  realizadoEm: {
                    gte: inicioMesAnterior,
                    lt: inicioMesAtual,
                  },
                },
              },
            },
          },
        },
      }),
    ]);

    const percentualSemVenda =
      totalProdutosAtivos > 0
        ? (produtosSemVenda / totalProdutosAtivos) * 100
        : 0;

    // 3. QUANTIDADE VENDIDA E VALOR DAS VENDAS

    const [
      vendasMes,
      vendasMesAnterior,
      faturamentoMes,
    ] = await Promise.all([
      this.prisma.itemPedido.aggregate({
        where: {
          pedido: {
            is: {
              contaId,
              status: { in: statusValidos },
              realizadoEm: {
                gte: inicioMesAtual,
                lt: inicioProximoMes,
              },
            },
          },
          produto: {
            is: { contaId },
          },
        },
        _sum: {
          quantidade: true,
        },
      }),

      this.prisma.itemPedido.aggregate({
        where: {
          pedido: {
            is: {
              contaId,
              status: { in: statusValidos },
              realizadoEm: {
                gte: inicioMesAnterior,
                lt: inicioMesAtual,
              },
            },
          },
          produto: {
            is: { contaId },
          },
        },
        _sum: {
          quantidade: true,
        },
      }),

      this.prisma.pedido.aggregate({
        where: {
          contaId,
          status: { in: statusValidos },
          realizadoEm: {
            gte: inicioMesAtual,
            lt: inicioProximoMes,
          },
          itens: {
            some: {
              produto: {
                is: { contaId },
              },
            },
          },
        },
        _sum: {
          valorTotal: true,
        },
      }),
    ]);

    const quantidadeVendida = vendasMes._sum.quantidade ?? 0;

    const quantidadeVendidaAnterior =
      vendasMesAnterior._sum.quantidade ?? 0;

    const valorVendas = Number(
      faturamentoMes._sum.valorTotal ?? 0,
    );

    // 4. CAMPANHAS VINCULADAS A PRODUTOS

    const produtosCampanha =
      await this.prisma.campanhaProduto.findMany({
        where: {
          produto: {
            is: { contaId },
          },
        },
        select: {
          campanhaId: true,
          criadoEm: true,
        },
        distinct: ['campanhaId'],
      });

    const quantidadeCampanhas = produtosCampanha.length;

    const campanhasMesAnterior = produtosCampanha.filter(
      (item) =>
        item.criadoEm >= inicioMesAnterior &&
        item.criadoEm < inicioMesAtual,
    ).length;

    const campanhasMesAtual = produtosCampanha.filter(
      (item) =>
        item.criadoEm >= inicioMesAtual &&
        item.criadoEm < inicioProximoMes,
    ).length;

    // 5. CATEGORIA MAIS VENDIDA DO MÊS

    const itensVendidos = await this.prisma.itemPedido.findMany({
      where: {
        pedido: {
          is: {
            contaId,
            status: { in: statusValidos },
            realizadoEm: {
              gte: inicioMesAtual,
              lt: inicioProximoMes,
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
                nome: true,
              },
            },
          },
        },
      },
    });

    const vendasPorCategoria = new Map<string, number>();

    for (const item of itensVendidos) {
      const categoria = item.produto?.categoria?.nome;

      if (!categoria) continue;

      vendasPorCategoria.set(
        categoria,
        (vendasPorCategoria.get(categoria) ?? 0) +
          item.quantidade,
      );
    }

    const categoriaMaisVendida = [
      ...vendasPorCategoria.entries(),
    ].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Sem vendas';

    // RETORNO DOS CARDS

    return {
      produtos: {
        value: totalProdutos,
        novosMes: novosProdutos,
        trend: calcularTrend(
          totalProdutos,
          totalProdutosAnterior,
        ),
      },

      semVenda: {
        value: Number(percentualSemVenda.toFixed(1)),
        quantidade: produtosSemVenda,
        trend: calcularTrend(
          produtosSemVenda,
          produtosSemVendaAnterior,
        ),
      },

      vendas: {
        value: quantidadeVendida,
        valor: valorVendas,
        trend: calcularTrend(
          quantidadeVendida,
          quantidadeVendidaAnterior,
        ),
      },

      campanhas: {
        value: quantidadeCampanhas,
        categoriaMaisVendida,
        trend: calcularTrend(
          campanhasMesAtual,
          campanhasMesAnterior,
        ),
      },
    };
  }

  
}
