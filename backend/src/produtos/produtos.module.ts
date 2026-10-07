import { Module } from '@nestjs/common';
import { ProdutosController } from './produtos.controller';
import { ProdutosService } from './produtos.service';
import { AuthModule } from '../auth/auth.module';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [AuthModule, PassportModule],
  controllers: [ProdutosController],
  providers: [ProdutosService],
})
export class ProdutosModule {}
