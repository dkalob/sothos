import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
// use os mesmos imports de JwtAuthGuard, UsuarioLogado e JwtPayload dos outros controllers
import { MensagensIaService } from './mensagens.service';
import { AtualizarMensagemDto, GerarMensagemDto } from './dto/mensagens.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsuarioLogado } from '../auth/usuario-logado.decorator';


@Controller('mensagens')
@UseGuards(JwtAuthGuard)
export class MensagensIaController {
  constructor(private readonly service: MensagensIaService) {}

  @Post('gerar')
  gerar(@Body() dto: GerarMensagemDto, @UsuarioLogado() usuario: {contaId: string}) {
    return this.service.gerar(dto, usuario.contaId);
  }

  @Get()
  listar(@UsuarioLogado() usuario: { contaId: string}, @Query("tipo") tipo?: string) {
    const tipoValido =
      tipo === "EMAIL" || tipo === "WHATSAPP" ? tipo: undefined
    return this.service.listar(usuario.contaId, tipoValido
    )  
  }

  @Get(":id")
  buscarUma(@Param('id') id: string, @UsuarioLogado() usuario: { contaId: string}) {
    return this.service.buscarUma(id, usuario.contaId)
  }

  @Put(":id")
  atualizar(@Param('id') id: string, @Body() dto: AtualizarMensagemDto, @UsuarioLogado() usuario: { contaId: string }, ) {
    return this.service.atualizar(id, dto, usuario.contaId);
  }

  @Delete("id")
  remover(@Param('id') id: string, @UsuarioLogado() usuario: { contaId: string }, ) {
    return this.service.remover(id, usuario.contaId)
  }



}