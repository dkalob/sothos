import { Body, Controller, Get, Param, Post, Patch, UseGuards, Delete, Put } from "@nestjs/common";
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

    @Get(":id")
    async findOne(@Param("id") id: string, @UsuarioLogado() usuario: JwtPayload) {
        return this.pedidosService.findOne(usuario.contaId, id)
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() dto: PedidoDto, @UsuarioLogado() usuario: JwtPayload ) {
        return this.pedidosService.update(usuario.contaId, id, dto);
    }

    @Delete(':id')
    async remove(@Param('id') id: string, @UsuarioLogado() usuario: JwtPayload ) {
        return this.pedidosService.remove(usuario.contaId, id);
    }

}