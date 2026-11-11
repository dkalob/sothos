import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { RfmModule } from '../rfm/rfm.module';
import { TelefoneService } from './telefone.service';
import { TelefoneController } from './telefone.controller';

@Module({
  imports: [PrismaModule, AuthModule, PassportModule, RfmModule],
  controllers: [TelefoneController],
  providers: [TelefoneService],
})
export class TelefoneModule {}
