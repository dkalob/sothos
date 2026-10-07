import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ProdutoCaracteristicaValorDto } from '../caracteristicasProduto/dto/caracteristicas-produto-valor-dto';

export class ProdutoDto {
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  nome: string;

  @IsUUID()
  categoriaId: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  sku?: string;

  @IsNumber()
  @Min(0)
  preco: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  imagem?: string;

  @IsBoolean()
  ativo: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProdutoCaracteristicaValorDto)
  caracteristicas?: ProdutoCaracteristicaValorDto[];
}
