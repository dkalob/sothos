import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PedidosController } from './pedidos.controller';
import { PedidosService } from './pedidos.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PassportModule } from '@nestjs/passport';
import { RfmModule } from '../rfm/rfm.module';

@Module({
  imports: [AuthModule, PrismaModule, PassportModule, RfmModule],
  controllers: [PedidosController],
  providers: [PedidosService],
})
export class PedidosModule {}
