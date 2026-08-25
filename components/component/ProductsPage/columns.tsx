"use client";

// Essa página formata a tabela

import { ColumnDef } from "@tanstack/react-table";
import { BookUser, MoreVertical, Trash2, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
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

export type ProductTableColumns = {
  //Aqui define as colunas da tabela clientes
  imagem: string;
  nome: string;
  estoque: number;
  campanhas: string;
  preco: number;
  data: Date;
};

// Abaixo é como será a formatação das colunas. Sempre usar acessorKey
// e header (por enquanto) quando conectar com o BD talvez seja por id

export const columnsProduct: ColumnDef<ProductTableColumns>[] = [
  {
  accessorKey: "nome",
  header: "Nome",
  cell: ({ row }) => {
    const nome = row.getValue("nome") as string;
    const imagem = row.original.imagem;

    return (
      <div className="flex items-center gap-2">
        <img
          src={imagem}
          alt={nome}
          className="h-8 w-8 rounded-md object-cover"
        />
        <span className="font-semibold">{nome}</span>
      </div>
    );
  },
},
  {
    accessorKey: "estoque",
    header: "Qt. em estoque",
  },
  {
    accessorKey: "campanhas",
    header: "Campanhas",
  },
  {
    accessorKey: "preco",
    header: () => <div>Preço</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("preco"));
      const formatted = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(amount);

      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "data",
    header: "Última compra",
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
                <DropdownMenuItem>
                  <BookUser />
                  Ver produto
                </DropdownMenuItem>

                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setOpen(true)}
                >
                  <Trash2 />
                  Excluir produto
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
                  Essa ação irá excluir permanentemente o produto{" "}
                  <strong>{r.nome}</strong>. Essa ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel variant="outline">
                  Cancelar
                </AlertDialogCancel>

                <AlertDialogAction variant="destructive">
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

