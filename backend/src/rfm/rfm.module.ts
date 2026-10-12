import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RfmService } from './rfm.service';

@Module({
  imports: [PrismaModule],
  providers: [RfmService],
  exports: [RfmService], 
})
export class RfmModule {}