import { IsIn, IsOptional, IsString } from 'class-validator';

// Campos de texto que chegam junto com o arquivo (multipart/form-data).
// Em form-data tudo chega como texto, por isso o mapeamento vem como JSON
// e o aceitaMarketing como "true"/"false".
export class ExecutarImportacaoDto {
  @IsString()
  mapeamento: string;

  @IsOptional()
  @IsIn(['true', 'false'])
  aceitaMarketing?: string;
}