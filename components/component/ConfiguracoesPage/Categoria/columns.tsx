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
import { Categoria } from "./CategoriaSchema";

export type CategoriaTableColumns = Categoria;

const GerenciarCategoria = ({
  categoria,
  atualizarCategorias,
  onEditar, 
}: {
  categoria: Categoria;
  atualizarCategorias: () => Promise<void>;
  onEditar: (categoria: Categoria) => void; // NOVO
}) => {
  const [openDelete, setOpenDelete] = useState(false);
  const token = useToken();

  // USAR ESSA FUNÇÃO PARA EXCLUIR DO BANCO
  async function excluirCategoria() {
    try {
      await apiDelete(`/categorias/${categoria.id}`, token ?? undefined);

      toast.add({ title: "Categoria excluída com sucesso!", type: "success" });
      setOpenDelete(false);
      await atualizarCategorias();
    } catch (error) {
      toast.add({ title: "Não foi possível excluir a categoria", type: "error" });
    }
  }

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEditar(categoria)}
          title="Editar categoria"
        >
          <Pencil className="size-4" />
          <span className="sr-only">Editar categoria</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpenDelete(true)}
          title="Excluir categoria"
        >
          <Trash2 className="size-4" />
          <span className="sr-only">Excluir categoria</span>
        </Button>
      </div>

      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20">
              <Trash2Icon />
            </AlertDialogMedia>

            <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>

            <AlertDialogDescription>
              Essa ação irá excluir permanentemente a categoria{" "}
              <strong>{categoria.nome}</strong>. Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel variant="outline">Cancelar</AlertDialogCancel>

            <AlertDialogAction variant="destructive" onClick={excluirCategoria}>
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export const columnsCategoria = (
  atualizarCategorias: () => Promise<void>,
  onEditar: (categoria: Categoria) => void, // NOVO — segundo parâmetro
): ColumnDef<Categoria>[] => [
  {
    accessorKey: "nome",
    header: "Nome da categoria",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.nome}</span>
    ),
  },
  {
    id: "gerenciar",
    header: () => <div className="text-right">Gerenciar</div>,
    cell: ({ row }) => (
      <GerenciarCategoria
        categoria={row.original}
        atualizarCategorias={atualizarCategorias}
        onEditar={onEditar}
      />
    ),
  },
];