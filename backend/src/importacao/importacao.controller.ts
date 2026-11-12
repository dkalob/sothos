import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ImportacaoService } from './importacao.service';

const TAMANHO_MAXIMO = 5 * 1024 * 1024; // 5 MB

@Controller('importacao')
@UseGuards(JwtAuthGuard)
export class ImportacaoController {
  constructor(private readonly importacaoService: ImportacaoService) {}

  // Recebe o CSV no campo "arquivo" (multipart/form-data)
  @Post('previa')
  @UseInterceptors(
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
    }),
  )
  previa(@UploadedFile() arquivo?: Express.Multer.File) {
    if (!arquivo) {
      throw new BadRequestException('Nenhum arquivo enviado.');
    }
    return this.importacaoService.gerarPrevia(arquivo.buffer);
  }
}