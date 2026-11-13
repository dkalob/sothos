"use client";

import ClientTable from "@/components/component/ClientPage/ClientTable";
import PageCards from "@/components/component/PageCards";
import PageHeader from "@/components/component/PageHeader";
import { toast } from "@/components/ui/toast";
import { useToken } from "@/hooks/use-token";
import { apiGet } from "@/lib/api";
import { Megaphone, Users, UsersRound, UserStar } from "lucide-react";
import { useEffect, useState } from "react";

type Trend = {
  direction: "up" | "down";
  value: string;
};

type ClientesCard = {
  totalClientes: {
    value: number;
    novosMes: number;
    trend: Trend;
  };
  retencao: {
    value: number;
    clientesRecorrentes: number;
    trend: Trend;
  };
  grupos: {
    value: number;
    percentualClientesEmGrupos: number;
    trend: Trend;
  };
  gastos: {
    value: number;
    pedidosMes: number;
    trend: Trend;
  };
};

const Clientes = () => {
  const token = useToken();

  const [dashboard, setDashboard] = useState<ClientesCard | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!token) return;

    async function buscarDashboard() {
      try {
        const dados = await apiGet<ClientesCard>(
          "/clientes/cards",
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
        title="Gerenciamento de Clientes"
        subtitle="Gerencie seu portifólio de clientes e acompanhe o crescimento."
        //importButton={{ value: "Clientes" }}
      />

      {/* CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 justify-items-start mt-8 gap-4">
        <PageCards
          icon={Users}
          title="Clientes totais"
          loading={carregando}
          value={carregando ? "..." : (dashboard?.totalClientes.value ?? 0)}
          trend={
            dashboard?.totalClientes.trend ?? { direction: "up", value: "0%" }
          }
          footer={[
            { label: "Novos no mês atual", value: dashboard?.totalClientes.novosMes ?? 0 },
          ]}
        />

        <PageCards
          icon={UserStar}
          title="Taxa de retenção"
          loading={carregando}
          value={carregando ? "..." : `${dashboard?.retencao.value ?? 0}%`}
          trend={dashboard?.retencao.trend ?? { direction: "up", value: "0%" }}
          footer={[
            {
              label: "Clientes que voltaram a comprar no mês atual",
              value: dashboard?.retencao.clientesRecorrentes ?? 0,
            },
          ]}
        />

        <PageCards
          icon={UsersRound}
          title="Quantidade de grupos"
          loading={carregando}
          value={carregando ? "..." : (dashboard?.grupos.value ?? 0)}
          trend={dashboard?.grupos.trend ?? { direction: "up", value: "0%" }}
          footer={[
            {
              label: "Porcentagem de clientes em grupos",
              value: `${dashboard?.grupos.percentualClientesEmGrupos ?? 0}%`,
            },
          ]}
        />

        <PageCards
          icon={Megaphone}
          title="Valor gasto no mês"
          loading={carregando}
          value={
            carregando ? "..." : formatarMoeda(dashboard?.gastos.value ?? 0)
          }
          trend={dashboard?.gastos.trend ?? { direction: "up", value: "0%" }}
          footer={[
            {
              label: "Quantidade de pedidos realizados no mês atual",
              value: dashboard?.gastos.pedidosMes ?? 0,
            },
          ]}
        />
      </div>

      {/* TABELA */}
      <ClientTable />
    </div>
  );
};

export default Clientes;
