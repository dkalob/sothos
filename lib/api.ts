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

  const texto = await resposta.text();
  const dados = texto ? JSON.parse(texto) : null;

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

export async function apiPostFormData<T>(
  caminho: string,
  corpo: FormData,
  token?: string,
): Promise<T> {
  const resposta = await fetch(`${API_URL}${caminho}`, {
    method: "POST",
    headers: montarHeaders(token),
    body: corpo,
  });

  const texto = await resposta.text();
  const dados = texto ? JSON.parse(texto) : null;

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

export async function apiDownload(
  caminho: string,
  token?: string,
  nomeArquivo = "exportacao.csv",
): Promise<void> {
  const resposta = await fetch(`${API_URL}${caminho}`, {
    method: "GET",
    headers: montarHeaders(token),
  });

  if (!resposta.ok) {
    const texto = await resposta.text();

    let mensagem = "Não foi possível exportar os dados.";

    try {
      const erro = JSON.parse(texto) as ApiError;
      mensagem = Array.isArray(erro.message)
        ? erro.message[0]
        : erro.message ?? mensagem;
    } catch {
      // Mantém a mensagem padrão se a resposta não for JSON.
    }

    throw new Error(mensagem);
  }

  const blob = await resposta.blob();
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = nomeArquivo;

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(url);
}

