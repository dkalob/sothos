"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { apiDelete } from "@/lib/api";
import { useToken } from "@/hooks/use-token";
import { toast } from "@/components/ui/toast";
import { Caracteristica } from "./CaracteristicaSchema";
import { Badge } from "@/components/ui/badge";

export type CaracteristicaTableColumns = Caracteristica;

const GerenciarCaracteristica = ({
  caracteristica,
  atualizarCaracteristica,
  onEditar, 
}: {
  caracteristica: Caracteristica;
  atualizarCaracteristica: () => Promise<void>;
  onEditar: (caracteristica: Caracteristica) => void;
}) => {
  const [openDelete, setOpenDelete] = useState(false);
  const token = useToken();

  // USAR ESSA FUNÇÃO PARA EXCLUIR DO BANCO
  async function excluirCaracteristica() {
    try {
      await apiDelete(`/caracteristicas-produto/${caracteristica.id}`, token ?? undefined);

      toast.add({ title: "Caracteristica excluída com sucesso!", type: "success" });
      setOpenDelete(false);
      await atualizarCaracteristica();
    } catch (error) {
      toast.add({ title: "Não foi possível excluir a caracteristica", type: "error" });
    }
  }

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEditar(caracteristica)}
          title="Editar caracteristica"
        >
          <Pencil className="size-4" />
          <span className="sr-only">Editar caracteristica</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpenDelete(true)}
          title="Excluir caracteristica"
        >
          <Trash2 className="size-4" />
          <span className="sr-only">Excluir caracteristica</span>
        </Button>
      </div>

      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20">
              <Trash2Icon />
            </AlertDialogMedia>

            <AlertDialogTitle>Excluir caracteristica?</AlertDialogTitle>

            <AlertDialogDescription>
              Essa ação irá excluir permanentemente a caracteristica{" "}
              <strong>{caracteristica.nome}</strong>. Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel variant="outline">Cancelar</AlertDialogCancel>

            <AlertDialogAction variant="destructive" onClick={excluirCaracteristica}>
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export const columnsCaracteristica = (
  atualizarCaracteristica: () => Promise<void>,
  onEditar: (caracteristica: Caracteristica) => void,
): ColumnDef<Caracteristica>[] => [
  {
    accessorKey: "nome",
    header: "Nome da caracteristica",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.nome}</span>
    ),
  },
  {
    accessorKey: "tipo",
    header: "Tipo",
    cell: ({ row }) => {
        const tipo = row.getValue("tipo") as string;
        const labels: Record<string, string> = {
        TEXTO: "Texto livre",
        NUMERO: "Número",
        BOOLEANO: "Sim ou Não",
        OPCAO: "Lista de opções",
        };
        return <Badge variant="outline">{labels[tipo] ?? tipo}</Badge>;
    },
  },
  {
    accessorKey: "opcoes",
    header: "Opções",
    cell: ({ row }) => {
        const opcoes = row.original.opcoes;
        if (opcoes.length === 0) return <span className="text-muted-foreground">—</span>;
        return <span className="text-sm text-muted-foreground">{opcoes.join(", ")}</span>;
    },
  },
  {
    id: "gerenciar",
    header: () => <div className="text-right">Gerenciar</div>,
    cell: ({ row }) => (
      <GerenciarCaracteristica
        caracteristica={row.original}
        atualizarCaracteristica={atualizarCaracteristica}
        onEditar={onEditar}
      />
    ),
  },
];