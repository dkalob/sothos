"use client";

// Esta página formata tudo que vem depois de nav , PageHeader e PageCards
// Ela recebe os dados do BD vindo de ClientTable

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "../DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { OrderTableColumns} from "./columns";
import { Download, Plus } from "lucide-react";
import OrderSheet from "./OrderSheet";


interface OrderTableViewProps {
  columnsOrder: ColumnDef<OrderTableColumns>[];
  orderData: OrderTableColumns[];
}

const OrderTableView = ({
    columnsOrder,
    orderData
}: OrderTableViewProps) => {

  const [orderSheet, setOrderSheet] = useState(false);
  // Chama os componentes de Sheet no onClick

  return (
    <div className="mt-8">

      <div className="flex flex-col gap-2 ml-2.5">
        {/* HEADER E BOTÕES */}
        <div className="flex justify-between items-center">
          {/* HEADER */}
          <div className="flex flex-col">
                <span className="text-md font-medium">Todos os pedidos</span>
                <span className="text-sm text-gray-600">
                  Visualize e administre todos os pedidos da sua loja em uma
                  única tela
                </span>
          </div>

          {/* BOTÕES */}
          <div className="flex gap-2 items-center">
            <div className="flex gap-2 items-center">
              
              <Button variant="outline" className="w-40 truncate">
                <Download />
                Exportar Pedidos
              </Button>
              
              <Button
                variant="default"
                className="w-32 truncate"
                onClick={() => setOrderSheet(true)}
              >
                <Plus />
                Novo Pedido
              </Button>

              <OrderSheet 
                open={orderSheet} 
                onOpenChange={setOrderSheet} 
              />

            </div>
          </div>
        </div>

        {/*  TABELA  */}
          <DataTable
            columns={columnsOrder}
            data={orderData}
            hasFilter
            filterColumn="cliente"
            filterPlaceholder="Filtrar pedidos por cliente..."
          />

      </div>
    </div>
  );
};

export default OrderTableView;
