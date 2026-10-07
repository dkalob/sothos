import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TipoCaracteristica } from '@prisma/client';
import { CaracteristicaProdutoDto } from './dto/caracteristicas-produto-dto';

@Injectable()
export class CaracteristicaProdutoService {
  constructor(private prisma: PrismaService) {}

  async create(contaId: string, dto: CaracteristicaProdutoDto) {

    if (dto.tipo === TipoCaracteristica.OPCAO && (!dto.opcoes || dto.opcoes.length === 0)) {
      throw new BadRequestException(
        'Características do tipo OPCAO precisam de ao menos uma opção.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const caracteristica = await tx.caracteristicaProduto.create({
        data: {
          contaId,
          nome: dto.nome,
          tipo: dto.tipo,
          opcoes:
            dto.tipo === TipoCaracteristica.OPCAO
              ? {
                  create: dto.opcoes!.map((valor, index) => ({
                    valor,
                    ordem: index,
                  })),
                }
              : undefined,
        },
        include: {
          opcoes: true,
        },
      });

      return caracteristica;
    });
  }

  async findAll(contaId: string) {
    const caracteristicas = await this.prisma.caracteristicaProduto.findMany({
      where: { contaId },
      orderBy: { criadoEm: 'desc' },
      include: {
        opcoes: {
          orderBy: { ordem: 'asc' },
        },
      },
    });

    return caracteristicas.map((caracteristica) => ({
      id: caracteristica.id,
      nome: caracteristica.nome,
      tipo: caracteristica.tipo,
      ativo: caracteristica.ativo,
      opcoes: caracteristica.opcoes.map((opcao) => opcao.valor),
    }));
  }

  async update(id: string, contaId: string, dto: CaracteristicaProdutoDto) {
    const caracteristica = await this.prisma.caracteristicaProduto.findUnique({
      where: { id },
    });

    if (!caracteristica || caracteristica.contaId !== contaId) {
      throw new NotFoundException('Característica não encontrada');
    }

    if (dto.tipo === TipoCaracteristica.OPCAO && (!dto.opcoes || dto.opcoes.length === 0)) {
      throw new BadRequestException(
        'Características do tipo OPCAO precisam de ao menos uma opção.',
      );
    }

    return this.prisma.$transaction(async (tx) => {

      await tx.caracteristicaOpcao.deleteMany({
        where: { caracteristicaId: id },
      });

      const atualizada = await tx.caracteristicaProduto.update({
        where: { id },
        data: {
          nome: dto.nome,
          tipo: dto.tipo,
          opcoes:
            dto.tipo === TipoCaracteristica.OPCAO
              ? {
                  create: dto.opcoes!.map((valor, index) => ({
                    valor,
                    ordem: index,
                  })),
                }
              : undefined,
        },
        include: {
          opcoes: true,
        },
      });

      return atualizada;
    });
  }

  async remove(id: string, contaId: string) {
    const caracteristica = await this.prisma.caracteristicaProduto.findUnique({
      where: { id },
    });

    if (!caracteristica || caracteristica.contaId !== contaId) {
      throw new NotFoundException('Característica não encontrada');
    }

    await this.prisma.caracteristicaProduto.delete({
      where: { id },
    });

    return { message: 'Característica excluída' };
  }
}