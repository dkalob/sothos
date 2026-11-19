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
  | 'cpf'
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
  {
    campo: 'numeroPedido',
    rotulo: 'ID do pedido (e-commerce / ERP)',
    obrigatorio: true,
    aliases: [
      'id no e-commerce / erp',
      'id do pedido',
      'id externo',
      'order id',
      'numero do pedido',
      'pedido',
      'numero',
    ],
  },
  {
    campo: 'email',
    rotulo: 'E-mail do cliente',
    obrigatorio: true,
    aliases: ['e-mail', 'email', 'e-mail do cliente'],
  },
  {
    campo: 'cpf',
    rotulo: 'CPF do cliente',
    obrigatorio: true,
    aliases: ['cpf', 'cpf do cliente', 'documento', 'documento do cliente'],
  },
  {
    campo: 'nome',
    rotulo: 'Nome do cliente',
    obrigatorio: true,
    aliases: ['nome do comprador', 'nome do cliente', 'cliente', 'nome'],
  },
  {
    campo: 'data',
    rotulo: 'Data do pedido',
    obrigatorio: true,
    aliases: ['data', 'data do pedido'],
  },
  {
    campo: 'total',
    rotulo: 'Total do pedido',
    obrigatorio: true,
    aliases: [
      'Total do pedido',
      'total',
      'valor total',
      'valor total do pedido',
    ],
  },
  {
    campo: 'frete',
    rotulo: 'Frete',
    obrigatorio: false,
    aliases: ['valor do frete', 'frete'],
  },
  {
    campo: 'desconto',
    rotulo: 'Desconto',
    obrigatorio: false,
    aliases: ['desconto', 'valor do desconto'],
  },
  {
    campo: 'nomeProduto',
    rotulo: 'Nome do produto',
    obrigatorio: true,
    aliases: ['nome do produto', 'produto', 'produtos'],
  },
  {
    campo: 'valorProduto',
    rotulo: 'Valor unitário do produto',
    obrigatorio: true,
    aliases: [
      'valor do produto',
      'preco unitario',
      'valor unitario',
      'valor unitário',
    ],
  },
  {
    campo: 'quantidade',
    rotulo: 'Quantidade',
    obrigatorio: true,
    aliases: ['quantidade', 'qtd', 'qtde', 'quantity'],
  },
  {
    campo: 'statusPedido',
    rotulo: 'Status do pedido',
    obrigatorio: false,
    aliases: [
      'status pedido',
      'status do pedido',
      'status',
      'situação do pedido',
    ],
  },
];

// ---------------------------------------------------------------------
// PRODUTOS (exportação de catálogo: uma linha por variação)
// ---------------------------------------------------------------------
export type CampoProduto =
  'nome' | 'categoria' | 'preco' | 'imagem' | 'sku' | 'ativo';

export const CAMPOS_PRODUTO: DefinicaoCampo<CampoProduto>[] = [
  {
    campo: 'nome',
    rotulo: 'Nome do produto',
    obrigatorio: true,
    aliases: [
      'nome (portugues)',
      'nombre (portugues)',
      'nome do produto',
      'nome',
      'produto',
    ],
  },
  {
    campo: 'categoria',
    rotulo: 'Categoria',
    obrigatorio: false,
    aliases: ['categorias', 'categoria'],
  },
  {
    campo: 'preco',
    rotulo: 'Preço',
    obrigatorio: false,
    aliases: ['preco', 'precio'],
  },
  {
    campo: 'imagem',
    rotulo: 'Link da imagem (Cloudinary)',
    obrigatorio: false,
    aliases: [
      'link da imagem (cloudinary)',
      'link da imagem',
      'url da imagem',
      'imagem',
      'image url',
    ],
  },
  {
    campo: 'sku',
    rotulo: 'SKU',
    obrigatorio: false,
    aliases: ['sku'],
  },
  {
    campo: 'ativo',
    rotulo: 'Ativo',
    obrigatorio: false,
    aliases: [
      'Ativo / mostra na loja',
      'exibir na loja',
      'mostrar na loja',
      'mostrar en tienda',
      'ativo',
    ],
  },
];

// ---------------------------------------------------------------------
// CLIENTES (exportação de clientes: uma linha por cliente)
// ---------------------------------------------------------------------
export type CampoCliente =
  | 'email'
  | 'nome'
  | 'telefone'
  | 'cidade'
  | 'estado'
  | 'aceitaMarketing'
  | 'dataCadastro';

export const CAMPOS_CLIENTE: DefinicaoCampo<CampoCliente>[] = [
  {
    campo: 'email',
    rotulo: 'E-mail',
    obrigatorio: true,
    aliases: ['e-mail', 'email'],
  },
  {
    campo: 'nome',
    rotulo: 'Nome',
    obrigatorio: true,
    aliases: ['nome', 'nome do cliente', 'nome completo', 'cliente'],
  },
  {
    campo: 'telefone',
    rotulo: 'Telefone',
    obrigatorio: false,
    aliases: ['telefone de contato', 'telefone', 'celular'],
  },
  {
    campo: 'cidade',
    rotulo: 'Cidade',
    obrigatorio: false,
    aliases: ['cidade'],
  },
  {
    campo: 'estado',
    rotulo: 'Estado',
    obrigatorio: false,
    aliases: ['estado', 'uf'],
  },
  {
    campo: 'aceitaMarketing',
    rotulo: 'Aceita receber comunicações',
    obrigatorio: false,
    aliases: [
      'aceita marketing',
      'aceita newsletter',
      'newsletter',
      'aceita receber novidades',
    ],
  },
  {
    campo: 'dataCadastro',
    rotulo: 'Data de cadastro',
    obrigatorio: false,
    aliases: ['data de cadastro', 'data de criacao', 'cadastrado em'],
  },
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
      const coluna = porNome.get(normalizarTexto(alias));
      if (coluna && !usadas.has(coluna)) {
        sugestao[def.campo] = coluna;
        usadas.add(coluna);
        break;
      }
    }
  }
  return sugestao;
}
