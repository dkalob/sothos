import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PedidosController } from './pedidos.controller';
import { PedidosService } from './pedidos.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [AuthModule, PrismaModule, PassportModule],
  controllers: [PedidosController],
  providers: [PedidosService],
})
export class PedidosModule {}
