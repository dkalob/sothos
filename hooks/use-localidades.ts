import { useState } from "react";

interface Estado {
  id: number;
  sigla: string;
  nome: string;
}

interface Cidade {
  id: number;
  nome: string;
}

export function useLocalidades() {
  const [estados, setEstados] = useState<Estado[]>([]);
  const [cidades, setCidades] = useState<Cidade[]>([]);

  async function carregarEstados() {
    try {
      const response = await fetch(
        "https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome",
      );

      if (!response.ok) {
        throw new Error("Erro ao buscar estados");
      }

      const estados = await response.json();
      setEstados(estados);
    } catch (error) {
      console.error("Erro:", error);
    }
  }

  async function carregarCidades(uf: string) {
    try {
      const response = await fetch(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`,
      );

      if (!response.ok) {
        throw new Error("Erro ao buscar cidades");
      }

      const cidades = await response.json();
      setCidades(cidades);
    } catch (error) {
      console.error("Erro:", error);
    }
  }

  return {
    estados,
    cidades,
    carregarEstados,
    carregarCidades,
    setCidades,
  };
}
