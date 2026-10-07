import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../../auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { CaracteristicaProdutoService } from './caracteristicas-produto-service';
import { CaracteristicaProdutoController } from './caracteristicas-produto-controller';

@Module({
  imports: [PrismaModule, AuthModule, PassportModule],
  controllers: [CaracteristicaProdutoController],
  providers: [CaracteristicaProdutoService],
})
export class CaracteristicaProdutoModule {}