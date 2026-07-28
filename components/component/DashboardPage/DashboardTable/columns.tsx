"use client"
 
import { ColumnDef } from "@tanstack/react-table"

export type DashboardTableColumns = {
    cliente: string
    email: string
    campanha: string
    status: "pendente" | "Em andamento" | "Finalizada" | "erro"
    valor: number
    data: Date
}

export const columns: ColumnDef<DashboardTableColumns>[] = [
  {
    accessorKey: "cliente",
    header: "Cliente",
    cell: ({ row }) => {
        const cliente = row.getValue("cliente") as string
        const email = row.original.email
         return (
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="font-semibold">{cliente}</span>
            <span className="text-sm text-muted-foreground">{email}</span>
          </div>
        </div>
      )
    }
  },
  {
    accessorKey: "campanha",
    header: "Campanha",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "valor",
    header: () => <div>Valor</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("valor"))
      const formatted = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(amount)
 
      return <div className="font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "data",
    header: "Data",
    cell: ({ row }) => {
      const data = row.getValue("data") as Date
      const dataFormatada = new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(data)
      const horaFormatada = new Intl.DateTimeFormat("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(data)

      return (
        <div className="flex flex-col">
          <span>{dataFormatada}</span>
          <span className="text-sm text-muted-foreground">{horaFormatada}</span>
        </div>
      )
    },
  },
];