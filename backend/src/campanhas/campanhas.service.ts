import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CampanhaDto } from "./dto/campanhas.dto";

@Injectable()
export class CampanhasService {
    constructor(private prisma: PrismaService) {}

    async create(dto: CampanhaDto, contaId: string) {
        return this.prisma.campanha.create({
            data: {
                contaId,
                titulo: dto.titulo,
                tipo: dto.tipo,
                assunto: dto.assunto,
                conteudo: dto.conteudo
            },
        })
    }
}