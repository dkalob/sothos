import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CaracteristicaProdutoService } from './caracteristicas-produto-service';
import { CaracteristicaProdutoDto } from './dto/caracteristicas-produto-dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UsuarioLogado } from '../../auth/usuario-logado.decorator';
import type { JwtPayload } from '../../auth/jwt.strategy';


@Controller('caracteristicas-produto')
@UseGuards(JwtAuthGuard) 
export class CaracteristicaProdutoController {
  constructor(private readonly caracteristicaProdutoService: CaracteristicaProdutoService) {}

  @Post()
  async create(@Body() dto: CaracteristicaProdutoDto, @UsuarioLogado() usuario: JwtPayload ) {
    return this.caracteristicaProdutoService.create(usuario.contaId, dto);
  }

  @Get()
  async findAll(@UsuarioLogado() usuario: JwtPayload) {
    return this.caracteristicaProdutoService.findAll(usuario.contaId);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: CaracteristicaProdutoDto, @UsuarioLogado() usuario: JwtPayload) {
    return this.caracteristicaProdutoService.update(id, usuario.contaId, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @UsuarioLogado() usuario: JwtPayload) {
    return this.caracteristicaProdutoService.remove(id, usuario.contaId);
  }
}