import { IsNotEmpty, IsString } from 'class-validator';

export class AtualizarCategoriaDto {
  @IsString()
  @IsNotEmpty()
  nome: string;
}
