import { IsEmail, MaxLength } from 'class-validator';

export class SolicitarRecuperacaoDto {
  @IsEmail({}, { message: 'Email inválido' })
  @MaxLength(180)
  email: string;
}