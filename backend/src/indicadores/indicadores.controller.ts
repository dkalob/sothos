import { Controller, Get, UseGuards, Query } from '@nestjs/common';

import { IndicadoresService } from './indicadores.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsuarioLogado } from '../auth/usuario-logado.decorator';

type Periodo = 'DIARIO' | 'SEMANAL' | 'MENSAL';

@Controller('indicadores')
@UseGuards(JwtAuthGuard)
export class IndicadoresController {
  constructor(private readonly indicadoresService: IndicadoresService) {}

  @Get('clientes')
  async getCardClientes(@UsuarioLogado() usuario: { contaId: string }, @Query('periodo') periodo: Periodo) {
    return this.indicadoresService.getCardClientes(usuario.contaId, periodo);
  }

  @Get('vendas')
  async getCardLucro(@UsuarioLogado() usuario: { contaId: string }, @Query('periodo') periodo: Periodo, @Query('meta') meta: string) {
    return this.indicadoresService.getCardLucro(usuario.contaId,periodo,Number(meta));
  }

  @Get('campanhas')
  async getCardCampanhas(@UsuarioLogado() usuario: { contaId: string }, @Query('periodo') periodo: Periodo) {
    return this.indicadoresService.getCardCampanhas(usuario.contaId, periodo);
  }

  @Get('produtos')
  async getCardProduto(@UsuarioLogado() usuario: { contaId: string }, @Query('periodo') periodo: Periodo) {
    return this.indicadoresService.getCardProdutos(usuario.contaId, periodo);
  }

  @Get('grafico')
  async getGrafico(@UsuarioLogado() usuario: { contaId: string }, @Query('meta') meta: string) {
    return this.indicadoresService.getGrafico(usuario.contaId, Number(meta));
  }
  
}
