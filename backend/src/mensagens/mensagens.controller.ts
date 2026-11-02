import { Controller, Body, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { MensagensService } from "./mensagens.service";
import { MensagemDto } from "./dto/mensagens.dto";
import { UsuarioLogado } from "../auth/usuario-logado.decorator";

@Controller('mensagens')
@UseGuards(JwtAuthGuard)
export class MensagensController {
    constructor(private readonly mensagensService: MensagensService) {}

    @Post()
    async create(@Body() dto: MensagemDto, @UsuarioLogado() usuario: { contaId: string}) {
        return this.mensagensService.create(dto, usuario.contaId)
    }
}