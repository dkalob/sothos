import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';

import { CampanhasService } from './campanhas.service';
import { CriarCampanhaDto } from './dto/campanhas.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsuarioLogado } from '../auth/usuario-logado.decorator';

@Controller('campanhas')
@UseGuards(JwtAuthGuard)
export class CampanhasController {
  constructor(private readonly campanhasService: CampanhasService) {}

  @Post()
  create(@Body() dto: CriarCampanhaDto, @UsuarioLogado() usuario: { contaId: string }) {
    return this.campanhasService.create(dto, usuario.contaId);
  }

  @Get()findAll(@UsuarioLogado() usuario: { contaId: string }) {
    return this.campanhasService.findAll(usuario.contaId);
  }

  @Get(':id')
    findOne(@Param('id') id: string, @UsuarioLogado() usuario: { contaId: string }) {
      return this.campanhasService.findOne(id, usuario.contaId);
  }

  @Put(':id')
    update(@Param('id') id: string, @Body() dto: CriarCampanhaDto, @UsuarioLogado() usuario: { contaId: string }) {
      return this.campanhasService.update(id, dto, usuario.contaId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @UsuarioLogado() usuario: { contaId: string }) {
    return this.campanhasService.remove(id, usuario.contaId);
  }
  
}