"use client";

import { ColumnDef } from "@tanstack/react-table";
import RFMBadge, { RFMSegmento } from "../../RFMBadge";
import { Checkbox } from "@/components/ui/checkbox";

export type ClienteRecomendado = {
    id: string
    nome: string
    email: string
    segmento: string
    pedidos: number
    valor: number
    score: number
    scoreColaborativo: number
    scoreCategoria: number
}

export const columnsProdutoRecomendacao= (
  selecionados: string[],
  alternarCliente: (id:string) => void,
  alternarTodos: () => void,
  todosMarcados: boolean,
): ColumnDef<ClienteRecomendado>[] => [
    {
      id: "selecionar",
      header: () => (
        <Checkbox
          checked={todosMarcados}
          onCheckedChange={alternarTodos}
          aria-label="Selecionar todos"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selecionados.includes(row.original.id)}
          onCheckedChange={() => alternarCliente(row.original.id)}
          aria-label={`Selecionar ${row.original.nome}`}
        />
      ),
    },
    {
      accessorKey: "nome",
      header: "Cliente",
      cell: ({ row }) => {
        const cliente = row.getValue("nome") as string;
        const email = row.original.email;
        return (
          <div className="flex flex-col">
            <span className="font-semibold">{cliente}</span>
            <span className="text-sm text-muted-foreground">{email}</span>
          </div>
        );
      },
    },
  {
    accessorKey: "segmento",
    header: "Segmento RFM",
    cell: ({ row }) => {
      const segmento = row.getValue("segmento") as RFMSegmento;
      return <RFMBadge segmento={segmento} />;
    },
  },
  {
    accessorKey: "pedidos",
    header: "Quantidade de pedidos",
  },
  {
    accessorKey: "valor",
    header: () => <div>Valor Gasto</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("valor"));
      const formatted = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(amount);

      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    id: "score",
    header: "Compatibilidade",
    cell: ({ row }) => (
      <span className="font-semibold">
        {Math.round(row.original.score * 100)}%
      </span>
    ),
  },
]