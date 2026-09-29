import { Controller, Post, Body, Get, Delete, Param, Put, UseGuards } from '@nestjs/common';
import { GrupoClientesDto } from './dto/grupo-clientes.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UsuarioLogado } from '../../auth/usuario-logado.decorator';
import type { JwtPayload } from '../../auth/jwt.strategy';
import { GrupoClientesService } from './grupo-clientes.service';

@Controller('clientes/grupos')
@UseGuards(JwtAuthGuard) // protege todas as rotas dessa controller
export class GrupoClientesController {
  constructor(private readonly grupoClientesService: GrupoClientesService) {}

  @Post()
  async create(@Body() dto: GrupoClientesDto, @UsuarioLogado() usuario: JwtPayload) {
    return this.grupoClientesService.create(usuario.contaId, dto);
  }

  @Get()
  async findAll(@UsuarioLogado() usuario: JwtPayload) {
    return this.grupoClientesService.findAll(usuario.contaId);
  }

  @Delete(":id")
  async delete(@Param("id") id:string, @UsuarioLogado() usuario: JwtPayload) {
    return this.grupoClientesService.delete(id, usuario.contaId)

  }


  
}
