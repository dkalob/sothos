// Campos que o Sothos entende em cada tipo de importação.
// "aliases" são nomes de coluna reconhecidos automaticamente na prévia
// (comparação sem acento, sem maiúscula e sem espaços extras).
// Incluem os nomes das exportações da Nuvemshop em português e espanhol.

export type DefinicaoCampo<C extends string = string> = {
  campo: C;
  rotulo: string;
  obrigatorio: boolean;
  aliases: string[];
};

export type Mapeamento<C extends string = string> = Partial<Record<C, string>>;

// ---------------------------------------------------------------------
// PEDIDOS (exportação de vendas: uma linha por item do pedido)
// ---------------------------------------------------------------------
export type CampoPedido =
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

// Mantido com o nome antigo para não quebrar quem já importa
export type CampoImportacao = CampoPedido;

export const CAMPOS: DefinicaoCampo<CampoPedido>[] = [
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

// ---------------------------------------------------------------------
// PRODUTOS (exportação de catálogo: uma linha por variação)
// ---------------------------------------------------------------------
export type CampoProduto =
  | 'identificador'
  | 'nome'
  | 'categoria'
  | 'preco'
  | 'precoPromocional'
  | 'sku'
  | 'ativo';

export const CAMPOS_PRODUTO: DefinicaoCampo<CampoProduto>[] = [
  { campo: 'identificador', rotulo: 'Identificador do produto (agrupa as variações)', obrigatorio: false, aliases: ['identificador url', 'identificador de url', 'identificador', 'id do produto'] },
  { campo: 'nome', rotulo: 'Nome do produto', obrigatorio: true, aliases: ['nome (portugues)', 'nombre (portugues)', 'nome do produto', 'nome', 'produto'] },
  { campo: 'categoria', rotulo: 'Categoria', obrigatorio: false, aliases: ['categorias', 'categoria'] },
  { campo: 'preco', rotulo: 'Preço', obrigatorio: true, aliases: ['preco', 'precio'] },
  { campo: 'precoPromocional', rotulo: 'Preço promocional', obrigatorio: false, aliases: ['preco promocional', 'precio promocional'] },
  { campo: 'sku', rotulo: 'SKU', obrigatorio: false, aliases: ['sku'] },
  { campo: 'ativo', rotulo: 'Ativo / mostrar na loja', obrigatorio: false, aliases: ['exibir na loja', 'mostrar na loja', 'mostrar en tienda', 'ativo'] },
];

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
export function sugerirMapeamento<C extends string>(
  colunas: string[],
  definicoes: DefinicaoCampo<C>[] = CAMPOS as unknown as DefinicaoCampo<C>[],
): Mapeamento<C> {
  const porNome = new Map(colunas.map((c) => [normalizarTexto(c), c]));
  const sugestao: Mapeamento<C> = {};
  const usadas = new Set<string>();

  for (const def of definicoes) {
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