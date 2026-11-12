import { Injectable, Logger } from '@nestjs/common';
import { StatusSincronizacao, TipoSincronizacao } from '@prisma/client';
import { createHash } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CAMPOS_CLIENTE, CampoCliente } from './campos';
import {
  converterBooleano,
  converterData,
  converterEmail,
  converterEstado,
  converterTelefone,
} from './conversores';
import {
  LinhaCsv,
  lerCsv,
  montarPrevia,
  obterLojaCsv,
  Previa,
  validarMapeamento,
} from './leitor-csv';

// Limite de erros/avisos devolvidos na resposta (o total sempre é informado)
const MAX_OCORRENCIAS = 200;

type Ocorrencia = { linha?: number; email?: string; mensagem: string };

type ClienteConvertido = {
  linha: number;
  email: string;
  nome: string;
  telefone: string | null;
  cidade: string | null;
  estado: string | null;
  aceitaMarketing: boolean | null; // null = a planilha não informou
  criadoEmOrigem: Date | null;
};

export type ResultadoImportacaoClientes = {
  totalLinhas: number;
  clientesNovos: number;
  clientesAtualizados: number;
  clientesIgnorados: number;
  totalErros: number;
  totalAvisos: number;
  erros: Ocorrencia[];
  avisos: Ocorrencia[];
};

@Injectable()
export class ImportacaoClientesService {
  private readonly logger = new Logger(ImportacaoClientesService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Prévia: não grava nada
  gerarPrevia(arquivo: Buffer): Previa<CampoCliente> {
    return montarPrevia(lerCsv(arquivo), CAMPOS_CLIENTE);
  }

  // Importa clientes. O cliente é identificado pelo e-mail dentro da conta:
  // se já existir (inclusive cadastrado à mão ou vindo de pedidos), é atualizado.
  //
  // Autorização de marketing (LGPD):
  // - se a planilha tem a coluna de aceite, vale a resposta de cada cliente,
  //   inclusive "não" (quem recusou deixa de receber campanhas);
  // - se não tem, vale o checkbox da tela, que só concede: desmarcado,
  //   nunca retira uma autorização que já existia.
  async executar(
    contaId: string,
    arquivo: Buffer,
    mapeamentoJson: string,
    aceitaMarketingGeral: boolean,
  ): Promise<ResultadoImportacaoClientes> {
    const { colunas, linhas } = lerCsv(arquivo);
    const mapeamento = validarMapeamento(mapeamentoJson, colunas, CAMPOS_CLIENTE);
    const indice = new Map(colunas.map((c, i) => [c, i]));

    const ler = (linha: LinhaCsv, campo: CampoCliente) => {
      const coluna = mapeamento[campo];
      if (!coluna) return '';
      return (linha.valores[indice.get(coluna)!] ?? '').trim();
    };

    const erros: Ocorrencia[] = [];
    const avisos: Ocorrencia[] = [];
    const porEmail = new Map<string, ClienteConvertido>();
    let invalidas = 0;

    // 1. Valida e converte cada linha
    for (const linha of linhas) {
      const problemas: string[] = [];

      const emailTexto = ler(linha, 'email');
      const email = converterEmail(emailTexto);
      if (!emailTexto) problemas.push('e-mail vazio');
      else if (!email || email.length > 180) problemas.push(`e-mail inválido (${emailTexto})`);

      const nome = ler(linha, 'nome');
      if (!nome) problemas.push('nome vazio');

      if (problemas.length > 0) {
        invalidas++;
        erros.push({ linha: linha.numero, email: emailTexto || undefined, mensagem: problemas.join('; ') });
        continue;
      }

      // Opcionais: problema vira aviso, o cliente entra mesmo assim
      const estadoTexto = ler(linha, 'estado');
      const estado = converterEstado(estadoTexto);
      if (estadoTexto && !estado) {
        avisos.push({ linha: linha.numero, email: email!, mensagem: `estado não reconhecido (${estadoTexto}); ficou em branco` });
      }

      const aceiteTexto = ler(linha, 'aceitaMarketing');
      const aceite = aceiteTexto ? converterBooleano(aceiteTexto) : null;
      if (aceiteTexto && aceite === null) {
        avisos.push({ linha: linha.numero, email: email!, mensagem: `aceite de comunicação não reconhecido (${aceiteTexto}); considerado "não informado"` });
      }

      const dataTexto = ler(linha, 'dataCadastro');
      const criadoEmOrigem = dataTexto ? converterData(dataTexto) : null;
      if (dataTexto && !criadoEmOrigem) {
        avisos.push({ linha: linha.numero, email: email!, mensagem: `data de cadastro inválida (${dataTexto}); ignorada` });
      }

      // E-mail repetido no arquivo: vale a última linha
      if (porEmail.has(email!)) {
        avisos.push({ linha: linha.numero, email: email!, mensagem: 'e-mail repetido no arquivo; vale esta linha (a última)' });
      }
      porEmail.set(email!, {
        linha: linha.numero,
        email: email!,
        nome: nome.slice(0, 160),
        telefone: converterTelefone(ler(linha, 'telefone')),
        cidade: ler(linha, 'cidade').slice(0, 120) || null,
        estado,
        aceitaMarketing: aceite,
        criadoEmOrigem,
      });
    }

    const resultado: ResultadoImportacaoClientes = {
      totalLinhas: linhas.length,
      clientesNovos: 0,
      clientesAtualizados: 0,
      clientesIgnorados: invalidas,
      totalErros: 0,
      totalAvisos: 0,
      erros: [],
      avisos: [],
    };

    if (porEmail.size === 0) {
      return this.finalizar(resultado, erros, avisos);
    }

    // 2. Grava
    const loja = await obterLojaCsv(this.prisma, contaId);
    const sincronizacao = await this.prisma.sincronizacao.create({
      data: { lojaId: loja.id, tipo: TipoSincronizacao.MANUAL },
    });

    try {
      const existentes = await this.prisma.cliente.findMany({
        where: { contaId },
        select: { id: true, email: true },
      });
      const idPorEmail = new Map(existentes.map((c) => [c.email.trim().toLowerCase(), c.id]));

      for (const c of porEmail.values()) {
        // Coluna de aceite preenchida: vale a resposta do cliente (sim ou não).
        // Sem coluna: o checkbox só concede.
        const aceitaMarketing =
          c.aceitaMarketing !== null
            ? c.aceitaMarketing
            : aceitaMarketingGeral
              ? true
              : undefined;

        try {
          const id = idPorEmail.get(c.email);
          if (id) {
            await this.prisma.cliente.update({
              where: { id },
              data: {
                nome: c.nome,
                // undefined = não altera o que já está cadastrado
                telefone: c.telefone ?? undefined,
                cidade: c.cidade ?? undefined,
                estado: c.estado ?? undefined,
                aceitaMarketing,
                criadoEmOrigem: c.criadoEmOrigem ?? undefined,
              },
            });
            resultado.clientesAtualizados++;
          } else {
            const criado = await this.prisma.cliente.create({
              data: {
                contaId,
                lojaId: loja.id,
                idExterno: c.email.length <= 80 ? c.email : createHash('sha1').update(c.email).digest('hex'),
                nome: c.nome,
                email: c.email,
                telefone: c.telefone,
                cidade: c.cidade,
                estado: c.estado,
                aceitaMarketing: aceitaMarketing ?? false,
                criadoEmOrigem: c.criadoEmOrigem,
              },
              select: { id: true },
            });
            idPorEmail.set(c.email, criado.id);
            resultado.clientesNovos++;
          }
        } catch (erro) {
          this.logger.error(`Falha ao salvar cliente da linha ${c.linha}`, erro as Error);
          resultado.clientesIgnorados++;
          erros.push({ linha: c.linha, email: c.email, mensagem: 'não foi importado por um erro ao gravar no banco' });
        }
      }

      const processados = resultado.clientesNovos + resultado.clientesAtualizados;
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
          clientesProcessados: processados,
          mensagemErro: erros.length > 0 ? `${erros.length} erro(s) na importação` : null,
        },
      });
      await this.prisma.lojaConectada.update({
        where: { id: loja.id },
        data: { ultimaSincronizacaoEm: new Date() },
      });
    } catch (erro) {
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

    return this.finalizar(resultado, erros, avisos);
  }

  private finalizar(
    resultado: ResultadoImportacaoClientes,
    erros: Ocorrencia[],
    avisos: Ocorrencia[],
  ): ResultadoImportacaoClientes {
    resultado.totalErros = erros.length;
    resultado.totalAvisos = avisos.length;
    resultado.erros = erros.slice(0, MAX_OCORRENCIAS);
    resultado.avisos = avisos.slice(0, MAX_OCORRENCIAS);
    return resultado;
  }
}