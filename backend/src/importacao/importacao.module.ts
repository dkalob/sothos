import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { RfmModule } from '../rfm/rfm.module';
import { ImportacaoController } from './importacao.controller';
import { ImportacaoService } from './importacao.service';
import { ImportacaoProdutosService } from './importacao-produtos.service';

@Module({
  imports: [PrismaModule, AuthModule, PassportModule, RfmModule],
  controllers: [ImportacaoController],
  providers: [ImportacaoService, ImportacaoProdutosService],
})
export class ImportacaoModule {}