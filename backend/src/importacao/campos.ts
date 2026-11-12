// Campos que o Sothos entende numa importação.
// "aliases" são nomes de coluna reconhecidos automaticamente na prévia
// (comparação sem acento, sem maiúscula e sem espaços extras).
// Os aliases incluem os nomes da exportação de pedidos da Nuvemshop.

export type CampoImportacao =
  | 'numeroPedido'
  | 'email'
  | 'nome'
  | 'telefone'
  | 'data'
  | 'statusPedido'
  | 'statusPagamento'
  | 'statusEnvio'
  | 'subtotal'
  | 'desconto'
  | 'frete'
  | 'total'
  | 'cidade'
  | 'estado'
  | 'nomeProduto'
  | 'valorProduto'
  | 'quantidade'
  | 'sku';

export type DefinicaoCampo = {
  campo: CampoImportacao;
  rotulo: string;
  obrigatorio: boolean;
  aliases: string[];
};

export const CAMPOS: DefinicaoCampo[] = [
  { campo: 'numeroPedido', rotulo: 'Número do pedido', obrigatorio: true, aliases: ['numero do pedido', 'pedido', 'numero'] },
  { campo: 'email', rotulo: 'E-mail do cliente', obrigatorio: true, aliases: ['e-mail', 'email'] },
  { campo: 'nome', rotulo: 'Nome do cliente', obrigatorio: true, aliases: ['nome do comprador', 'nome do cliente', 'cliente'] },
  { campo: 'telefone', rotulo: 'Telefone', obrigatorio: false, aliases: ['telefone', 'celular'] },
  { campo: 'data', rotulo: 'Data do pedido', obrigatorio: true, aliases: ['data', 'data do pedido'] },
  { campo: 'statusPedido', rotulo: 'Status do pedido', obrigatorio: false, aliases: ['status do pedido', 'status da venda'] },
  { campo: 'statusPagamento', rotulo: 'Status do pagamento', obrigatorio: false, aliases: ['status do pagamento'] },
  { campo: 'statusEnvio', rotulo: 'Status do envio', obrigatorio: false, aliases: ['status do envio', 'status da entrega'] },
  { campo: 'subtotal', rotulo: 'Subtotal (produtos)', obrigatorio: false, aliases: ['subtotal'] },
  { campo: 'desconto', rotulo: 'Desconto', obrigatorio: false, aliases: ['desconto'] },
  { campo: 'frete', rotulo: 'Frete', obrigatorio: false, aliases: ['valor do frete', 'frete'] },
  { campo: 'total', rotulo: 'Total do pedido', obrigatorio: true, aliases: ['total', 'valor total'] },
  { campo: 'cidade', rotulo: 'Cidade', obrigatorio: false, aliases: ['cidade'] },
  { campo: 'estado', rotulo: 'Estado', obrigatorio: false, aliases: ['estado', 'uf'] },
  { campo: 'nomeProduto', rotulo: 'Nome do produto', obrigatorio: true, aliases: ['nome do produto', 'produto'] },
  { campo: 'valorProduto', rotulo: 'Valor unitário do produto', obrigatorio: true, aliases: ['valor do produto', 'preco unitario', 'valor unitario'] },
  { campo: 'quantidade', rotulo: 'Quantidade', obrigatorio: true, aliases: ['quantidade comprada', 'quantidade'] },
  { campo: 'sku', rotulo: 'SKU', obrigatorio: false, aliases: ['sku'] },
];

export type Mapeamento = Partial<Record<CampoImportacao, string>>;

// "Número do Pedido" -> "numero do pedido"
export function normalizarTexto(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

// Sugere, para cada campo, a coluna da planilha com nome igual a um alias.
export function sugerirMapeamento(colunas: string[]): Mapeamento {
  const porNome = new Map(colunas.map((c) => [normalizarTexto(c), c]));
  const sugestao: Mapeamento = {};
  const usadas = new Set<string>();

  for (const def of CAMPOS) {
    for (const alias of def.aliases) {
      const coluna = porNome.get(alias);
      if (coluna && !usadas.has(coluna)) {
        sugestao[def.campo] = coluna;
        usadas.add(coluna);
        break;
      }
    }
  }
  return sugestao;
}