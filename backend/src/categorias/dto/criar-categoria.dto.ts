import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CriarCategoriaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nome: string;
}
