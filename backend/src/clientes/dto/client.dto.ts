import { IsString, IsEmail, Length, Matches, IsOptional } from 'class-validator';

export class ClienteDto {
  @IsString()
  @Length(3, 100, { message: 'Nome deve ter pelo menos 3 letras' })
  nome: string;

  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @IsString()
  @Matches(/^\d{10,11}$/, { message: 'Telefone deve ter 10 ou 11 dígitos' })
  telefone: string;

  @IsOptional()
  @Matches(/^\d{11}$/, { message: 'CPF deve ter 11 dígitos' })
  cpf?: string;

  @IsString()
  estado: string;

  @IsString()
  cidade: string;

  @IsOptional()
  aceitaMarketing?: boolean;
}
