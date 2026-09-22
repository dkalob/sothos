const API_URL =
  typeof window === "undefined"
    ? (process.env.NEXT_PUBLIC_API_URL ?? "http://api:3001")
    : "http://localhost:3001";

type ApiError = { message: string | string[]; statusCode: number };

function montarHeaders(token?: string, comJson = false): HeadersInit {
  const headers: HeadersInit = {};
  if (comJson) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export async function apiGet<T>(caminho: string, token?: string): Promise<T> {
  const resposta = await fetch(`${API_URL}${caminho}`,{
    headers: montarHeaders(token)
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

export async function apiPost<T>(caminho: string, corpo: unknown, token?: string): Promise<T> {
  const resposta = await fetch(`${API_URL}${caminho}`, {
    method: "POST",
    headers: montarHeaders(token, true),
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

export async function apiDelete<T>(caminho: string, token?: string): Promise<T> {
  const resposta = await fetch(`${API_URL}${caminho}`, {
    method: "DELETE",
    headers: montarHeaders(token),
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

export async function apiPut<T>( caminho: string, corpo: unknown, token?: string): Promise<T> {
  const resposta = await fetch(`${API_URL}${caminho}`, {
    method: "PUT",
    headers: montarHeaders(token, true),
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
