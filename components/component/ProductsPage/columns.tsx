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
  sku: string;
  campanhas: string[];
  ultimaCompra: string | null;
};

// Abaixo é como será a formatação das colunas. Sempre usar acessorKey
// e header (por enquanto) quando conectar com o BD talvez seja por id

export const columnsProduct: ColumnDef<ProductTableColumns>[] = [
  {
    accessorKey: "nome",
    header: "Nome",
    cell: ({ row }) => {
      const nome = row.getValue("nome") as string;
      const sku = row.original.sku;
      const imagem = row.original.imagem;

      return (
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border bg-muted">
            {imagem ? (
              <img
                src={imagem}
                alt={nome}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                Sem foto
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-col">
            <span className="font-semibold">{nome}</span>

            <span className="text-sm text-muted-foreground">
              {sku ? `SKU: ${sku}` : "Sem SKU"}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "campanhas",
    header: "Campanhas",
    cell: ({ row }) => {
      const campanhas = row.getValue("campanhas") as string[];

      if (campanhas.length === 0) {
        return <span className="text-muted-foreground">—</span>;
      }

      return (
        <div className="flex flex-col gap-1">
          {campanhas.map((campanha) => (
            <span key={campanha}>{campanha}</span>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "ultimaCompra",
    header: "Última compra",
    cell: ({ row }) => {
      const data = row.getValue("ultimaCompra") as string | null;

      if (!data) {
        return <span className="text-muted-foreground">—</span>;
      }

      const dataFormatada = new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(data));

      const horaFormatada = new Intl.DateTimeFormat("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(data));

      return (
        <div className="flex flex-col">
          <span>{dataFormatada}</span>
          <span className="text-sm text-muted-foreground">
            {horaFormatada}
          </span>
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

