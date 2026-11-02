import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { MensagemDto } from "./dto/mensagens.dto";

@Injectable()
export class MensagensService {
    constructor(private prisma: PrismaService) {}

    async create(dto: MensagemDto, contaId: string) {
        return this.prisma.mensagemIa.create({
            data: {
                contaId,
                titulo: dto.titulo,
                tipo: dto.tipo,
                tom: dto.tom,
                objetivo: dto.objetivo,
                assunto: dto.assunto,
                conteudo: dto.conteudo
            },
        })
    }
}