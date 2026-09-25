import { IsDateString, IsNumber, IsString, IsUUID } from 'class-validator';

export class PedidoDto {
  @IsUUID()
  clienteId: string;

  @IsString()
  produto: string;

  @IsNumber()
  valorTotal: number;

  @IsDateString()
  realizadoEm: string;
}
