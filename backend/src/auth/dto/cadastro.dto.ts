import { IsEmail, IsString, MaxLength, MinLength, Matches } from 'class-validator';

export class CadastroDto {
  @IsString({ message: 'Nome da loja é obrigatório' })
  @MinLength(1, { message: 'Nome da loja é obrigatório' })
  @MaxLength(120, { message: 'Nome da loja deve ter no máximo 120 caracteres' })
  nomeLoja: string;

  @IsString({ message: 'Ramo da loja é obrigatório' })
  @MinLength(1, { message: 'Ramo da loja é obrigatório' })
  @MaxLength(80, { message: 'Ramo da loja deve ter no máximo 80 caracteres' })
  ramoLoja: string;

  @IsEmail({}, { message: 'Email inválido' })
  @MaxLength(180, { message: 'Email deve ter no máximo 180 caracteres' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Deve possuir pelo menos 6 caracteres' })
  @MaxLength(72, { message: 'Senha muito longa' })
  @Matches(/[^A-Za-z0-9]/, {
    message: 'Deve possuir pelo menos um caractere especial',
  })
  senha: string;
}