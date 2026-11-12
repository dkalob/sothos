import { BadRequestException, Injectable } from '@nestjs/common';
import { parse } from 'csv-parse/sync';

// Quantas linhas de dados mostrar na prévia
const LINHAS_PREVIA = 5;

type Separador = ';' | ',' | '\t';

export type PreviaImportacao = {
  colunas: string[];
  linhas: Record<string, string>[];
  totalLinhas: number;
  separador: Separador;
};

@Injectable()
export class ImportacaoService {
  // Lê o CSV e devolve cabeçalho + primeiras linhas.
  // NÃO grava nada no banco.
  gerarPrevia(arquivo: Buffer): PreviaImportacao {
    const texto = this.decodificar(arquivo);
    const separador = this.detectarSeparador(texto);

    let registros: string[][];
    try {
      registros = parse(texto, {
        delimiter: separador,
        bom: true, // remove o caractere invisível que o Excel coloca no início
        skip_empty_lines: true,
        trim: true,
        relax_column_count: true, // linha com colunas a mais/menos não derruba tudo
      });
    } catch {
      throw new BadRequestException(
        'Não foi possível ler o arquivo. Verifique se é um CSV válido.',
      );
    }

    if (registros.length === 0) {
      throw new BadRequestException('O arquivo está vazio.');
    }

    const colunas = registros[0];
    this.validarCabecalho(colunas);

    const dados = registros.slice(1);
    if (dados.length === 0) {
      throw new BadRequestException(
        'O arquivo só tem o cabeçalho, sem nenhuma linha de dados.',
      );
    }

    // Transforma cada linha em { nomeDaColuna: valor }
    const linhas = dados.slice(0, LINHAS_PREVIA).map((linha) =>
      Object.fromEntries(colunas.map((coluna, i) => [coluna, linha[i] ?? ''])),
    );

    return { colunas, linhas, totalLinhas: dados.length, separador };
  }

  // Excel em português costuma salvar em Windows-1252, não UTF-8.
  // Se o UTF-8 gerar caracteres inválidos (�), tenta o outro formato.
  private decodificar(arquivo: Buffer): string {
    const utf8 = arquivo.toString('utf-8');
    if (!utf8.includes('�')) return utf8;
    return new TextDecoder('windows-1252').decode(arquivo);
  }

  // Excel BR salva com ";", outros sistemas usam "," e,
  // quando copiado de uma planilha, vem separado por TAB.
  // Olha a primeira linha e escolhe o que aparece mais.
  private detectarSeparador(texto: string): Separador {
    const primeiraLinha = texto.split(/\r?\n/, 1)[0] ?? '';
    const candidatos: Separador[] = [';', ',', '\t'];
    return candidatos.reduce((melhor, atual) =>
      primeiraLinha.split(atual).length > primeiraLinha.split(melhor).length
        ? atual
        : melhor,
    );
  }

  private validarCabecalho(colunas: string[]) {
    if (colunas.some((c) => c === '')) {
      throw new BadRequestException(
        'Existe uma coluna sem nome no cabeçalho do arquivo.',
      );
    }

    const repetidas = colunas.filter((c, i) => colunas.indexOf(c) !== i);
    if (repetidas.length > 0) {
      throw new BadRequestException(
        `Colunas com nome repetido: ${[...new Set(repetidas)].join(', ')}.`,
      );
    }
  }
}