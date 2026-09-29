import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../../auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { GrupoClientesService } from './grupo-clientes.service';
import { GrupoClientesController } from './grupo-clientes.controller';

@Module({
  imports: [PrismaModule, AuthModule, PassportModule],
  controllers: [GrupoClientesController],
  providers: [GrupoClientesService],
})
export class GrupoClientesModule {}
