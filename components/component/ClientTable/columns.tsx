"use client";

import { ColumnDef } from "@tanstack/react-table";
import RFMBadge, { RFMSegmento } from "../RFMBadge";
import { BookUser, MoreVertical, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type ClientTableColumns = {
  cliente: string;
  email: string;
  segmento: "Campeões" | "Leais" | "Potenciais Leais" | "Recém-Chegados" | "Promissores" | 
            "Precisam de Atenção" | "À Beira de Dormir" | "Em Risco" | "Não Podem Perder" |
            "Hibernando" | "Perdidos"
  pedidos: number;
  valor: number;
  data: Date;
};

export type GroupTableColumns = {
  data: Date;
  nome: string;
  campanhas:  number;
  clientes: number;
  valor: number;
};

export const columnsClient: ColumnDef<ClientTableColumns>[] = [
  {
    accessorKey: "cliente",
    header: "Cliente",
    cell: ({ row }) => {
      const cliente = row.getValue("cliente") as string;
      const email = row.original.email;
      return (
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="font-semibold">{cliente}</span>
            <span className="text-sm text-muted-foreground">{email}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "segmento",
    header: "RFM",
    cell:  ({ row }) => {
        const segmento = row.getValue("segmento") as RFMSegmento;
        return <RFMBadge segmento={segmento} />
    }
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
    accessorKey: "data",
    header: "Última atividade",
    cell: ({ row }) => {
      const data = row.getValue("data") as Date;
      const dataFormatada = new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(data);
      const horaFormatada = new Intl.DateTimeFormat("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(data);

      return (
        <div className="flex flex-col">
          <span>{dataFormatada}</span>
          <span className="text-sm text-muted-foreground">{horaFormatada}</span>
        </div>
      );
    },
  },
  {
  header: "Gerenciar",
  cell: ({ row }) => {
    const r = row.original
    return (
      <DropdownMenu>
        <DropdownMenuTrigger 
          render={
            <Button variant="ghost">
              <span className="sr-only">Abrir menu</span>
              <MoreVertical className="h-4 w-4" />
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-36">
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <BookUser/>
              Ver cliente
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive">
              <Trash2/>
              Excluir Cliente
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  },
},
];

export const columnsGroup: ColumnDef<GroupTableColumns>[] = [
  {
    accessorKey: "data",
    header: "Data da última atualização",
    cell: ({ row }) => {
      const data = row.getValue("data") as Date;
      const dataFormatada = new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(data);
      const horaFormatada = new Intl.DateTimeFormat("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(data);

      return (
        <div className="flex flex-col">
          <span>{dataFormatada}</span>
          <span className="text-sm text-muted-foreground">{horaFormatada}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "nome",
    header: "Nome do grupo",
    cell: ({ row }) => {
      const grupo = row.getValue("nome") as string;
      return (
            <span className="font-semibold">{grupo}</span>
      );
    },
  },
  {
    accessorKey: "campanhas",
    header: "Campanhas",
  },
  {
    accessorKey: "clientes",
    header: "Total de clientes",
  },
  {
    accessorKey: "valor",
    header: () => <div>Valor Gasto pelo grupo</div>,
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
  header: "Gerenciar",
  cell: ({ row }) => {
    const r = row.original
    return (
      <DropdownMenu>
        <DropdownMenuTrigger 
          render={
            <Button variant="ghost">
              <span className="sr-only">Abrir menu</span>
              <MoreVertical className="h-4 w-4" />
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-36">
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <BookUser/>
              Ver Grupo
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive">
              <Trash2/>
              Excluir Grupo
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  },
},
];
