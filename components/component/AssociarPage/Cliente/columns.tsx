"use client";

import { ColumnDef } from "@tanstack/react-table";

export type ProdutoRecomendado = {
  id: string;
  nome: string;
  sku: string | null;
  imagem: string | null;
  preco: number | null;
  categoria: string | null;
  caracteristicas: Record<string, string>;
  score: number;
  scoreColaborativo: number;
  scoreCategoria: number;
};

export const columnsRecomendacao = (nomesCaracteristicas: string[]): ColumnDef<ProdutoRecomendado>[] => [
  {
    id: "produto",
    header: "Produto",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        {row.original.imagem ? (
          <img
            src={row.original.imagem}
            alt={row.original.nome}
            className="size-10 rounded-md object-cover"
          />
        ) : (
          <div className="size-10 rounded-md bg-muted" />
        )}
        <div className="flex flex-col">
          <span className="font-semibold">{row.original.nome}</span>
          <span className="text-sm text-muted-foreground">
            {row.original.sku ?? "Sem SKU"}
          </span>
        </div>
      </div>
    ),
  },
  {
    id: "categoria",
    header: "Categoria",
    cell: ({ row }) => row.original.categoria ?? "—",
  },
  {
    id: "preco",
    header: "Preço",
    cell: ({ row }) =>
      row.original.preco !== null
        ? new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(row.original.preco)
        : "—",
  },
  // uma coluna para cada característica que aparece nos resultados
  ...nomesCaracteristicas.map(
    (nome): ColumnDef<ProdutoRecomendado> => ({
      id: `caracteristica-${nome}`,
      header: nome,
      cell: ({ row }) => row.original.caracteristicas[nome] ?? "—",
    }),
  ),
  {
    id: "score",
    header: "Compatibilidade",
    cell: ({ row }) => (
      <span className="font-semibold">
        {Math.round(row.original.score * 100)}%
      </span>
    ),
  },
];