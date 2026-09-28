import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { CategoriasService } from './categorias.service';
import { CriarCategoriaDto } from './dto/criar-categoria.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsuarioLogado } from '../auth/usuario-logado.decorator';
import type { JwtPayload } from '../auth/jwt.strategy';
import { AtualizarCategoriaDto } from './dto/atualizar-categoria.dto';

@Controller('categorias')
@UseGuards(JwtAuthGuard)
export class CategoriasController {
    constructor(private readonly categoriasService: CategoriasService) {}

    @Post()
    async create(@Body() dto: CriarCategoriaDto, @UsuarioLogado() usuario: JwtPayload) {
        return this.categoriasService.create(usuario.contaId, dto);
    }

    @Get()
    async findAll(@UsuarioLogado() usuario: JwtPayload) {
        return this.categoriasService.findAll(usuario.contaId)
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() dto: CriarCategoriaDto, @UsuarioLogado() usuario: JwtPayload, ) {
        return this.categoriasService.update(
            usuario.contaId,
            id,
            dto,
        );
    }

  @Delete(':id') 
  async remove(@Param('id') id: string, @UsuarioLogado() usuario: JwtPayload, ) {
        return this.categoriasService.remove(
            usuario.contaId,
            id,
        );
    }
}



