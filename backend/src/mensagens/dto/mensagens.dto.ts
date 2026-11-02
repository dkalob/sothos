import { ObjetivoCampanha, TipoCampanha, TomCampanha } from '@prisma/client';
import { IsString, Length, IsOptional, IsEnum } from 'class-validator';

export class MensagemDto {

  @IsString()
  @Length(3, 160, { message: 'Título deve ter pelo menos 3 letras' })
  titulo: string;

  @IsString()
  @IsOptional()
  abservacoes: string;

  @IsString()
  @IsOptional()
  assunto: string;

  @IsString()
  conteudo: string;

  @IsString()
  @IsOptional()
  imagemUrl: string;

  @IsEnum(TipoCampanha)
  tipo: TipoCampanha

  @IsEnum(TomCampanha)
  tom: TomCampanha

  @IsEnum(ObjetivoCampanha)
  objetivo: ObjetivoCampanha


}