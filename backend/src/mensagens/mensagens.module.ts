import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { IaModule } from '../ia/ia.module';
import { MensagensIaController } from './mensagens.controller';
import { MensagensIaService } from './mensagens.service';

@Module({
  imports: [PrismaModule, AuthModule, PassportModule, IaModule],
  controllers: [MensagensIaController],
  providers: [MensagensIaService],
})
export class MensagensIaModule {}