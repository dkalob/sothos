
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExportacaoService {
  constructor(private readonly prisma: PrismaService) {}

  // Converte os valores para células CSV seguras
  private celula(valor: unknown): string {
    if (valor === null || valor === undefined) return '';

    let texto = String(valor);

    // Evita que o Excel execute fórmulas vindas de dados cadastrados.
    if (/^[\s]*[=+\-@\t\r]/.test(texto)) {
      texto = `'${texto}`;
    }

    return `"${texto.replace(/"/g, '""')}"`;
  }

  private csv(cabecalho: string[], linhas: unknown[][]): string {
    const conteudo = [
      cabecalho.map((c) => this.celula(c)).join(';'),
      ...linhas.map((linha) =>
        linha.map((valor) => this.celula(valor)).join(';'),
      ),
    ].join('\r\n');

    // BOM para reconhecimento de UTF-8 pelo Excel.
    return '\uFEFF' + conteudo;
  }

  private data(valor: Date | null): string {
    if (!valor) return '';

    const dia = String(valor.getUTCDate()).padStart(2, '0');
    const mes = String(valor.getUTCMonth() + 1).padStart(2, '0');
    const ano = valor.getUTCFullYear();
    const hora = String(valor.getUTCHours()).padStart(2, '0');
    const minuto = String(valor.getUTCMinutes()).padStart(2, '0');
    const segundo = String(valor.getUTCSeconds()).padStart(2, '0');

    return `${dia}/${mes}/${ano} ${hora}:${minuto}:${segundo}`;
  }

  private valor(valor: { toString(): string } | null): string {
    if (valor === null) return '';
    return Number(valor.toString()).toFixed(2).replace('.', ',');
  }

  // =========================================================
  // CLIENTES
  // =========================================================

  async exportarClientes(contaId: string): Promise<string> {
    const clientes = await this.prisma.cliente.findMany({
      where: { contaId },
      orderBy: { nome: 'asc' },
      select: {
        nome: true,
        email: true,
        telefone: true,
        cpf: true,
        cidade: true,
        estado: true,
        aceitaMarketing: true,
        criadoEmOrigem: true,
        criadoEm: true,
      },
    });

    return this.csv(
      [
        'Nome',
        'E-mail',
        'Telefone',
        'CPF',
        'Cidade',
        'Estado',
        'Aceita Marketing',
        'Data de Cadastro na Origem',
        'Data de Cadastro',
      ],
      clientes.map((c) => [
        c.nome,
        c.email,
        c.telefone,
        c.cpf,
        c.cidade,
        c.estado,
        c.aceitaMarketing ? 'Sim' : 'Não',
        this.data(c.criadoEmOrigem),
        this.data(c.criadoEm),
      ]),
    );
  }

  // =========================================================
  // PRODUTOS
  // =========================================================

  async exportarProdutos(contaId: string): Promise<string> {
    const produtos = await this.prisma.produto.findMany({
      where: { contaId },
      orderBy: { nome: 'asc' },
      select: {
        nome: true,
        sku: true,
        precoAtual: true,
        ativo: true,
        imagem: true,
        criadoEmOrigem: true,
        criadoEm: true,
        categoria: {
          select: {
            nome: true,
          },
        },
      },
    });

    return this.csv(
      [
        'Nome',
        'SKU',
        'Categoria',
        'Preço',
        'Ativo',
        'Imagem',
        'Data de Cadastro na Origem',
        'Data de Cadastro',
      ],
      produtos.map((p) => [
        p.nome,
        p.sku,
        p.categoria?.nome,
        this.valor(p.precoAtual),
        p.ativo ? 'Sim' : 'Não',
        p.imagem,
        this.data(p.criadoEmOrigem),
        this.data(p.criadoEm),
      ]),
    );
  }

  // =========================================================
  // PEDIDOS
  // Cada item representa uma linha da planilha.
  // =========================================================

  async exportarPedidos(contaId: string): Promise<string> {
    const pedidos = await this.prisma.pedido.findMany({
      where: { contaId },
      orderBy: { realizadoEm: 'desc' },
      select: {
        numero: true,
        status: true,
        valorProdutos: true,
        valorFrete: true,
        valorDesconto: true,
        valorTotal: true,
        moeda: true,
        realizadoEm: true,
        cliente: {
          select: {
            nome: true,
            email: true,
            telefone: true,
          },
        },
        itens: {
          select: {
            nomeProduto: true,
            sku: true,
            quantidade: true,
            precoUnitario: true,
            valorTotal: true,
          },
        },
      },
    });

    const linhas: unknown[][] = [];

    for (const pedido of pedidos) {
      // Pedido sem itens: mantém os dados gerais na exportação.
      if (pedido.itens.length === 0) {
        linhas.push([
          pedido.numero,
          pedido.cliente?.email,
          pedido.cliente?.nome,
          pedido.cliente?.telefone,
          this.data(pedido.realizadoEm),
          pedido.status,
          this.valor(pedido.valorProdutos),
          this.valor(pedido.valorFrete),
          this.valor(pedido.valorDesconto),
          this.valor(pedido.valorTotal),
          pedido.moeda,
          '',
          '',
          '',
          '',
        ]);

        continue;
      }

      for (const item of pedido.itens) {
        linhas.push([
          pedido.numero,
          pedido.cliente?.email,
          pedido.cliente?.nome,
          pedido.cliente?.telefone,
          this.data(pedido.realizadoEm),
          pedido.status,
          this.valor(pedido.valorProdutos),
          this.valor(pedido.valorFrete),
          this.valor(pedido.valorDesconto),
          this.valor(pedido.valorTotal),
          pedido.moeda,
          item.nomeProduto,
          item.sku,
          item.quantidade,
          this.valor(item.precoUnitario),
        ]);
      }
    }

    return this.csv(
      [
        'Número do Pedido',
        'E-mail',
        'Nome do Cliente',
        'Telefone',
        'Data',
        'Status Pedido',
        'Subtotal',
        'Frete',
        'Desconto',
        'Total',
        'Moeda',
        'Produto',
        'SKU',
        'Quantidade',
        'Valor do Produto',
      ],
      linhas,
    );
  }
}
