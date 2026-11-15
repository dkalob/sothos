
import { Module } from '@nestjs/common';
import { ExportacaoController } from './exportacao.controller';
import { ExportacaoService } from './exportacao.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [PrismaModule, AuthModule, PassportModule],
  controllers: [ExportacaoController],
  providers: [ExportacaoService],
})
export class ExportacaoModule {}
