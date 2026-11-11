import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RfmService } from './rfm.service';
import { AuthModule } from '../auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { RFMController } from './rfm.controller';

@Module({
  imports: [PrismaModule, AuthModule, PassportModule],
  controllers: [RFMController],
  providers: [RfmService],
  exports: [RfmService],
})

export class RfmModule {}