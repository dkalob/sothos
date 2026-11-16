import { Module } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { CloudflareService } from './cloudflare.service';
import { CloudinaryImageService } from './cloudinary-image.service';

@Module({
  providers: [GeminiService, CloudflareService, CloudinaryImageService],
  exports: [GeminiService, CloudflareService, CloudinaryImageService],
})
export class IaModule {}