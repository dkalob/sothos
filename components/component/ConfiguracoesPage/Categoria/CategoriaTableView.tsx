"use client";

import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable } from "../../DataTable";

import { apiGet } from "@/lib/api";
import { useToken } from "@/hooks/use-token";
import { toast } from "@/components/ui/toast";

import { Categoria } from "./CategoriaSchema";
import CategoriaSheet from "./CategoriaSheet";

interface CategoriaTableViewProps {
  columnsCategoria: (
    atualizarCategorias: () => Promise<void>,
    onEditar: (categoria: Categoria) => void,
  ) => ColumnDef<Categoria>[];
}

const CategoriaTableView = ({ columnsCategoria }: CategoriaTableViewProps) => {
  const [categoriasData, setCategoriasData] = useState<Categoria[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [categoriaSheet, setCategoriaSheet] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState<Categoria | null>(null); // NOVO

  const token = useToken();

  async function buscarCategorias() {
    if (!token) return;

    try {
      const categorias = await apiGet<Categoria[]>("/categorias", token);
      setCategoriasData(categorias);
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
      toast.add({ title: "Não foi possível carregar as categorias", type: "error" });
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

  //abre o Sheet já em modo edição
  function abrirEdicao(categoria: Categoria) {
    setCategoriaEditando(categoria);
    setCategoriaSheet(true);
  }

  //abre o Sheet em modo criação (limpo)
  function abrirCriacao() {
    setCategoriaEditando(null);
    setCategoriaSheet(true);
  }

  if (carregando) {
    return <div className="mt-8">Carregando...</div>;
  }

  return (
    <div className="mt-8 mx-auto w-full max-w-[50vw]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col">
          <span className="font-bold text-2xl">Categorias de Produtos</span>
          <span className="text-sm text-gray-600">
            Crie e gerencie as categorias dos produtos da sua loja.
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button className="min-w-45" variant="default" onClick={abrirCriacao}>
            <Plus />
            Nova categoria
          </Button>

          <CategoriaSheet
            open={categoriaSheet}
            onOpenChange={setCategoriaSheet}
            onCategoriaCadastrada={atualizarCategorias}
            categoriaEditando={categoriaEditando}
          />
        </div>
      </div>

      <DataTable
        columns={columnsCategoria(atualizarCategorias, abrirEdicao)}
        data={categoriasData}
      />
    </div>
  );
};

export default CategoriaTableView;