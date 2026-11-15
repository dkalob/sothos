
import {
  Controller,
  Get,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsuarioLogado } from '../auth/usuario-logado.decorator';
import type { JwtPayload } from '../auth/jwt.strategy';
import { ExportacaoService } from './exportacao.service';

@Controller('exportacao')
@UseGuards(JwtAuthGuard)
export class ExportacaoController {
  constructor(
    private readonly exportacaoService: ExportacaoService,
  ) {}

  private enviarCsv(
    resposta: Response,
    conteudo: string,
    nomeArquivo: string,
  ) {
    resposta.set({
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${nomeArquivo}"`,
      'Cache-Control': 'no-store',
    });

    resposta.send(conteudo);
  }

  @Get('clientes')
  async exportarClientes(
    @UsuarioLogado() usuario: JwtPayload,
    @Res() resposta: Response,
  ) {
    const csv = await this.exportacaoService.exportarClientes(
      usuario.contaId,
    );

    this.enviarCsv(resposta, csv, 'clientes.csv');
  }

  @Get('produtos')
  async exportarProdutos(
    @UsuarioLogado() usuario: JwtPayload,
    @Res() resposta: Response,
  ) {
    const csv = await this.exportacaoService.exportarProdutos(
      usuario.contaId,
    );

    this.enviarCsv(resposta, csv, 'produtos.csv');
  }

  @Get('pedidos')
  async exportarPedidos(
    @UsuarioLogado() usuario: JwtPayload,
    @Res() resposta: Response,
  ) {
    const csv = await this.exportacaoService.exportarPedidos(
      usuario.contaId,
    );

    this.enviarCsv(resposta, csv, 'pedidos.csv');
  }
}
