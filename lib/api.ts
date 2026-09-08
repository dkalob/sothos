const API_URL =
  typeof window === "undefined"
    ? (process.env.NEXT_PUBLIC_API_URL ?? "http://api:3001")
    : "http://localhost:3001";



type ApiError = { message: string | string[]; statusCode: number };

export async function apiGet<T>(caminho: string): Promise<T> {
  const resposta = await fetch(`${API_URL}${caminho}`);

  const dados = await resposta.json();

  if (!resposta.ok) {
    const erro = dados as ApiError;
    const mensagem = Array.isArray(erro.message)
      ? erro.message[0]
      : erro.message;
    throw new Error(mensagem ?? "Erro ao comunicar com o servidor");
  }

  return dados as T;
}

export async function apiPost<T>(caminho: string, corpo: unknown): Promise<T> {
  const resposta = await fetch(`${API_URL}${caminho}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(corpo),
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    const erro = dados as ApiError;
    const mensagem = Array.isArray(erro.message)
      ? erro.message[0]
      : erro.message;
    throw new Error(mensagem ?? "Erro ao comunicar com o servidor");
  }

  return dados as T;
}

export async function apiDelete<T>(caminho: string): Promise<T> {
  const resposta = await fetch(`${API_URL}${caminho}`, {
    method: "DELETE",
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    const erro = dados as ApiError;

    const mensagem = Array.isArray(erro.message)
      ? erro.message[0]
      : erro.message;

    throw new Error(
      mensagem ?? "Erro ao comunicar com o servidor"
    );
  }

  return dados as T;
}

export async function apiPut<T>( caminho: string, corpo: unknown): Promise<T> {
  const resposta = await fetch(`${API_URL}${caminho}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(corpo),
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    const erro = dados as ApiError;

    const mensagem = Array.isArray(erro.message)
      ? erro.message[0]
      : erro.message;

    throw new Error(
      mensagem ?? "Erro ao comunicar com o servidor"
    );
  }

  return dados as T;
}
