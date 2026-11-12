import { StatusPedido } from '@prisma/client';
import { normalizarTexto } from './campos';

// Funções puras de conversão: recebem texto da planilha e devolvem
// o valor pronto para o banco, ou null quando o texto é inválido.

// ---------- VALORES EM DINHEIRO ----------
// Aceita "829.8", "829,80", "1.234,56", "1,234.56", "R$ 10,50".
// Devolve string decimal ("1234.56") para o Prisma converter em Decimal
// sem passar por float.
export function converterValor(texto: string): string | null {
  let t = texto.replace(/R\$/i, '').replace(/\s/g, '');
  if (t === '') return null;

  const ultimaVirgula = t.lastIndexOf(',');
  const ultimoPonto = t.lastIndexOf('.');

  if (ultimaVirgula > -1 && ultimoPonto > -1) {
    // Os dois aparecem: o último é o separador decimal
    if (ultimaVirgula > ultimoPonto) {
      t = t.replace(/\./g, '').replace(',', '.'); // 1.234,56
    } else {
      t = t.replace(/,/g, ''); // 1,234.56
    }
  } else if (ultimaVirgula > -1) {
    t = t.replace(',', '.'); // 10,50
  }
  // Só ponto: já está no formato certo (829.8)

  if (!/^-?\d+(\.\d+)?$/.test(t)) return null;
  return t;
}

// ---------- QUANTIDADE ----------
export function converterQuantidade(texto: string): number | null {
  const t = texto.trim();
  if (!/^\d+$/.test(t)) return null;
  const n = Number(t);
  return n > 0 ? n : null;
}

// ---------- DATA ----------
// Aceita "11/11/2026 20:05:47", "11/11/2026 20:05", "11/11/2026"
// e "2026-11-11" / "2026-11-11 20:05:47".
// A planilha não informa fuso: considera horário de Brasília (-03:00,
// sem horário de verão desde 2019).
export function converterData(texto: string): Date | null {
  const t = texto.trim();

  const br = t.match(
    /^(\d{2})\/(\d{2})\/(\d{4})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/,
  );
  const iso = t.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/,
  );

  let ano: string, mes: string, dia: string;
  let hora = '00', minuto = '00', segundo = '00';

  if (br) {
    [, dia, mes, ano] = br;
    hora = br[4] ?? hora;
    minuto = br[5] ?? minuto;
    segundo = br[6] ?? segundo;
  } else if (iso) {
    [, ano, mes, dia] = iso;
    hora = iso[4] ?? hora;
    minuto = iso[5] ?? minuto;
    segundo = iso[6] ?? segundo;
  } else {
    return null;
  }

  const data = new Date(
    `${ano}-${mes}-${dia}T${hora}:${minuto}:${segundo}-03:00`,
  );
  if (Number.isNaN(data.getTime())) return null;

  // Rejeita datas que o JS "corrige" sozinho, como 31/02 virando 03/03
  const conferencia = new Date(data.getTime() - 3 * 60 * 60 * 1000);
  if (
    conferencia.getUTCDate() !== Number(dia) ||
    conferencia.getUTCMonth() + 1 !== Number(mes)
  ) {
    return null;
  }
  return data;
}

// ---------- ESTADO ----------
const ESTADOS: Record<string, string> = {
  acre: 'AC', alagoas: 'AL', amapa: 'AP', amazonas: 'AM', bahia: 'BA',
  ceara: 'CE', 'distrito federal': 'DF', 'espirito santo': 'ES',
  goias: 'GO', maranhao: 'MA', 'mato grosso': 'MT',
  'mato grosso do sul': 'MS', 'minas gerais': 'MG', para: 'PA',
  paraiba: 'PB', parana: 'PR', pernambuco: 'PE', piaui: 'PI',
  'rio de janeiro': 'RJ', 'rio grande do norte': 'RN',
  'rio grande do sul': 'RS', rondonia: 'RO', roraima: 'RR',
  'santa catarina': 'SC', 'sao paulo': 'SP', sergipe: 'SE',
  tocantins: 'TO',
};
const SIGLAS = new Set(Object.values(ESTADOS));

// "Santa Catarina" -> "SC"; "sc" -> "SC"; desconhecido -> null
export function converterEstado(texto: string): string | null {
  const t = normalizarTexto(texto);
  if (t === '') return null;
  if (SIGLAS.has(t.toUpperCase())) return t.toUpperCase();
  return ESTADOS[t] ?? null;
}

// ---------- TELEFONE ----------
// Mantém só dígitos e o "+" inicial. Vazio -> null.
export function converterTelefone(texto: string): string | null {
  const t = texto.trim();
  const mais = t.startsWith('+') ? '+' : '';
  const digitos = t.replace(/\D/g, '');
  if (digitos === '') return null;
  return (mais + digitos).slice(0, 30);
}

// ---------- E-MAIL ----------
export function converterEmail(texto: string): string | null {
  const t = texto.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t) ? t : null;
}

// ---------- PRODUTO ----------
// "VESTIDO LUCE (Rosa, M)" -> "VESTIDO LUCE"
// Variações (cor/tamanho) viram o mesmo produto; o nome completo
// continua guardado no item do pedido.
export function nomeBaseProduto(nome: string): string {
  const base = nome.replace(/\s*\([^()]*\)\s*$/, '').trim();
  return base === '' ? nome.trim() : base;
}

// ---------- STATUS ----------
// Regras por palavra-chave, aplicadas nesta ordem.
// "reconhecido = false" quando nenhuma regra serviu: o pedido entra
// como PENDENTE (não conta no RFM) e o resumo avisa.
export function converterStatus(
  pedido: string,
  pagamento: string,
  envio: string,
): { status: StatusPedido; reconhecido: boolean } {
  const pe = normalizarTexto(pedido);
  const pg = normalizarTexto(pagamento);
  const en = normalizarTexto(envio);
  const tem = (texto: string, ...palavras: string[]) =>
    palavras.some((p) => texto.includes(p));

  if (tem(pe, 'cancel')) return { status: StatusPedido.CANCELADO, reconhecido: true };
  if (tem(pg, 'vencid', 'recusad')) return { status: StatusPedido.CANCELADO, reconhecido: true };
  if (tem(pg, 'estorn')) return { status: StatusPedido.DEVOLVIDO, reconhecido: true };
  if (tem(pg, 'pendente', 'analise', 'contestad')) return { status: StatusPedido.PENDENTE, reconhecido: true };

  if (tem(pg, 'recebid', 'confirmad', 'pago')) {
    if (tem(en, 'entregue', 'retirad')) return { status: StatusPedido.ENTREGUE, reconhecido: true };
    if (tem(en, 'enviad')) return { status: StatusPedido.ENVIADO, reconhecido: true };
    return { status: StatusPedido.PAGO, reconhecido: true };
  }

  return { status: StatusPedido.PENDENTE, reconhecido: false };
}