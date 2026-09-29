import { IsArray, IsString, IsUUID, Length, } from 'class-validator';

export class GrupoClientesDto {
  @IsString()
  @Length(3, 100, { message: 'Nome deve ter pelo menos 3 letras' })
  nome: string;

  @IsArray()
  @IsUUID('4', { each: true })
  clientesIds: string[];
}