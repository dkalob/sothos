import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { EmailModule } from './email/email.module';
import { AuthModule } from './auth/auth.module';
import { ClientesModule } from './clientes/clientes.module';
import { CategoriasModule } from './categorias/categorias.module';
import { ProdutosModule } from './produtos/produtos.module';
import { PedidosModule } from './pedidos/pedidos.module';
import { GrupoClientesModule } from './clientes/grupoDeClientes/grupo-clientes.module';
import { CaracteristicaProdutoModule } from './produtos/caracteristicasProduto/caracteristicas-produto-module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    EmailModule,
    AuthModule,
    GrupoClientesModule,
    ClientesModule,
    CategoriasModule,
    ProdutosModule,
    PedidosModule,
    CaracteristicaProdutoModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}