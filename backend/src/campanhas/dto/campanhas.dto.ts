import { TipoCampanha } from '@prisma/client';
import { IsString, Length, IsOptional, IsEnum } from 'class-validator';

export class CampanhaDto {

  @IsString()
  @Length(3, 160, { message: 'Título deve ter pelo menos 3 letras' })
  titulo: string;

  @IsString()
  @IsOptional()
  assunto: string;

  @IsString()
  @IsOptional()
  conteudo: string;

  @IsEnum(TipoCampanha)
  tipo: TipoCampanha


}