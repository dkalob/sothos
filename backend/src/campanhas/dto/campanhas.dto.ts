import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { TipoCampanha } from '@prisma/client';

export class CriarCampanhaDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(3)
  @MaxLength(160)
  titulo!: string;

  @IsIn([TipoCampanha.EMAIL, TipoCampanha.WHATSAPP])
  tipo!: TipoCampanha;

  @IsUUID()
  mensagemId!: string;

  @IsUUID()
  grupoId!: string;

  @IsDateString()
  agendadaPara!: string;
}