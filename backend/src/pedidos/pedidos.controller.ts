import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { PedidoDto } from "./dto/pedido.dto";
import { PedidosService } from "./pedidos.service";
import { UsuarioLogado } from "../auth/usuario-logado.decorator";
import type { JwtPayload } from "../auth/jwt.strategy";


@Controller('pedidos')
@UseGuards(JwtAuthGuard)
export class PedidosController {
    constructor(private readonly pedidosService: PedidosService) {}

    @Post()
    async create(@Body() dto: PedidoDto, @UsuarioLogado() usuario: JwtPayload) {
        return this.pedidosService.create(usuario.contaId, dto);
    }

    @Get()
    async findAll(@UsuarioLogado() usuario: JwtPayload) {
        return this.pedidosService.findAll(usuario.contaId);
}


}