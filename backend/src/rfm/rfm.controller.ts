import { Controller, Post, UseGuards } from "@nestjs/common";
import { RfmService } from "./rfm.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { UsuarioLogado } from "../auth/usuario-logado.decorator";
import { JwtPayload } from "../auth/jwt.strategy";

@Controller('rfm')
@UseGuards(JwtAuthGuard)
export class RFMController {
    constructor(private readonly rfmService: RfmService) {}

    @Post('recalcular')
        async recalcular(@UsuarioLogado() usuario: { contaId: string }) {
            await this.rfmService.recalcular(usuario.contaId);
            return { ok: true}
        }
}