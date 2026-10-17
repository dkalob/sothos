import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { RecomendacoesController } from './recomendacoes.controller';
import { RecomendacoesService } from './recomendacoes.service';

@Module({
  imports: [PrismaModule, AuthModule, PassportModule],
  controllers: [RecomendacoesController],
  providers: [RecomendacoesService],
})
export class RecomendacoesModule {}