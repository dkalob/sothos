import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';

export type ResultadoTexto = {
  texto: string;
  modelo: string;
  tokensEntrada: number | null;
  tokensSaida: number | null;
  duracaoMs: number;
};

// Erros que costumam passar sozinhos: vale tentar de novo.
const TRANSITORIOS = [0, 429, 500, 503, 504];

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);

  async gerarTexto(prompt: string): Promise<ResultadoTexto> {
    const chave = process.env.GEMINI_API_KEY;
    const principal = process.env.GEMINI_MODEL ?? 'gemini-3.8-flash';
    const reserva = process.env.GEMINI_MODEL_RESERVA;

    if (!chave) {
      throw new ServiceUnavailableException('IA não configurada');
    }

    // 2 tentativas no modelo principal e, se houver, 1 no reserva
    const modelos = [principal, principal, ...(reserva ? [reserva] : [])];
    const inicio = Date.now();

    for (let i = 0; i < modelos.length; i++) {
      const { ok, status, dados } = await this.chamar(modelos[i], prompt, chave);

      if (ok) {
        const partes: { text?: string }[] =
          dados?.candidates?.[0]?.content?.parts ?? [];

        const texto = partes
          .map((p) => p.text ?? '')
          .join('')
          .trim();

        if (!texto) {
          throw new ServiceUnavailableException('A IA não retornou nenhum texto');
        }

        return {
          texto,
          modelo: modelos[i],
          tokensEntrada: dados?.usageMetadata?.promptTokenCount ?? null,
          tokensSaida: dados?.usageMetadata?.candidatesTokenCount ?? null,
          duracaoMs: Date.now() - inicio,
        };
      }

      this.logger.error(
        `Gemini (${modelos[i]}) respondeu ${status}: ${JSON.stringify(dados)}`,
      );

      const ultima = i === modelos.length - 1;

      if (!TRANSITORIOS.includes(status) || ultima) {
        throw new ServiceUnavailableException(
          status === 429 || status === 503
            ? 'A IA está sobrecarregada no momento. Tente novamente em instantes.'
            : 'Não foi possível gerar o texto com a IA',
        );
      }

      await esperar(1500 * (i + 1));
    }

    throw new ServiceUnavailableException('Não foi possível gerar o texto com a IA');
  }

  private async chamar(modelo: string, prompt: string, chave: string) {
    try {
      const resposta = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': chave,
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { thinkingConfig: { thinkingLevel: 'low' } },
          }),
          signal: AbortSignal.timeout(60_000),
        },
      );

      const dados = await resposta.json().catch(() => null);
      return { ok: resposta.ok, status: resposta.status, dados };
    } catch (erro) {
      // falha de rede ou timeout: status 0, tratado como transitório
      return { ok: false, status: 0, dados: String(erro) };
    }
  }
}