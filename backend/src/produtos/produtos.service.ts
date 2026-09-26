import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProdutoDto } from './dto/produtos.dto';

@Injectable()
export class ProdutosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(contaId: string, dto: ProdutoDto) {
    return this.prisma.produto.create({
      data: {
        contaId,
        categoriaId: dto.categoriaId,
        nome: dto.nome,
        sku: dto.sku,
        precoAtual: dto.preco,
        imagem: dto.imagem,
        ativo: dto.ativo,
      },
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
      imagem: produto.imagem ?? "",
      nome: produto.nome,
      sku: produto.sku ?? "",
      campanhas: [],
      ultimaCompra: produto.itens[0]?.pedido.realizadoEm ?? null,
    }));
  }

}
