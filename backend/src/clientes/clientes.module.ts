import { Module } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { ClientesController } from './clientes.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { RfmModule } from '../rfm/rfm.module';

@Module({
  imports: [PrismaModule, AuthModule, PassportModule, RfmModule],
  controllers: [ClientesController],
  providers: [ClientesService],
})
export class ClientesModule {}
