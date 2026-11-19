"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "../DataTable";
import { Skeleton } from "@/components/ui/skeleton";
import { ColumnDef } from "@tanstack/react-table";
import { OrderTableColumns } from "./columns";
import { Download, Plus } from "lucide-react";
import OrderSheet from "./OrderSheet";
import { apiDelete, apiDownload, apiGet } from "@/lib/api";
import { useToken } from "@/hooks/use-token";
import { toast } from "@/components/ui/toast";
import ImportarPedidosSheet from "./ImportarPedidoSheet";

interface OrderTableViewProps {
  columnsOrder: (
    onEditarPedido: (id: string) => void,
    onExcluirPedido: (id: string) => Promise<void>,
  ) => ColumnDef<OrderTableColumns>[];
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

const OrderTableView = ({ columnsOrder }: OrderTableViewProps) => {
  const [orderData, setOrderData] = useState<OrderTableColumns[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [orderSheet, setOrderSheet] = useState(false);
  const [pedidoSelecionado, setPedidoSelecionado] = useState<string | null>(
    null,
  );
  const [importarPedidos, setImportarPedidos] = useState(false);
  const [exportando, setExportando] = useState(false);

  const token = useToken();

  async function buscarPedidos() {
    if (!token) return;

    try {
      const pedidos = await apiGet<OrderTableColumns[]>("/pedidos", token);

      setOrderData(pedidos);
    } catch (erro) {
      toast.add({
        title: "Não foi possível carregar os pedidos",
        type: "error",
      });
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    buscarPedidos();
  }, [token]);

  async function excluirPedido(id: string) {
    if (!token) return;

    try {
      await apiDelete(`/pedidos/${id}`, token);

      toast.add({
        title: "Pedido excluído com sucesso!",
        type: "success",
      });

      await buscarPedidos();
    } catch (erro) {
      console.error("Erro ao excluir pedido:", erro);
      toast.add({
        title: "Não foi possível excluir o pedido",
        type: "error",
      });
    }
  }

  if (carregando) {
    return <TabelaSkeleton />;
  }

  async function exportarPedidos() {
    if (!token) return;

    setExportando(true);

    try {
      await apiDownload("/exportacao/pedidos", token, "pedidos.csv");

      toast.add({
        title: "Pedidos exportados com sucesso!",
        type: "success",
      });
    } catch (erro) {
      toast.add({
        title:
          erro instanceof Error
            ? erro.message
            : "Não foi possível exportar os pedidos",
        type: "error",
      });
    } finally {
      setExportando(false);
    }
  }

  return (
    <div className="flex min-w-0 flex-col">
      <div className="mt-8 flex min-w-0 flex-col gap-2">
        {/* HEADER */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col">
            <span className="text-md font-medium">Todos os pedidos</span>

            <span className="text-sm text-gray-600">
              Visualize e administre todos os pedidos da sua loja em uma única
              tela
            </span>
          </div>

          {/* BOTÕES */}
          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:justify-end">
            <Button
              variant="outline"
              className="w-full min-w-0 truncate sm:w-40"
              onClick={exportarPedidos}
              disabled={exportando}
            >
              <Download />
              {exportando ? "Exportando..." : "Exportar Pedidos"}
            </Button>

            <Button
              variant="outline"
              className="w-full min-w-0 truncate sm:w-40"
              onClick={() => setImportarPedidos(true)}
            >
              <Download className="rotate-180" />
              Importar Pedidos
            </Button>

            <Button
              variant="default"
              className="col-span-2 w-full min-w-0 truncate sm:col-span-1 sm:w-32"
              onClick={() => {
                setPedidoSelecionado(null);
                setOrderSheet(true);
              }}
            >
              <Plus />
              Novo Pedido
            </Button>

            <OrderSheet
              open={orderSheet}
              onOpenChange={(open) => {
                setOrderSheet(open);
                if (!open) {
                  setPedidoSelecionado(null);
                }
              }}
              pedidoId={pedidoSelecionado}
              onPedidoCadastrado={buscarPedidos}
            />

            <ImportarPedidosSheet
              open={importarPedidos}
              onOpenChange={setImportarPedidos}
              onPedidosImportados={buscarPedidos}
            />
          </div>
        </div>

        {/* TABELA */}
        <DataTable
          columns={columnsOrder((id) => {
            setPedidoSelecionado(id);
            setOrderSheet(true);
          }, excluirPedido)}
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
