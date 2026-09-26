import { Injectable } from '@nestjs/common';
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
            nome: 'asc'
        }
    })
  }
}