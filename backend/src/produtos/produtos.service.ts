import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProdutoDto } from './dto/produtos.dto';

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

  
}
