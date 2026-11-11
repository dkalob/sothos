import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TelefoneDto } from './dto/telefone.dto';

@Injectable()
export class TelefoneService {
  private readonly logger = new Logger(TelefoneService.name);
  constructor(private prisma: PrismaService) {}

  async create(dto: TelefoneDto, contaId: string) {
    return this.prisma.telefoneCampanha.create({
      data: {
        contaId,
        nome: dto.nome,
        numero: dto.numero,
      },
    });
  }

  async update(id: string, dto: TelefoneDto, contaId: string) {
    const telefone = await this.prisma.telefoneCampanha.findUnique({
      where: { id },
    });

    if (!telefone || telefone.contaId !== contaId) {
      // checa dono antes de editar
      throw new NotFoundException('Telefone não encontrado');
    }

    return this.prisma.telefoneCampanha.update({
      where: { id },
      data: {
        nome: dto.nome,
        numero: dto.numero,
      },
    });
  }

  async remove(id: string, contaId: string) {
    const telefone = await this.prisma.telefoneCampanha.findUnique({
      where: { id },
    });

    if (!telefone || telefone.contaId !== contaId) {
      // checa dono antes de editar
      throw new NotFoundException('Telefone não encontrado');
    }

    return this.prisma.telefoneCampanha.delete({
      where: { id },
    });
  }

  async findAll(contaId: string) {
    const telefones = await this.prisma.telefoneCampanha.findMany({
        where: { contaId },
        select: {
            id: true,
            nome: true,
            numero: true,
            criadoEm: true
        }
    })

    return telefones.map((t) => ({
        id: t.id,
        nome: t.nome,
        numero: t.numero,
        criadoEm: t.criadoEm
    }))
  }


}
