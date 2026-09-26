import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ProdutosService } from './produtos.service';
import { ProdutoDto } from './dto/produtos.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsuarioLogado } from '../auth/usuario-logado.decorator';

@Controller('produtos')
export class ProdutosController {
  constructor(private readonly produtosService: ProdutosService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: ProdutoDto, @UsuarioLogado() usuario: { contaId: string }, ) {
    return this.produtosService.create(usuario.contaId, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@UsuarioLogado() usuario: { contaId: string }, ) {
    return this.produtosService.findAll(usuario.contaId);
  }


}



