"use client";

import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable } from "../../DataTable";

import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api";
import { useToken } from "@/hooks/use-token";
import { toast } from "@/components/ui/toast";

import { Categoria, categoriaSchema } from "./CategoriaSchema";
import CategoriaSheet from "./CategoriaSheet";

interface CategoriaTableViewProps {
  columnsCategoria: (
    atualizarCategorias: () => Promise<void>,
    editarCategoria: (categoria: Categoria, novoNome: string) => Promise<void>,
    excluirCategoria: (categoria: Categoria) => Promise<void>,
  ) => ColumnDef<Categoria>[];
}

const CategoriaTableView = ({ columnsCategoria }: CategoriaTableViewProps) => {
  const [categoriasData, setCategoriasData] = useState<Categoria[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [novaCategoria, setNovaCategoria] = useState("");
  const [criandoCategoria, setCriandoCategoria] = useState(false);
  const [categoriaSheet, setCategoriaSheet] = useState(false);

  const token = useToken();

  async function buscarCategorias() {
    if (!token) return;

    try {
      const categorias = await apiGet<Categoria[]>("/categorias", token);

      setCategoriasData(categorias);
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
      toast.add({
        title: "Não foi possível carregar as categorias",
        type: "error",
      });
    } finally {
      setCarregando(false);
    }
  }

  const atualizarCategorias = async () => {
    await buscarCategorias();
  };

  useEffect(() => {
    buscarCategorias();
  }, [token]);

  const criarCategoria = async () => {
    const resultado = categoriaSchema.safeParse({
      nome: novaCategoria,
    });

    if (!resultado.success) {
      toast.add({
        title:
          resultado.error.issues[0]?.message ?? "Nome da categoria inválido",
        type: "error",
      });

      return;
    }

    if (!token) return;

    try {
      setCriandoCategoria(true);

      await apiPost<Categoria>(
        "/categorias",
        {
          nome: resultado.data.nome,
        },
        token,
      );

      toast.add({
        title: "Categoria criada com sucesso!",
        type: "success",
      });

      setNovaCategoria("");

      await buscarCategorias();
    } catch (error) {
      console.error("Erro ao criar categoria:", error);

      toast.add({
        title:
          error instanceof Error
            ? error.message
            : "Não foi possível criar a categoria",
        type: "error",
      });
    } finally {
      setCriandoCategoria(false);
    }
  };

  const editarCategoria = async (categoria: Categoria, novoNome: string) => {
    if (!token) return;

    const resultado = categoriaSchema.safeParse({
      nome: novoNome,
    });

    if (!resultado.success) {
      toast.add({
        title:
          resultado.error.issues[0]?.message ?? "Nome da categoria inválido",
        type: "error",
      });

      throw new Error("Nome da categoria inválido");
    }

    try {
      await apiPut<Categoria>(
        `/categorias/${categoria.id}`,
        {
          nome: resultado.data.nome,
        },
        token,
      );

      toast.add({
        title: "Categoria atualizada com sucesso!",
        type: "success",
      });

      await buscarCategorias();
    } catch (error) {
      console.error("Erro ao editar categoria:", error);

      toast.add({
        title:
          error instanceof Error
            ? error.message
            : "Não foi possível atualizar a categoria",
        type: "error",
      });

      throw error;
    }
  };

  const excluirCategoria = async (categoria: Categoria) => {
    if (!token) return;

    try {
      await apiDelete(`/categorias/${categoria.id}`, token);

      toast.add({
        title: "Categoria excluída com sucesso!",
        type: "success",
      });

      await buscarCategorias();
    } catch (error) {
      console.error("Erro ao excluir categoria:", error);

      toast.add({
        title:
          error instanceof Error
            ? error.message
            : "Não foi possível excluir a categoria",
        type: "error",
      });

      throw error;
    }
  };

  if (carregando) {
    return <div className="mt-8">Carregando...</div>;
  }

  return (
    <div className="mt-8 mx-auto w-full max-w-[50vw]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col">
          <span className="font-bold text-2xl">Categorias</span>

          <span className="text-sm text-gray-600">
            Crie e gerencie as categorias dos produtos da sua loja.
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="default" onClick={() => setCategoriaSheet(true)}>
            <Plus />
            Nova categoria
          </Button>

          <CategoriaSheet
            open={categoriaSheet}
            onOpenChange={setCategoriaSheet}
            onCategoriaCadastrada={atualizarCategorias}
          />
        </div>
      </div>

      <DataTable
        columns={columnsCategoria(
          atualizarCategorias,
          editarCategoria,
          excluirCategoria,
        )}
        data={categoriasData}
      />
    </div>
  );
};

export default CategoriaTableView;
