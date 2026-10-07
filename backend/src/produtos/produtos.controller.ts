import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ProdutosService } from './produtos.service';
import { ProdutoDto } from './dto/produtos.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsuarioLogado } from '../auth/usuario-logado.decorator';
import { JwtPayload } from '../auth/jwt.strategy';

@Controller('produtos')
@UseGuards(JwtAuthGuard)
export class ProdutosController {
  constructor(private readonly produtosService: ProdutosService) {}

  @Post()
  async create(@Body() dto: ProdutoDto, @UsuarioLogado() usuario: { contaId: string }, ) {
    return this.produtosService.create(usuario.contaId, dto);
  }

  @Get('combobox')
  async findForCombobox(@UsuarioLogado() usuario: { contaId: string },) {
    return this.produtosService.findAllCombobox(usuario.contaId);
  }

  @Get()
  async findAll(@UsuarioLogado() usuario: { contaId: string }, ) {
    return this.produtosService.findAll(usuario.contaId);
  }

  @Delete(":id")
  async delete(@Param("id") id: string, @UsuarioLogado() usuario: { contaId: string}) {
    return this.produtosService.delete(id, usuario.contaId)
  }


}



