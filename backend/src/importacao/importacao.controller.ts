import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsuarioLogado } from '../auth/usuario-logado.decorator';
import type { JwtPayload } from '../auth/jwt.strategy';
import { ImportacaoService } from './importacao.service';
import { ImportacaoProdutosService } from './importacao-produtos.service';
import { ExecutarImportacaoDto } from './dto/executar-importacao.dto';

const TAMANHO_MAXIMO = 5 * 1024 * 1024; // 5 MB

// Mesmas regras de upload para a prévia e para a importação
const uploadCsv = () =>
  FileInterceptor('arquivo', {
    storage: memoryStorage(), // arquivo fica na memória, nunca é salvo em disco
    limits: { fileSize: TAMANHO_MAXIMO, files: 1 },
    fileFilter: (_req, arquivo, callback) => {
      const ehCsv = arquivo.originalname.toLowerCase().endsWith('.csv');
      callback(
        ehCsv ? null : new BadRequestException('Envie um arquivo .csv.'),
        ehCsv,
      );
    },
  });

@Controller('importacao')
@UseGuards(JwtAuthGuard)
export class ImportacaoController {
  constructor(
    private readonly importacaoService: ImportacaoService,
    private readonly importacaoProdutosService: ImportacaoProdutosService,
  ) {}

  // ===================== PEDIDOS =====================

  // Etapa 1: lê o arquivo e devolve colunas, primeiras linhas e sugestão
  // de mapeamento. Não grava nada.
  @Post('previa')
  @UseInterceptors(uploadCsv())
  previa(@UploadedFile() arquivo?: Express.Multer.File) {
    if (!arquivo) {
      throw new BadRequestException('Nenhum arquivo enviado.');
    }
    return this.importacaoService.gerarPrevia(arquivo.buffer);
  }

  // Etapa 2: grava clientes, produtos e pedidos da conta do usuário logado.
  // form-data: arquivo (File), mapeamento (texto JSON), aceitaMarketing ("true"/"false")
  @Post('executar')
  @UseInterceptors(uploadCsv())
  executar(
    @UploadedFile() arquivo: Express.Multer.File | undefined,
    @Body() dto: ExecutarImportacaoDto,
    @UsuarioLogado() usuario: JwtPayload,
  ) {
    if (!arquivo) {
      throw new BadRequestException('Nenhum arquivo enviado.');
    }
    return this.importacaoService.executar(
      usuario.contaId,
      arquivo.buffer,
      dto.mapeamento,
      dto.aceitaMarketing === 'true',
    );
  }

  // ===================== PRODUTOS (catálogo) =====================

  @Post('produtos/previa')
  @UseInterceptors(uploadCsv())
  previaProdutos(@UploadedFile() arquivo?: Express.Multer.File) {
    if (!arquivo) {
      throw new BadRequestException('Nenhum arquivo enviado.');
    }
    return this.importacaoProdutosService.gerarPrevia(arquivo.buffer);
  }

  // form-data: arquivo (File), mapeamento (texto JSON)
  @Post('produtos/executar')
  @UseInterceptors(uploadCsv())
  executarProdutos(
    @UploadedFile() arquivo: Express.Multer.File | undefined,
    @Body() dto: ExecutarImportacaoDto,
    @UsuarioLogado() usuario: JwtPayload,
  ) {
    if (!arquivo) {
      throw new BadRequestException('Nenhum arquivo enviado.');
    }
    return this.importacaoProdutosService.executar(
      usuario.contaId,
      arquivo.buffer,
      dto.mapeamento,
    );
  }
}