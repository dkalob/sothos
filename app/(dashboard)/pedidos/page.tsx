
"use client";

import { useEffect, useState } from "react";
import OrderTable from "@/components/component/OrdersPage/OrderTable";
import PageCards from "@/components/component/PageCards";
import PageHeader from "@/components/component/PageHeader";
import { DollarSign, Store, UserRound, ShoppingBasket } from "lucide-react";
import { apiGet } from "@/lib/api";
import { useToken } from "@/hooks/use-token";
import { toast } from "@/components/ui/toast";

type Trend = {
  direction: "up" | "down";
  value: string;
};

type PedidosDashboard = {
  pedidos: {
    value: number;
    novosClientes: number;
    clientesRecorrentes: number;
    trend: Trend;
  };

  clientesCompradores: {
    value: number;
    quantidade: number;
    total: number;
    trend: Trend;
  };

  faturamento: {
    value: number;
    pendente: number;
    trend: Trend;
  };

  produtos: {
    value: number;
    totalProdutos: number;
    percentual: number;
    trend: Trend;
  };
};

const Pedidos = () => {
  const token = useToken();

  const [dashboard, setDashboard] = useState<PedidosDashboard | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!token) return;

    async function buscarDashboard() {
      try {
        const dados = await apiGet<PedidosDashboard>(
          "/pedidos/cards",
          token ?? undefined,
        );

        setDashboard(dados);
      } catch (error) {
        toast.add({
          title: "Não foi possível carregar os indicadores",
          type: "error",
        });
      } finally {
        setCarregando(false);
      }
    }

    buscarDashboard();
  }, [token]);

  const formatarMoeda = (valor: number) =>
    valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  return (
    <div>
      <PageHeader
        title="Gerenciamento de Pedidos"
        subtitle="Gerencie sua lista de pedidos e acompanhe o desempenho de sua loja."
      />

      {/* CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 justify-items-start mt-8 gap-4">

        {/* PEDIDOS REALIZADOS */}
        <PageCards
          icon={Store}
          title="Pedidos Realizados"
          loading={carregando}
          value={carregando ? "..." : dashboard?.pedidos.value ?? 0}
          trend={dashboard?.pedidos.trend ?? {
            direction: "up",
            value: "0%",
          }}
          footer={[
            {
              label: "Novos Clientes",
              value: dashboard?.pedidos.novosClientes ?? 0,
            },
            {
              label: "Clientes Recorrentes",
              value: dashboard?.pedidos.clientesRecorrentes ?? 0,
            },
          ]}
        />

        {/* CLIENTES COMPRADORES */}
        <PageCards
          icon={UserRound}
          title="Clientes que realizaram compra esse mês"
          loading={carregando}
          value={carregando ? "..." : `${dashboard?.clientesCompradores.value ?? 0}%`}
          trend={dashboard?.clientesCompradores.trend ?? {
            direction: "up",
            value: "0%",
          }}
          progress={{
            label: "Total de clientes",
            value: dashboard?.clientesCompradores.value ?? 0,
          }}
        />

        {/* FATURAMENTO */}
        <PageCards
          icon={DollarSign}
          title="Valor arrecadado"
          loading={carregando}
          value={carregando ? "..." : formatarMoeda(dashboard?.faturamento.value ?? 0)}
          trend={dashboard?.faturamento.trend ?? {
            direction: "up",
            value: "0%",
          }}
          footer={[
            {
              label: "Valor que pode ser convertido no mês atual",
              value: formatarMoeda(dashboard?.faturamento.pendente ?? 0),
            },
          ]}
        />

        {/* PRODUTOS ADQUIRIDOS */}
        <PageCards
          icon={ShoppingBasket}
          title="Produtos adquiridos em compras"
          loading={carregando}
          value={carregando ? "..." : dashboard?.produtos.value ?? 0}
          trend={dashboard?.produtos.trend ?? {
            direction: "up",
            value: "0%",
          }}
          progress={{
            label: "Total de produtos",
            value: dashboard?.produtos.percentual ?? 0,
          }}
        />

      </div>

      {/* TABELA */}
      <OrderTable />
    </div>
  );
};

export default Pedidos;
