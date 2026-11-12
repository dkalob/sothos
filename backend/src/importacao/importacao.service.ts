import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import {
  Plataforma,
  Prisma,
  StatusPedido,
  StatusSincronizacao,
  TipoSincronizacao,
} from '@prisma/client';
import { createHash } from 'crypto';
import { parse } from 'csv-parse/sync';
import { PrismaService } from '../prisma/prisma.service';
import { RfmService } from '../rfm/rfm.service';
import {
  CAMPOS,
  CampoImportacao,
  Mapeamento,
  normalizarTexto,
  sugerirMapeamento,
} from './campos';
import {
  converterData,
  converterEmail,
  converterEstado,
  converterQuantidade,
  converterStatus,
  converterTelefone,
  converterValor,
  nomeBaseProduto,
} from './conversores';

// Quantas linhas de dados mostrar na prévia
const LINHAS_PREVIA = 5;
// Limite de erros/avisos devolvidos na resposta (o total sempre é informado)
const MAX_OCORRENCIAS = 200;

type Separador = ';' | ',' | '\t';

type LinhaCsv = { numero: number; valores: string[] };

type CsvLido = {
  colunas: string[];
  linhas: LinhaCsv[];
  separador: Separador;
};

export type PreviaImportacao = {
  colunas: string[];
  linhas: Record<string, string>[];
  totalLinhas: number;
  separador: Separador;
  campos: { campo: CampoImportacao; rotulo: string; obrigatorio: boolean }[];
  sugestaoMapeamento: Mapeamento;
};

// Uma linha da planilha já validada e convertida
type LinhaConvertida = {
  linha: number;
  numeroPedido: string;
  email: string;
  nome: string;
  telefone: string | null;
  cidade: string | null;
  estado: string | null;
  realizadoEm: Date;
  status: StatusPedido;
  statusReconhecido: boolean;
  subtotal: string | null;
  desconto: string | null;
  frete: string | null;
  total: string;
  nomeProduto: string;
  valorProduto: string;
  quantidade: number;
  sku: string | null;
};

type Ocorrencia = { linha?: number; pedido?: string; mensagem: string };

export type ResultadoImportacao = {
  totalLinhas: number;
  pedidosNovos: number;
  pedidosAtualizados: number;
  pedidosIgnorados: number;
  clientesNovos: number;
  clientesAtualizados: number;
  produtosNovos: number;
  totalErros: number;
  totalAvisos: number;
  erros: Ocorrencia[];
  avisos: Ocorrencia[];
};

@Injectable()
export class ImportacaoService {
  private readonly logger = new Logger(ImportacaoService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly rfmService: RfmService,
  ) {}

  // =====================================================================
  // ETAPA 1 — PRÉVIA: lê o CSV e devolve cabeçalho, primeiras linhas e
  // sugestão de mapeamento. NÃO grava nada no banco.
  // =====================================================================
  gerarPrevia(arquivo: Buffer): PreviaImportacao {
    const { colunas, linhas, separador } = this.lerCsv(arquivo);

    return {
      colunas,
      linhas: linhas.slice(0, LINHAS_PREVIA).map(({ valores }) =>
        Object.fromEntries(colunas.map((c, i) => [c, valores[i] ?? ''])),
      ),
      totalLinhas: linhas.length,
      separador,
      campos: CAMPOS.map(({ campo, rotulo, obrigatorio }) => ({
        campo,
        rotulo,
        obrigatorio,
      })),
      sugestaoMapeamento: sugerirMapeamento(colunas),
    };
  }

  // =====================================================================
  // ETAPA 2 — IMPORTAÇÃO: grava clientes, produtos e pedidos.
  // Reimportar o mesmo arquivo ATUALIZA os registros, não duplica.
  // =====================================================================
  async executar(
    contaId: string,
    arquivo: Buffer,
    mapeamentoJson: string,
    aceitaMarketing: boolean,
  ): Promise<ResultadoImportacao> {
    const { colunas, linhas } = this.lerCsv(arquivo);
    const mapeamento = this.validarMapeamento(mapeamentoJson, colunas);

    const erros: Ocorrencia[] = [];
    const avisos: Ocorrencia[] = [];

    // 1. Valida e converte cada linha
    const semStatus =
      !mapeamento.statusPedido &&
      !mapeamento.statusPagamento &&
      !mapeamento.statusEnvio;
    if (semStatus) {
      avisos.push({
        mensagem:
          'Nenhuma coluna de status foi escolhida: todos os pedidos foram considerados pagos.',
      });
    }

    const indice = new Map(colunas.map((c, i) => [c, i]));
    const pedidosComLinhaInvalida = new Set<string>();
    const convertidas: LinhaConvertida[] = [];

    for (const linha of linhas) {
      const ler = (campo: CampoImportacao) => {
        const coluna = mapeamento[campo];
        if (!coluna) return '';
        return (linha.valores[indice.get(coluna)!] ?? '').trim();
      };

      const resultado = this.converterLinha(linha.numero, ler, semStatus);
      if ('erro' in resultado) {
        erros.push({
          linha: linha.numero,
          pedido: ler('numeroPedido') || undefined,
          mensagem: resultado.erro,
        });
        if (ler('numeroPedido')) pedidosComLinhaInvalida.add(ler('numeroPedido'));
        continue;
      }
      for (const aviso of resultado.avisos) {
        avisos.push({ linha: linha.numero, pedido: resultado.linha.numeroPedido, mensagem: aviso });
      }
      convertidas.push(resultado.linha);
    }

    // 2. Agrupa as linhas por pedido (cada linha é um item)
    const pedidos = new Map<string, LinhaConvertida[]>();
    for (const l of convertidas) {
      const grupo = pedidos.get(l.numeroPedido) ?? [];
      grupo.push(l);
      pedidos.set(l.numeroPedido, grupo);
    }

    // Pedido com qualquer linha inválida é ignorado inteiro:
    // importar só parte dos itens deixaria o total errado.
    for (const numero of pedidosComLinhaInvalida) {
      if (pedidos.delete(numero)) {
        erros.push({
          pedido: numero,
          mensagem: `Pedido ${numero} não foi importado porque uma das linhas dele tem erro.`,
        });
      }
    }

    // Todas as linhas de um pedido precisam ser do mesmo cliente
    for (const [numero, itens] of pedidos) {
      if (new Set(itens.map((i) => i.email)).size > 1) {
        pedidos.delete(numero);
        pedidosComLinhaInvalida.add(numero);
        erros.push({
          pedido: numero,
          mensagem: `Pedido ${numero} não foi importado: as linhas dele têm e-mails diferentes.`,
        });
      }
    }

    const resultado: ResultadoImportacao = {
      totalLinhas: linhas.length,
      pedidosNovos: 0,
      pedidosAtualizados: 0,
      pedidosIgnorados: pedidosComLinhaInvalida.size,
      clientesNovos: 0,
      clientesAtualizados: 0,
      produtosNovos: 0,
      totalErros: 0,
      totalAvisos: 0,
      erros: [],
      avisos: [],
    };

    if (pedidos.size === 0) {
      return this.finalizarResultado(resultado, erros, avisos);
    }

    // 3. Loja "CSV" da conta (criada na primeira importação)
    const loja = await this.obterLojaCsv(contaId);
    const sincronizacao = await this.prisma.sincronizacao.create({
      data: { lojaId: loja.id, tipo: TipoSincronizacao.MANUAL },
    });

    try {
      // 4. Clientes
      const clientePorEmail = await this.salvarClientes(
        contaId,
        loja.id,
        pedidos,
        aceitaMarketing,
        resultado,
      );

      // 5. Produtos
      const produtoPorNome = await this.salvarProdutos(
        contaId,
        loja.id,
        convertidas.filter((l) => pedidos.has(l.numeroPedido)),
        resultado,
      );

      // 6. Pedidos (cada um na sua transação: se um falhar, os outros entram)
      for (const [numero, itens] of pedidos) {
        try {
          const novo = await this.salvarPedido(
            contaId,
            loja.id,
            numero,
            itens,
            clientePorEmail.get(itens[0].email)!,
            produtoPorNome,
          );
          if (novo) resultado.pedidosNovos++;
          else resultado.pedidosAtualizados++;
        } catch (erro) {
          this.logger.error(`Falha ao salvar pedido ${numero}`, erro as Error);
          resultado.pedidosIgnorados++;
          erros.push({
            pedido: numero,
            mensagem: `Pedido ${numero} não foi importado por um erro ao gravar no banco.`,
          });
        }
      }

      const processados = resultado.pedidosNovos + resultado.pedidosAtualizados;
      await this.prisma.sincronizacao.update({
        where: { id: sincronizacao.id },
        data: {
          status:
            processados === 0
              ? StatusSincronizacao.FALHA
              : erros.length > 0
                ? StatusSincronizacao.PARCIAL
                : StatusSincronizacao.CONCLUIDA,
          finalizadaEm: new Date(),
          clientesProcessados: resultado.clientesNovos + resultado.clientesAtualizados,
          produtosProcessados: resultado.produtosNovos,
          pedidosProcessados: processados,
          mensagemErro: erros.length > 0 ? `${erros.length} erro(s) na importação` : null,
        },
      });
      await this.prisma.lojaConectada.update({
        where: { id: loja.id },
        data: { ultimaSincronizacaoEm: new Date() },
      });
    } catch (erro) {
      // Falha inesperada (ex.: banco fora do ar): registra e repassa
      await this.prisma.sincronizacao
        .update({
          where: { id: sincronizacao.id },
          data: {
            status: StatusSincronizacao.FALHA,
            finalizadaEm: new Date(),
            mensagemErro: 'Falha inesperada durante a importação',
          },
        })
        .catch(() => undefined);
      throw erro;
    }

    // 7. Recalcula o RFM com os pedidos novos
    try {
      await this.rfmService.recalcular(contaId);
    } catch (erro) {
      this.logger.error('Falha ao recalcular RFM após importação', erro as Error);
      avisos.push({
        mensagem:
          'Os dados foram importados, mas o RFM não foi recalculado. Recalcule manualmente.',
      });
    }

    return this.finalizarResultado(resultado, erros, avisos);
  }

  // ---------------------------------------------------------------------
  // Leitura do CSV
  // ---------------------------------------------------------------------
  private lerCsv(arquivo: Buffer): CsvLido {
    const texto = this.decodificar(arquivo);
    const separador = this.detectarSeparador(texto);

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

    const colunas = registros[0].record;
    this.validarCabecalho(colunas);

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

  // Excel em português costuma salvar em Windows-1252, não UTF-8.
  // Se o UTF-8 gerar caracteres inválidos (�), tenta o outro formato.
  private decodificar(arquivo: Buffer): string {
    const utf8 = arquivo.toString('utf-8');
    if (!utf8.includes('�')) return utf8;
    return new TextDecoder('windows-1252').decode(arquivo);
  }

  // Excel BR salva com ";", outros sistemas usam "," e,
  // quando copiado de uma planilha, vem separado por TAB.
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

  // ---------------------------------------------------------------------
  // Mapeamento enviado pelo front: { "email": "E-mail", ... }
  // ---------------------------------------------------------------------
  private validarMapeamento(json: string, colunas: string[]): Mapeamento {
    let bruto: unknown;
    try {
      bruto = JSON.parse(json);
    } catch {
      throw new BadRequestException('Mapeamento inválido.');
    }
    if (typeof bruto !== 'object' || bruto === null || Array.isArray(bruto)) {
      throw new BadRequestException('Mapeamento inválido.');
    }

    const camposValidos = new Set<string>(CAMPOS.map((c) => c.campo));
    const mapeamento: Mapeamento = {};

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
      mapeamento[campo as CampoImportacao] = coluna;
    }

    const faltando = CAMPOS.filter((c) => c.obrigatorio && !mapeamento[c.campo]);
    if (faltando.length > 0) {
      throw new BadRequestException(
        `Escolha uma coluna para: ${faltando.map((c) => c.rotulo).join(', ')}.`,
      );
    }
    return mapeamento;
  }

  // ---------------------------------------------------------------------
  // Validação e conversão de uma linha
  // ---------------------------------------------------------------------
  private converterLinha(
    numero: number,
    ler: (campo: CampoImportacao) => string,
    semStatus: boolean,
  ): { linha: LinhaConvertida; avisos: string[] } | { erro: string } {
    const problemas: string[] = [];
    const avisos: string[] = [];

    const numeroPedido = ler('numeroPedido');
    if (!numeroPedido) problemas.push('número do pedido vazio');
    else if (numeroPedido.length > 40) problemas.push('número do pedido muito longo');

    const emailTexto = ler('email');
    const email = converterEmail(emailTexto);
    if (!emailTexto) problemas.push('e-mail vazio');
    else if (!email || email.length > 180) problemas.push(`e-mail inválido (${emailTexto})`);

    const nome = ler('nome');
    if (!nome) problemas.push('nome do cliente vazio');

    const dataTexto = ler('data');
    const realizadoEm = converterData(dataTexto);
    if (!dataTexto) problemas.push('data vazia');
    else if (!realizadoEm) problemas.push(`data inválida (${dataTexto}); use dd/mm/aaaa`);

    const totalTexto = ler('total');
    const total = converterValor(totalTexto);
    if (!totalTexto) problemas.push('total vazio');
    else if (total === null || Number(total) < 0) problemas.push(`total inválido (${totalTexto})`);

    const nomeProduto = ler('nomeProduto');
    if (!nomeProduto) problemas.push('nome do produto vazio');

    const valorTexto = ler('valorProduto');
    const valorProduto = converterValor(valorTexto);
    if (!valorTexto) problemas.push('valor do produto vazio');
    else if (valorProduto === null || Number(valorProduto) < 0)
      problemas.push(`valor do produto inválido (${valorTexto})`);

    const qtdTexto = ler('quantidade');
    const quantidade = converterQuantidade(qtdTexto);
    if (!qtdTexto) problemas.push('quantidade vazia');
    else if (quantidade === null) problemas.push(`quantidade inválida (${qtdTexto})`);

    // Campos opcionais: se vierem preenchidos, precisam ser válidos
    const opcionalValor = (campo: CampoImportacao, rotulo: string) => {
      const texto = ler(campo);
      if (!texto) return null;
      const valor = converterValor(texto);
      if (valor === null) problemas.push(`${rotulo} inválido (${texto})`);
      return valor;
    };
    const subtotal = opcionalValor('subtotal', 'subtotal');
    const desconto = opcionalValor('desconto', 'desconto');
    const frete = opcionalValor('frete', 'frete');

    if (problemas.length > 0) {
      return { erro: problemas.join('; ') };
    }

    const estadoTexto = ler('estado');
    const estado = converterEstado(estadoTexto);
    if (estadoTexto && !estado) {
      avisos.push(`estado não reconhecido (${estadoTexto}); ficou em branco`);
    }

    let status: StatusPedido = StatusPedido.PAGO;
    let statusReconhecido = true;
    if (!semStatus) {
      const r = converterStatus(
        ler('statusPedido'),
        ler('statusPagamento'),
        ler('statusEnvio'),
      );
      status = r.status;
      statusReconhecido = r.reconhecido;
      if (!r.reconhecido) {
        avisos.push(
          `status não reconhecido (${[ler('statusPedido'), ler('statusPagamento'), ler('statusEnvio')]
            .filter(Boolean)
            .join(' / ')}); considerado PENDENTE`,
        );
      }
    }

    return {
      linha: {
        linha: numero,
        numeroPedido,
        email: email!,
        nome: nome.slice(0, 160),
        telefone: converterTelefone(ler('telefone')),
        cidade: ler('cidade').slice(0, 120) || null,
        estado,
        realizadoEm: realizadoEm!,
        status,
        statusReconhecido,
        subtotal,
        desconto,
        frete,
        total: total!,
        nomeProduto: nomeProduto.slice(0, 200),
        valorProduto: valorProduto!,
        quantidade: quantidade!,
        sku: ler('sku').slice(0, 80) || null,
      },
      avisos,
    };
  }

  // ---------------------------------------------------------------------
  // Gravação
  // ---------------------------------------------------------------------
  private async obterLojaCsv(contaId: string) {
    const existente = await this.prisma.lojaConectada.findFirst({
      where: { contaId, plataforma: Plataforma.CSV },
    });
    if (existente) return existente;

    return this.prisma.lojaConectada.create({
      data: { contaId, plataforma: Plataforma.CSV, nome: 'Importação por planilha' },
    });
  }

  // Cliente é identificado pelo e-mail dentro da conta.
  // Se já existir (inclusive cadastrado à mão), é atualizado.
  private async salvarClientes(
    contaId: string,
    lojaId: string,
    pedidos: Map<string, LinhaConvertida[]>,
    aceitaMarketing: boolean,
    resultado: ResultadoImportacao,
  ): Promise<Map<string, string>> {
    // Dados mais recentes de cada cliente (pedido com a data mais nova)
    const maisRecente = new Map<string, LinhaConvertida>();
    for (const itens of pedidos.values()) {
      const l = itens[0];
      const atual = maisRecente.get(l.email);
      if (!atual || l.realizadoEm > atual.realizadoEm) maisRecente.set(l.email, l);
    }

    const existentes = await this.prisma.cliente.findMany({
      where: { contaId },
      select: { id: true, email: true },
    });
    const idPorEmail = new Map(existentes.map((c) => [c.email.trim().toLowerCase(), c.id]));

    const resposta = new Map<string, string>();
    for (const [email, l] of maisRecente) {
      const id = idPorEmail.get(email);
      if (id) {
        await this.prisma.cliente.update({
          where: { id },
          data: {
            nome: l.nome,
            // undefined = não altera: uma planilha sem telefone não apaga o que já existe
            telefone: l.telefone ?? undefined,
            cidade: l.cidade ?? undefined,
            estado: l.estado ?? undefined,
            // Nunca retira uma autorização já dada
            aceitaMarketing: aceitaMarketing ? true : undefined,
          },
        });
        resultado.clientesAtualizados++;
        resposta.set(email, id);
      } else {
        const criado = await this.prisma.cliente.create({
          data: {
            contaId,
            lojaId,
            idExterno: email.length <= 80 ? email : this.hash(email),
            nome: l.nome,
            email,
            telefone: l.telefone,
            cidade: l.cidade,
            estado: l.estado,
            aceitaMarketing,
          },
          select: { id: true },
        });
        resultado.clientesNovos++;
        resposta.set(email, criado.id);
      }
    }
    return resposta;
  }

  // Produto é identificado pelo nome sem a variação:
  // "VESTIDO LUCE (Rosa, M)" e "VESTIDO LUCE (Preto, G)" -> "VESTIDO LUCE".
  private async salvarProdutos(
    contaId: string,
    lojaId: string,
    linhas: LinhaConvertida[],
    resultado: ResultadoImportacao,
  ): Promise<Map<string, string>> {
    const existentes = await this.prisma.produto.findMany({
      where: { contaId },
      select: { id: true, nome: true },
    });
    const idPorNome = new Map(existentes.map((p) => [normalizarTexto(p.nome), p.id]));

    // Preço mais recente de cada produto novo
    const novos = new Map<string, { nome: string; preco: string; data: Date }>();
    for (const l of linhas) {
      const base = nomeBaseProduto(l.nomeProduto);
      const chave = normalizarTexto(base);
      if (idPorNome.has(chave)) continue;
      const atual = novos.get(chave);
      if (!atual || l.realizadoEm > atual.data) {
        novos.set(chave, { nome: base, preco: l.valorProduto, data: l.realizadoEm });
      }
    }

    for (const [chave, p] of novos) {
      const produto = await this.prisma.produto.upsert({
        where: { lojaId_idExterno: { lojaId, idExterno: this.hash(chave) } },
        update: {},
        create: {
          contaId,
          lojaId,
          idExterno: this.hash(chave),
          nome: p.nome.slice(0, 200),
          precoAtual: p.preco,
        },
        select: { id: true },
      });
      idPorNome.set(chave, produto.id);
      resultado.produtosNovos++;
    }
    return idPorNome;
  }

  // Devolve true se o pedido foi criado, false se foi atualizado
  private async salvarPedido(
    contaId: string,
    lojaId: string,
    numero: string,
    linhas: LinhaConvertida[],
    clienteId: string,
    produtoPorNome: Map<string, string>,
  ): Promise<boolean> {
    const primeira = linhas[0];

    const itens = linhas.map((l) => ({
      produtoId: produtoPorNome.get(normalizarTexto(nomeBaseProduto(l.nomeProduto))) ?? null,
      nomeProduto: l.nomeProduto, // nome completo, congelado na venda
      sku: l.sku,
      quantidade: l.quantidade,
      precoUnitario: l.valorProduto,
      valorTotal: new Prisma.Decimal(l.valorProduto).mul(l.quantidade).toFixed(2),
    }));

    const somaItens = itens
      .reduce((soma, i) => soma.add(i.valorTotal), new Prisma.Decimal(0))
      .toFixed(2);

    const dados = {
      clienteId,
      numero,
      status: primeira.status,
      valorProdutos: primeira.subtotal ?? somaItens,
      valorFrete: primeira.frete ?? '0',
      valorDesconto: primeira.desconto ?? '0',
      valorTotal: primeira.total,
      realizadoEm: primeira.realizadoEm,
    };

    return this.prisma.$transaction(async (tx) => {
      const existente = await tx.pedido.findUnique({
        where: { lojaId_idExterno: { lojaId, idExterno: numero } },
        select: { id: true },
      });

      if (existente) {
        // Reimportação: substitui os itens pelos da planilha atual
        await tx.itemPedido.deleteMany({ where: { pedidoId: existente.id } });
        await tx.pedido.update({
          where: { id: existente.id },
          data: { ...dados, itens: { create: itens } },
        });
        return false;
      }

      await tx.pedido.create({
        data: { contaId, lojaId, idExterno: numero, ...dados, itens: { create: itens } },
      });
      return true;
    });
  }

  private hash(texto: string): string {
    return createHash('sha1').update(texto).digest('hex'); // 40 caracteres
  }

  private finalizarResultado(
    resultado: ResultadoImportacao,
    erros: Ocorrencia[],
    avisos: Ocorrencia[],
  ): ResultadoImportacao {
    resultado.totalErros = erros.length;
    resultado.totalAvisos = avisos.length;
    resultado.erros = erros.slice(0, MAX_OCORRENCIAS);
    resultado.avisos = avisos.slice(0, MAX_OCORRENCIAS);
    return resultado;
  }
}