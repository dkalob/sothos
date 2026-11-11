import { IsDateString, IsString, Length, Matches } from 'class-validator';

export class TelefoneDto {
  @IsString()
  @Length(3, 100, { message: 'Nome deve ter pelo menos 3 letras' })
  nome: string;

  @IsString()
  @Matches(/^\d{10,11}$/, { message: 'Telefone deve ter 10 ou 11 dígitos' })
  numero: string;

}
