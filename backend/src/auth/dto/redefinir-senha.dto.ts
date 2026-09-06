import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class RedefinirSenhaDto {
  @IsString({ message: 'Token é obrigatório' })
  @MinLength(1, { message: 'Token é obrigatório' })
  token: string;

  @IsString()
  @MinLength(6, { message: 'Deve possuir pelo menos 6 caracteres' })
  @MaxLength(72, { message: 'Senha muito longa' })
  @Matches(/[^A-Za-z0-9]/, {
    message: 'Deve possuir pelo menos um caractere especial',
  })
  senha: string;
}