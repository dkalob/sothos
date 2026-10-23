"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "../DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { ProductTableColumns } from "./columns";
import { Download, Plus } from "lucide-react";
import ProductSheet from "./ProductSheet";
import { apiGet } from "@/lib/api";
import { useToken } from "@/hooks/use-token";
import { toast } from "@/components/ui/toast";

interface ProductTableViewProps {
  columnsProduct: (
    onEditarProduto: (id: string) => void,
    atualizarProdutos: () => Promise<void>
  ) => ColumnDef<ProductTableColumns>[];
}

const TabelaSkeleton = () => (
  <div className="overflow-hidden rounded-md border bg-white">
    {Array.from({ length: 4 }).map((_, i) => (
      <div
        key={i}
        className="flex items-center gap-4 border-b p-4 last:border-b-0"
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

  const token = useToken();

  async function buscarProdutos() {
    if (!token) return;

    try {
      const produtos = await apiGet<ProductTableColumns[]>(
        "/produtos",
        token,
      );

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

  return (
    <div className="mt-8">
      <div className="flex flex-col gap-2 ml-2.5">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-md font-medium">
              Todos os produtos
            </span>

            <span className="text-sm text-gray-600">
              Visualize e administre todos os produtos da sua loja em uma
              única tela
            </span>
          </div>

          <div className="flex gap-2 items-center">
            <Button variant="outline" className="w-40 truncate">
              <Download />
              Exportar Produtos
            </Button>

            <Button variant="outline" className="w-40 truncate">
              <Download className="rotate-180" />
              Importar Produtos
            </Button>

            <Button
              variant="default"
              className="w-32 truncate"
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
        </div>

        <DataTable
          columns={columnsProduct(
            editarProduto,
            atualizarProdutos
          )}
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
