import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CriarCategoriaDto } from './dto/criar-categoria.dto';

@Injectable()
export class CategoriasService {
  constructor(private readonly prisma: PrismaService) {}

  async create(contaId: string, dto: CriarCategoriaDto) {
    return this.prisma.categoriaProduto.create({
      data: {
        contaId,
        nome: dto.nome,
      },
    });
  }

  async findAll(contaId: string) {
    return this.prisma.categoriaProduto.findMany({
      where: {
        contaId,
        ativo: true,
      },
      orderBy: {
        nome: 'asc',
      },
    });
  }

  async update(contaId: string, id: string, dto: CriarCategoriaDto) {
    const categoria = await this.prisma.categoriaProduto.findFirst({
      where: {
        id,
        contaId,
        ativo: true,
      },
    });

    if (!categoria) {
      throw new ConflictException('Categoria não encontrada');
    }

    return this.prisma.categoriaProduto.update({
      where: {
        id,
      },
      data: {
        nome: dto.nome,
      },
    });
  }

  async remove(contaId: string, id: string) {
    const categoria = await this.prisma.categoriaProduto.findFirst({
      where: {
        id,
        contaId,
      },
    });

    if (!categoria) {
      throw new ConflictException('Categoria não encontrada');
    }

    return this.prisma.categoriaProduto.delete({
      where: {
        id,
      },
    });
  }
}
