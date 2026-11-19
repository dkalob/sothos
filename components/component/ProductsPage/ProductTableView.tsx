"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "../DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { ProductTableColumns } from "./columns";
import { Download, Plus } from "lucide-react";
import ProductSheet from "./ProductSheet";
import { apiDownload, apiGet } from "@/lib/api";
import { useToken } from "@/hooks/use-token";
import { toast } from "@/components/ui/toast";
import ImportarProdutosSheet from "./ImportarProdutoSheet";

interface ProductTableViewProps {
  columnsProduct: (
    onEditarProduto: (id: string) => void,
    atualizarProdutos: () => Promise<void>,
  ) => ColumnDef<ProductTableColumns>[];
}

const TabelaSkeleton = () => (
  <div className="w-full overflow-x-auto rounded-md border bg-white mt-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <div
        key={i}
        className="flex min-w-150 items-center gap-4 border-b p-4 last:border-b-0"
      >
        <Skeleton className="size-10 rounded-md" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
      </div>
    ))}
  </div>
);

const ProductTableView = ({ columnsProduct }: ProductTableViewProps) => {
  const [produtoSheet, setProdutoSheet] = useState(false);
  const [productsData, setProductsData] = useState<ProductTableColumns[]>([]);
  const [produtoId, setProdutoId] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [importarProdutosSheet, setImportarProdutosSheet] = useState(false);
  const [exportando, setExportando] = useState(false);

  const token = useToken();

  async function buscarProdutos() {
    if (!token) return;

    try {
      const produtos = await apiGet<ProductTableColumns[]>("/produtos", token);

      setProductsData(produtos);
    } catch (error) {
      toast.add({
        title: "Não foi possível carregar os produtos",
        type: "error",
      });
    } finally {
      setCarregando(false);
    }
  }

  const atualizarProdutos = async () => {
    await buscarProdutos();
  };

  useEffect(() => {
    buscarProdutos();
  }, [token]);

  function editarProduto(id: string) {
    setProdutoId(id);
    setProdutoSheet(true);
  }

  if (carregando) {
    return <TabelaSkeleton />;
  }

  
  async function exportarProdutos() {
    if (!token) return;

    setExportando(true);

    try {
      await apiDownload(
        "/exportacao/produtos",
        token,
        "produtos.csv",
      );

      toast.add({
        title: "Produtos exportados com sucesso!",
        type: "success",
      });
    } catch (erro) {
      toast.add({
        title:
          erro instanceof Error
            ? erro.message
            : "Não foi possível exportar os produtos",
        type: "error",
      });
    } finally {
      setExportando(false);
    }
  }


  return (
    <div className="mt-8">
      <div className="mt-8 flex min-w-0 flex-col gap-2">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-col">
            <span className="text-md font-medium">Todos os produtos</span>

            <span className="text-sm text-gray-600">
              Visualize e administre todos os produtos da sua loja em uma única
              tela
            </span>
          </div>

          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:justify-end">
            <Button
              variant="outline"
              className="w-full min-w-0 truncate sm:w-40"
              onClick={exportarProdutos}
              disabled={exportando}
            >
              <Download />
              {exportando ? "Exportando..." : "Exportar Produtos"}
            </Button>

            <Button
              variant="outline"
              className="w-full min-w-0 truncate sm:w-40"
              onClick={() => setImportarProdutosSheet(true)}
            >
              <Download className="rotate-180" />
              Importar Produtos
            </Button>

            <Button
              variant="default"
              className="col-span-2 w-full min-w-0 truncate sm:col-span-1 sm:w-32"
              onClick={() => {
                setProdutoId(null);
                setProdutoSheet(true);
              }}
            >
              <Plus />
              Novo Produto
            </Button>

            <ProductSheet
              open={produtoSheet}
              onOpenChange={(aberto) => {
                setProdutoSheet(aberto);

                if (!aberto) {
                  setProdutoId(null);
                }
              }}
              onProdutoCadastrado={atualizarProdutos}
              produtoId={produtoId}
            />
          </div>

          <ImportarProdutosSheet
            open={importarProdutosSheet}
            onOpenChange={setImportarProdutosSheet}
            onProdutosImportados={atualizarProdutos}
          />
        </div>

        <DataTable
          columns={columnsProduct(editarProduto, atualizarProdutos)}
          data={productsData}
          hasFilter
          hasPagination
          filterColumn="nome"
          filterPlaceholder="Filtrar produtos por nome..."
        />
      </div>
    </div>
  );
};

export default ProductTableView;
