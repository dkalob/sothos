import { Controller, Body, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CampanhasService } from "./campanhas.service";
import { CampanhaDto } from "./dto/campanhas.dto";
import { UsuarioLogado } from "../auth/usuario-logado.decorator";

@Controller('campanhas')
@UseGuards(JwtAuthGuard)
export class CampanhasController {
    constructor(private readonly campanhasService: CampanhasService) {}

    @Post()
    async create(@Body() dto: CampanhaDto, @UsuarioLogado() usuario: { contaId: string}) {
        return this.campanhasService.create(dto, usuario.contaId)
    }
}