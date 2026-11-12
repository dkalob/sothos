import { BadRequestException } from '@nestjs/common';
import { Plataforma, PrismaClient } from '@prisma/client';
import { parse } from 'csv-parse/sync';
import { DefinicaoCampo, Mapeamento, sugerirMapeamento } from './campos';

// Partes comuns a todas as importações: ler o CSV, montar a prévia,
// validar o mapeamento e obter a loja "CSV" da conta.

// Quantas linhas de dados mostrar na prévia
const LINHAS_PREVIA = 5;

export type Separador = ';' | ',' | '\t';
export type LinhaCsv = { numero: number; valores: string[] };
export type CsvLido = { colunas: string[]; linhas: LinhaCsv[]; separador: Separador };

export type Previa<C extends string> = {
  colunas: string[];
  linhas: Record<string, string>[];
  totalLinhas: number;
  separador: Separador;
  campos: { campo: C; rotulo: string; obrigatorio: boolean }[];
  sugestaoMapeamento: Mapeamento<C>;
};

export function lerCsv(arquivo: Buffer): CsvLido {
  // Padroniza as quebras de linha: um arquivo editado em mais de um
  // programa pode misturar \r\n (Windows) e \n, e o leitor se perderia.
  const texto = decodificar(arquivo).replace(/\r\n?/g, '\n');
  const separador = detectarSeparador(texto);

  let registros: { record: string[]; info: { lines: number } }[];
  try {
    registros = parse(texto, {
      delimiter: separador,
      bom: true, // remove o caractere invisível que o Excel coloca no início
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true, // linha com colunas a mais/menos não derruba tudo
      info: true, // devolve o número da linha de cada registro
    }) as unknown as typeof registros; // com info: true o formato muda
  } catch {
    throw new BadRequestException(
      'Não foi possível ler o arquivo. Verifique se é um CSV válido.',
    );
  }

  if (registros.length === 0) {
    throw new BadRequestException('O arquivo está vazio.');
  }

  // A exportação da Nuvemshop termina o cabeçalho com colunas vazias:
  // elas são descartadas, desde que não tenham dados.
  const colunas = removerColunasVaziasNoFim(registros[0].record);
  validarCabecalho(colunas);

  const linhas = registros.slice(1).map(({ record, info }) => ({
    numero: info.lines,
    valores: record,
  }));
  if (linhas.length === 0) {
    throw new BadRequestException(
      'O arquivo só tem o cabeçalho, sem nenhuma linha de dados.',
    );
  }

  return { colunas, linhas, separador };
}

export function montarPrevia<C extends string>(
  { colunas, linhas, separador }: CsvLido,
  definicoes: DefinicaoCampo<C>[],
): Previa<C> {
  return {
    colunas,
    linhas: linhas.slice(0, LINHAS_PREVIA).map(({ valores }) =>
      Object.fromEntries(colunas.map((c, i) => [c, valores[i] ?? ''])),
    ),
    totalLinhas: linhas.length,
    separador,
    campos: definicoes.map(({ campo, rotulo, obrigatorio }) => ({
      campo,
      rotulo,
      obrigatorio,
    })),
    sugestaoMapeamento: sugerirMapeamento(colunas, definicoes),
  };
}

// Mapeamento enviado pelo front: { "email": "E-mail", ... }
export function validarMapeamento<C extends string>(
  json: string,
  colunas: string[],
  definicoes: DefinicaoCampo<C>[],
): Mapeamento<C> {
  let bruto: unknown;
  try {
    bruto = JSON.parse(json);
  } catch {
    throw new BadRequestException('Mapeamento inválido.');
  }
  if (typeof bruto !== 'object' || bruto === null || Array.isArray(bruto)) {
    throw new BadRequestException('Mapeamento inválido.');
  }

  const camposValidos = new Set<string>(definicoes.map((c) => c.campo));
  const mapeamento: Mapeamento<C> = {};

  for (const [campo, coluna] of Object.entries(bruto)) {
    if (!camposValidos.has(campo)) {
      throw new BadRequestException(`Campo desconhecido no mapeamento: ${campo}.`);
    }
    if (coluna === null || coluna === undefined || coluna === '') continue;
    if (typeof coluna !== 'string' || !colunas.includes(coluna)) {
      throw new BadRequestException(
        `A coluna escolhida para "${campo}" não existe no arquivo.`,
      );
    }
    mapeamento[campo as C] = coluna;
  }

  const faltando = definicoes.filter((c) => c.obrigatorio && !mapeamento[c.campo]);
  if (faltando.length > 0) {
    throw new BadRequestException(
      `Escolha uma coluna para: ${faltando.map((c) => c.rotulo).join(', ')}.`,
    );
  }
  return mapeamento;
}

// Loja "CSV" da conta: criada na primeira importação e reaproveitada depois.
// Ligar os registros a ela é o que faz a reimportação atualizar em vez de duplicar.
export async function obterLojaCsv(
  prisma: Pick<PrismaClient, 'lojaConectada'>,
  contaId: string,
) {
  const existente = await prisma.lojaConectada.findFirst({
    where: { contaId, plataforma: Plataforma.CSV },
  });
  if (existente) return existente;

  return prisma.lojaConectada.create({
    data: { contaId, plataforma: Plataforma.CSV, nome: 'Importação por planilha' },
  });
}

// ---------------------------------------------------------------------

// Excel em português costuma salvar em Windows-1252, não UTF-8.
// Se o UTF-8 gerar caracteres inválidos (�), tenta o outro formato.
function decodificar(arquivo: Buffer): string {
  const utf8 = arquivo.toString('utf-8');
  if (!utf8.includes('�')) return utf8;
  return new TextDecoder('windows-1252').decode(arquivo);
}

// Excel BR salva com ";", outros sistemas usam "," e,
// quando copiado de uma planilha, vem separado por TAB.
function detectarSeparador(texto: string): Separador {
  const primeiraLinha = texto.split(/\r?\n/, 1)[0] ?? '';
  const candidatos: Separador[] = [';', ',', '\t'];
  return candidatos.reduce((melhor, atual) =>
    primeiraLinha.split(atual).length > primeiraLinha.split(melhor).length
      ? atual
      : melhor,
  );
}

function removerColunasVaziasNoFim(colunas: string[]): string[] {
  let fim = colunas.length;
  while (fim > 0 && colunas[fim - 1] === '') fim--;
  return colunas.slice(0, fim);
}

function validarCabecalho(colunas: string[]) {
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