"use client";

// Esta página formata tudo que vem depois de nav , PageHeader e PageCards
// Ela recebe os dados do BD vindo de ClientTable

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "../DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { ProductTableColumns} from "./columns";
import { Download, Plus } from "lucide-react";
import ProductSheet from "./ProductSheet";


interface ProductTableViewProps {
  columnsProduct: ColumnDef<ProductTableColumns>[];
  productsData: ProductTableColumns[];
}

const ProductTableView = ({
    columnsProduct,
    productsData
}: ProductTableViewProps) => {

  const [produtoSheet, setProdutoSheet] = useState(false);
  // Chama os componentes de Sheet no onClick

  return (
    <div className="mt-8">

      <div className="flex flex-col gap-2 ml-2.5">
        {/* HEADER E BOTÕES */}
        <div className="flex justify-between items-center">
          {/* HEADER */}
          <div className="flex flex-col">
                <span className="text-md font-medium">Todos os produtos</span>
                <span className="text-sm text-gray-600">
                  Visualize e administre todos os produtos da sua loja em uma
                  única tela
                </span>
          </div>

          {/* BOTÕES */}
          <div className="flex gap-2 items-center">
            <div className="flex gap-2 items-center">
              
              <Button variant="outline" className="w-40 truncate">
                <Download />
                Exportar Produtos
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
              />

            </div>
          </div>
        </div>

        {/*  TABELA  */}
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
