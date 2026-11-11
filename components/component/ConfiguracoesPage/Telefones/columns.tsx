"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreVertical, Pen, Pencil, Trash2, Trash2Icon } from "lucide-react";
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
import { apiDelete } from "@/lib/api";
import { toast } from "@/components/ui/toast";
import { useToken } from "@/hooks/use-token";
import { formatarTelefone } from "./TelefoneSchema";

export type Telefone = {
  id: string;
  nome: string | null;
  numero: string;
  criadoEm: string;
};

export const columnsTelefone = (
  atualizarTelefones: () => Promise<void>,
  editarTelefone: (telefone: Telefone) => void,
): ColumnDef<Telefone>[] => [
  {
    accessorKey: "nome",
    header: "Nome",
    cell: ({ row }) => (
      <Badge variant="outline">{row.original.nome ?? "—"}</Badge>
    ),
  },
  {
    accessorKey: "numero",
    header: "Número",
    cell: ({ row }) => <span className="text-muted-foreground">{formatarTelefone(row.original.numero)}</span>,
  },
  {
    accessorKey: "criadoEm",
    header: "Cadastrado em",
    cell: ({ row }) => (
        <span className="text-muted-foreground">
        {new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(
            new Date(row.original.criadoEm),
        )}
        </span>
    ),
  },
  {
    id: "gerenciar",
    header: () => <div className="text-right">Gerenciar</div>,
    cell: ({ row }) => {
      const t = row.original;
      const [open, setOpen] = useState(false);

      const token = useToken();

      const deletarTelefone = async () => {
        try {
          await apiDelete(`/telefones/${t.id}`, token ?? undefined);

          toast.add({
            title: "Telefone excluído com sucesso!",
            type: "success",
          });

          setOpen(false);
          await atualizarTelefones();
        } catch (error) {
          console.error("Erro ao deletar telefone:", error);

          toast.add({
            title: "Não foi possível excluir o telefone",
            type: "error",
          });
        }
      };

      return (
        <>
          <div className="flex items-center justify-end ">
            <Button variant="ghost" onClick={() => editarTelefone(t)}>
              <Pencil className="size-4"/>
            </Button>

            <Button variant="ghost" onClick={() => setOpen(true)}>
              <Trash2 className="size-4"/>
            </Button>
          </div>

          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent size="sm">
              <AlertDialogHeader>
                <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20">
                  <Trash2Icon />
                </AlertDialogMedia>

                <AlertDialogTitle>Excluir Telefone?</AlertDialogTitle>

                <AlertDialogDescription>
                  Essa ação irá excluir permanentemente o telefone{" "}
                  <strong>
                    {t.nome} {formatarTelefone(t.numero)}
                  </strong>
                  . Essa ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel variant="outline">
                  Cancelar
                </AlertDialogCancel>

                <AlertDialogAction
                  variant="destructive"
                  onClick={deletarTelefone}
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
