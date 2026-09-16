import { Controller, Post, Body, Get, Delete, Param, Put, UseGuards } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { ClienteDto } from './dto/client.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsuarioLogado } from '../auth/usuario-logado.decorator';
import type { JwtPayload } from '../auth/jwt.strategy';

@Controller('clientes')
@UseGuards(JwtAuthGuard) // protege todas as rotas dessa controller
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Post()
  async create(@Body() dto: ClienteDto, @UsuarioLogado() usuario: JwtPayload) {
    return this.clientesService.create(dto, usuario.contaId);
  }

  @Get()
  async findAll(@UsuarioLogado() usuario: JwtPayload) {
    return this.clientesService.findAll(usuario.contaId);
  }

  @Get(":id")
  async findOne(@Param("id") id: string, @UsuarioLogado() usuario: JwtPayload) {
    return this.clientesService.findOne(id, usuario.contaId);
  }

  @Put(':id')
  async update( @Param('id') id: string, @Body() dto: ClienteDto, @UsuarioLogado() usuario: JwtPayload,) {
    return this.clientesService.update(id, dto, usuario.contaId);
  }

  @Delete(":id")
  async remove(@Param("id") id: string, @UsuarioLogado() usuario: JwtPayload) {
    return this.clientesService.remove(id, usuario.contaId);
}
}
