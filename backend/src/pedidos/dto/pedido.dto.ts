import {
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ItemPedidoDto } from './item-pedido.dto';

export class PedidoDto {
  @IsOptional()
  @IsUUID()
  clienteId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemPedidoDto)
  itens: ItemPedidoDto[];

  @IsNumber()
  @Min(0)
  valorFrete: number;

  @IsNumber()
  @Min(0)
  valorDesconto: number;

  @IsString()
  status: string;

  @IsDateString()
  realizadoEm: string;

  @IsOptional()
  @IsString()
  numero?: string;
}
