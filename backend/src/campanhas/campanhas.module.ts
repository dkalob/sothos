import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { CampanhasController } from './campanhas.controller';
import { CampanhasService } from './campanhas.service';
import { MensagensIaModule } from '../mensagens/mensagens.module';

@Module({
  imports: [PrismaModule, AuthModule, PassportModule, MensagensIaModule,],
  controllers: [CampanhasController],
  providers: [CampanhasService],
})
export class CampanhasModule {}