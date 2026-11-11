import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { TelefoneService } from "./telefone.service";
import { TelefoneDto } from "./dto/telefone.dto";
import { UsuarioLogado } from "../auth/usuario-logado.decorator";
import type { JwtPayload } from '../auth/jwt.strategy';

@Controller('telefones')
@UseGuards(JwtAuthGuard)
export class TelefoneController {
    constructor(private readonly telefoneService: TelefoneService) {}
    
    @Post()
    async create(@Body() dto: TelefoneDto, @UsuarioLogado() usuario: { contaId: string }) {
        return this.telefoneService.create(dto, usuario.contaId);
    }

    @Get()
      async findAll(@UsuarioLogado() usuario: { contaId: string }) {
        return this.telefoneService.findAll(usuario.contaId);
    }

    @Put(':id')
      async update(@Param('id') id: string, @Body() dto: TelefoneDto, @UsuarioLogado() usuario: { contaId: string }) {
        return this.telefoneService.update(id, dto, usuario.contaId);
    }
    
    @Delete(":id")
      async remove(@Param("id") id: string, @UsuarioLogado() usuario: { contaId: string }) {
        return this.telefoneService.remove(id, usuario.contaId);
    }






}