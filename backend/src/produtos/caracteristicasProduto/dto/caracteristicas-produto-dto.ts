import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsArray,
  ArrayMinSize,
  MaxLength,
} from 'class-validator';
import { TipoCaracteristica } from '@prisma/client';

export class CaracteristicaProdutoDto {
  @IsString()
  @IsNotEmpty({ message: 'Nome da característica é obrigatório' })
  @MaxLength(100)
  nome: string;

  @IsEnum(TipoCaracteristica, {
    message: 'Tipo deve ser TEXTO, NUMERO, BOOLEANO ou OPCAO',
  })
  tipo: TipoCaracteristica;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1, { message: 'Informe ao menos uma opção' })
  @IsString({ each: true })
  opcoes?: string[];
}