"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "../DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { OrderTableColumns } from "./columns";
import { Download, Plus } from "lucide-react";
import OrderSheet from "./OrderSheet";
import { apiGet } from "@/lib/api";
import { useToken } from "@/hooks/use-token";

interface OrderTableViewProps {
  columnsOrder: ColumnDef<OrderTableColumns>[];
}

const OrderTableView = ({
  columnsOrder,
}: OrderTableViewProps) => {
  const [orderData, setOrderData] = useState<OrderTableColumns[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [orderSheet, setOrderSheet] = useState(false);

  const token = useToken();

  async function buscarPedidos() {
    if (!token) return;

    try {
      const pedidos = await apiGet<OrderTableColumns[]>(
        "/pedidos",
        token
      );

      console.log("PEDIDOS RECEBIDOS DA API:", pedidos);

      setOrderData(pedidos);
    } catch (erro) {
      console.error("Erro ao buscar pedidos:", erro);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    buscarPedidos();
  }, [token]);

  if (carregando) {
    return <div className="mt-8">Carregando...</div>;
  }

  return (
    <div className="mt-8">
      <div className="flex flex-col gap-2 ml-2.5">

        {/* HEADER */}
        <div className="flex justify-between items-center">

          <div className="flex flex-col">
            <span className="text-md font-medium">
              Todos os pedidos
            </span>

            <span className="text-sm text-gray-600">
              Visualize e administre todos os pedidos da sua loja em uma
              única tela
            </span>
          </div>

          {/* BOTÕES */}
          <div className="flex gap-2 items-center">

            <Button
              variant="outline"
              className="w-40 truncate"
            >
              <Download />
              Exportar Pedidos
            </Button>

            <Button
              variant="outline"
              className="w-40 truncate"
            >
              <Download className="rotate-180" />
              Importar Pedidos
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
              onPedidoCadastrado={buscarPedidos}
            />

          </div>
        </div>

        {/* TABELA */}
        <DataTable
          columns={columnsOrder}
          data={orderData}
          hasFilter
          hasPagination
          filterColumn="cliente"
          filterPlaceholder="Filtrar pedidos por cliente..."
        />

      </div>
    </div>
  );
};

export default OrderTableView;
