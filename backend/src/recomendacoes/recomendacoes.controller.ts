import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { RecomendacoesService } from './recomendacoes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsuarioLogado } from '../auth/usuario-logado.decorator';
import type { JwtPayload } from '../auth/jwt.strategy';

@Controller('recomendacoes')
@UseGuards(JwtAuthGuard)
export class RecomendacoesController {
  constructor(private readonly recomendacoesService: RecomendacoesService) {}

  // Associar clientes: cliente -> lista de produtos
  @Get('cliente/:id')
  produtosParaCliente(@Param('id') id: string, @UsuarioLogado() usuario: JwtPayload) {
    return this.recomendacoesService.recomendarProdutos(usuario.contaId, id);
  }

  // Associar produtos: produto -> lista de clientes
  @Get('produto/:id')
  clientesParaProduto(@Param('id') id: string, @UsuarioLogado() usuario: JwtPayload) {
    return this.recomendacoesService.recomendarClientes(usuario.contaId, id);
  }
}