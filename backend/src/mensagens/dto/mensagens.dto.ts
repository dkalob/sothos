import { IsEnum, IsIn, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { ObjetivoCampanha, TipoCampanha, TomCampanha } from '@prisma/client';

export class GerarMensagemDto {
  @IsUUID()
  produtoId!: string;

  @IsIn([TipoCampanha.EMAIL, TipoCampanha.WHATSAPP])
  tipo!: TipoCampanha;

  @IsEnum(TomCampanha)
  tom!: TomCampanha;

  @IsEnum(ObjetivoCampanha)
  objetivo!: ObjetivoCampanha;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  observacoes?: string;
}

export class AtualizarMensagemDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  conteudo!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  assunto?: string;

  @IsString()
  @MaxLength(200)
  titulo: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  textoBotao?: string;
}