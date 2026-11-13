import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import { PassportModule } from "@nestjs/passport";
import { IndicadoresController } from "./indicadores.controller";
import { IndicadoresService } from "./indicadores.service";

@Module({
  imports: [AuthModule, PrismaModule, PassportModule],
  controllers: [IndicadoresController],
  providers: [IndicadoresService],
})
export class IndicadoresModule {}