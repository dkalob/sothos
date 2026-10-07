import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class ProdutoCaracteristicaValorDto {
  @IsUUID()
  caracteristicaId: string;

  @IsString()
  @IsNotEmpty()
  valor: string;
}