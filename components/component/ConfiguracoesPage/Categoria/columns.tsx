"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  Check,
  Loader2,
  Pencil,
  Trash2,
  Trash2Icon,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

import { Categoria } from "./CategoriaSchema";

export type CategoriaTableColumns = Categoria;

const GerenciarCategoria = ({
  categoria,
  atualizarCategoria,
  excluirCategoria,
}: {
  categoria: Categoria;

  atualizarCategoria: (
    categoria: Categoria,
    novoNome: string,
  ) => Promise<void>;

  excluirCategoria: (
    categoria: Categoria,
  ) => Promise<void>;
}) => {
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState(categoria.nome);

  const [salvando, setSalvando] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [deletando, setDeletando] = useState(false);

  const salvarEdicao = async () => {
    const novoNome = nome.trim();

    if (!novoNome || salvando) {
      return;
    }

    if (novoNome === categoria.nome) {
      setEditando(false);
      return;
    }

    try {
      setSalvando(true);

      await atualizarCategoria(
        categoria,
        novoNome,
      );

      setEditando(false);
    } finally {
      setSalvando(false);
    }
  };

  const cancelarEdicao = () => {
    if (salvando) return;

    setNome(categoria.nome);
    setEditando(false);
  };

  const confirmarExclusao = async () => {
    if (deletando) return;

    try {
      setDeletando(true);

      await excluirCategoria(categoria);

      setOpenDelete(false);
    } finally {
      setDeletando(false);
    }
  };

  if (editando) {
    return (
      <div className="flex items-center justify-end gap-1">
        <Input
          value={nome}
          onChange={(event) =>
            setNome(event.target.value)
          }
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              salvarEdicao();
            }

            if (event.key === "Escape") {
              cancelarEdicao();
            }
          }}
          autoFocus
          disabled={salvando}
          className="h-8 w-64"
        />

        <Button
          variant="ghost"
          size="icon"
          onClick={salvarEdicao}
          disabled={
            !nome.trim() || salvando
          }
          title="Salvar"
        >
          {salvando ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Check className="size-4 text-green-600" />
          )}

          <span className="sr-only">
            Salvar categoria
          </span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={cancelarEdicao}
          disabled={salvando}
          title="Cancelar"
        >
          <X className="size-4" />

          <span className="sr-only">
            Cancelar edição
          </span>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-secondary border border-primary/10 p-2"
          onClick={() => {
            setNome(categoria.nome);
            setEditando(true);
          }}
          title="Editar categoria"
        >
          <Pencil className="size-4" />

          <span className="sr-only">
            Editar categoria
          </span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-secondary border border-primary/10 p-2 hover:destructive"
          onClick={() =>
            setOpenDelete(true)
          }
          title="Excluir categoria"
        >
          <Trash2 className="size-4" />

          <span className="sr-only">
            Excluir categoria
          </span>
        </Button>
      </div>

      <AlertDialog
        open={openDelete}
        onOpenChange={setOpenDelete}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20">
              <Trash2Icon />
            </AlertDialogMedia>

            <AlertDialogTitle>
              Excluir categoria?
            </AlertDialogTitle>

            <AlertDialogDescription>
              Essa ação irá excluir permanentemente a
              categoria{" "}
              <strong>{categoria.nome}</strong>.
              Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              variant="outline"
              disabled={deletando}
            >
              Cancelar
            </AlertDialogCancel>

            <AlertDialogAction
              variant="destructive"
              onClick={confirmarExclusao}
              disabled={deletando}
            >
              {deletando && (
                <Loader2 className="size-4 animate-spin" />
              )}

              {deletando
                ? "Excluindo..."
                : "Deletar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export const columnsCategoria = (
  atualizarCategorias: () => Promise<void>,
  atualizarCategoria: (
    categoria: Categoria,
    novoNome: string,
  ) => Promise<void>,
  excluirCategoria: (
    categoria: Categoria,
  ) => Promise<void>,
): ColumnDef<Categoria>[] => [
  {
    accessorKey: "nome",
    header: "Nome da categoria",

    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.nome}
      </span>
    ),
  },

  {
    id: "gerenciar",

    header: () => (
      <div className="text-right">
        Gerenciar
      </div>
    ),

    enableSorting: false,
    enableHiding: false,

    cell: ({ row }) => (
      <GerenciarCategoria
        categoria={row.original}
        atualizarCategoria={atualizarCategoria}
        excluirCategoria={excluirCategoria}
      />
    ),
  },
];
