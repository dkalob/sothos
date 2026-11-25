"use client";

// Essa página formata a tabela

import { ColumnDef } from "@tanstack/react-table";
import { MoreVertical, Pen, Trash2, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

export type OrderTableColumns = {
  //Aqui define as colunas da tabela clientes
  id: string;
  numero: string | null;
  cliente: string;
  produto: string;
  valor: number;
  data: Date;
  status: StatusPedido;
};

export type StatusPedido =
  | "PENDENTE"
  | "PAGO"
  | "ENVIADO"
  | "ENTREGUE"
  | "CANCELADO"
  | "DEVOLVIDO";

// Rótulo e cor de cada situação do pedido.
// Pago, enviado e entregue contam no RFM (RN009); os demais, não.
const statusConfig: Record<StatusPedido, { rotulo: string; cor: string }> = {
  PENDENTE: {
    rotulo: "Pendente",
    cor: "bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300",
  },
  PAGO: {
    rotulo: "Pago",
    cor: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  },
  ENVIADO: {
    rotulo: "Enviado",
    cor: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  },
  ENTREGUE: {
    rotulo: "Entregue",
    cor: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
  },
  CANCELADO: {
    rotulo: "Cancelado",
    cor: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
  },
  DEVOLVIDO: {
    rotulo: "Devolvido",
    cor: "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  },
};

// Abaixo é como será a formatação das colunas. Sempre usar acessorKey
// e header (por enquanto) quando conectar com o BD talvez seja por id

export const columnsOrder = (
  onEditarPedido: (id: string) => void,
  onExcluirPedido: (id: string) => Promise<void>,
): ColumnDef<OrderTableColumns>[] => [
  {
    accessorKey: "numero",
    header: "Id do pedido",
    cell: ({ row }) => {
      const numero = row.getValue("numero") as string | null;
      

      return (
        <div className="flex items-center gap-2">
          <span className="font-semibold">{numero ?? "-"}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "cliente",
    header: "Cliente",
  },
  {
    accessorKey: "produto",
    header: "Produtos",
  },
  {
    accessorKey: "valor",
    header: "Valor",
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
    accessorKey: "status",
    header: "Situação",
    cell: ({ row }) => {
      const status = row.getValue("status") as StatusPedido;
      const config = statusConfig[status];

      // Valor desconhecido: mostra o texto recebido, sem cor
      if (!config) {
        return <Badge variant="outline">{status ?? "-"}</Badge>;
      }

      return <Badge className={config.cor}>{config.rotulo}</Badge>;
    },
  },
  {
    accessorKey: "data",
    header: "Data da compra",
    cell: ({ row }) => {
      const data = new Date(row.getValue("data") as string);

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
      const r = row.original;
      const [open, setOpen] = useState(false);

      return (
        <>
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
                <DropdownMenuItem
                  onClick={() => { onEditarPedido(r.id);}}>
                  <Pen />
                  Editar pedido
                </DropdownMenuItem>

                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setOpen(true)}
                >
                  <Trash2 />
                  Excluir pedido
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent size="sm">
              <AlertDialogHeader>
                <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20">
                  <Trash2Icon />
                </AlertDialogMedia>

                <AlertDialogTitle>Excluir Produto?</AlertDialogTitle>

                <AlertDialogDescription>
                  Essa ação irá excluir permanentemente o pedido{" "}
                  <strong>{r.numero}</strong>. Essa ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel variant="outline">
                  Cancelar
                </AlertDialogCancel>

                <AlertDialogAction
                  variant="destructive"
                  onClick={async () => {
                    await onExcluirPedido(r.id);
                    setOpen(false);
                  }}
                >
                  Deletar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      );
    },
  },
];