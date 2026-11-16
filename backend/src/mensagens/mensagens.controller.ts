
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MensagensIaService } from './mensagens.service';
import { AtualizarMensagemDto, GerarMensagemDto } from './dto/mensagens.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsuarioLogado } from '../auth/usuario-logado.decorator';
import { CloudflareService } from '../ia/cloudflare.service';
import { CloudinaryImageService } from '../ia/cloudinary-image.service';
import { TipoCampanha } from '@prisma/client';

@Controller('mensagens')
@UseGuards(JwtAuthGuard)
export class MensagensIaController {
  constructor(
    private readonly service: MensagensIaService,
    private readonly cloudflareService: CloudflareService,
    private readonly cloudinaryImageService: CloudinaryImageService,
  ) {}

  @Post('gerar')
  gerar(
    @Body() dto: GerarMensagemDto,
    @UsuarioLogado() usuario: { contaId: string },
  ) {
    return this.service.gerar(dto, usuario.contaId);
  }

  @Post(':id/adaptar')
  adaptar(
    @Param('id') id: string,
    @Body('tipo') tipo: TipoCampanha,
    @UsuarioLogado() usuario: { contaId: string },
  ) {
    return this.service.adaptar(id, tipo, usuario.contaId);
  }

  @Get()
  listar(
    @UsuarioLogado() usuario: { contaId: string },
    @Query('tipo') tipo?: string,
  ) {
    const tipoValido =
      tipo === 'EMAIL' || tipo === 'WHATSAPP' ? tipo : undefined;
    return this.service.listar(usuario.contaId, tipoValido);
  }

  @Get(':id')
  buscarUma(
    @Param('id') id: string,
    @UsuarioLogado() usuario: { contaId: string },
  ) {
    return this.service.buscarUma(id, usuario.contaId);
  }

  @Put(':id')
  atualizar(
    @Param('id') id: string,
    @Body() dto: AtualizarMensagemDto,
    @UsuarioLogado() usuario: { contaId: string },
  ) {
    return this.service.atualizar(id, dto, usuario.contaId);
  }

  @Delete(':id')
  remover(
    @Param('id') id: string,
    @UsuarioLogado() usuario: { contaId: string },
  ) {
    return this.service.remover(id, usuario.contaId);
  }

  @Post('testar-imagem')
  testarImagem() {
    return this.cloudflareService.testar();
  }

  @Post('testar-imagem-com-referencia')
  testarImagemComReferencia(@Body('imagemUrl') imagemUrl: string) {
    return this.cloudflareService.testarComReferencia(imagemUrl);
  }


  @Post(':id/reprocessar-imagem')
  reprocessarImagem(
    @Param('id') id: string, @Body('instrucao') instrucao: string, @UsuarioLogado() usuario: { contaId: string }) {
    return this.service.reprocessarImagem(
      id,
      instrucao,
      usuario.contaId,
    );
  }


  
}
