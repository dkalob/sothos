"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "../DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { ProductTableColumns } from "./columns";
import { Download, Plus } from "lucide-react";
import ProductSheet from "./ProductSheet";
import { apiGet } from "@/lib/api";
import { useToken } from "@/hooks/use-token";
import { toast } from "@/components/ui/toast";

interface ProductTableViewProps {
  columnsProduct: ColumnDef<ProductTableColumns>[];
}

const ProductTableView = ({ columnsProduct }: ProductTableViewProps) => {
  const [produtoSheet, setProdutoSheet] = useState(false);
  const [productsData, setProductsData] = useState<ProductTableColumns[]>([]);
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

  if (carregando) {
    return <div className="mt-8">Carregando...</div>;
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
              onClick={() => setProdutoSheet(true)}
            >
              <Plus />
              Novo Produto
            </Button>

            <ProductSheet
              open={produtoSheet}
              onOpenChange={setProdutoSheet}
              onProdutoCadastrado={atualizarProdutos}
            />
          </div>
        </div>

        <DataTable
          columns={columnsProduct}
          data={productsData}
          hasFilter
          filterColumn="nome"
          filterPlaceholder="Filtrar produtos por nome..."
        />
      </div>
    </div>
  );
};

export default ProductTableView;
