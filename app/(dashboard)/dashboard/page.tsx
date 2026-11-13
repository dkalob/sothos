"use client";

import { useEffect, useState } from "react";

import PeriodSelector from "@/components/component/PeriodSelector";
import PageCards from "@/components/component/PageCards";
import DashboardChart from "@/components/component/DashboardPage/DashboardChart";
import DashboardTable from "@/components/component/DashboardPage/DashboardTable/page";
import PageHeader from "@/components/component/PageHeader";

import { toast } from "@/components/ui/toast";
import { useToken } from "@/hooks/use-token";
import { apiGet } from "@/lib/api";

import { Ad, HandCoins, Users, Wallet } from "lucide-react";

// TIPOS

type Periodo = "DIARIO" | "SEMANAL" | "MENSAL";

type Trend = {
  direction: "up" | "down";
  value: string;
};

type ClientesCard = {
  totalClientes: {
    value: number;
  };
  novos: {
    value: number;
    trend: Trend;
  };
  recorrentes: {
    value: number;
    trend: Trend;
  };
};

type LucroCard = {
  faturamento: {
    value: number;
    trend: Trend;
  };
  meta: {
    value: number;
    atingido: number;
    percentual: number;
  };
};

type CampanhasCard = {
  campanhas: {
    value: number;
    trend: Trend;
  };
  clientesAtingidos: {
    value: number;
    trend: Trend;
  };
  mensagens: {
    value: number;
    trend: Trend;
  };
};

type ProdutosCard = {
  produtosVendidos: {
    value: number;
    trend: Trend;
  };
  categoriaMaisVendida: {
    value: string;
    quantidade: number;
  };
};

type GraficoCard = {
  meta: number;
  faturamentoTotal: number;
  percentualMeta: number;
  dados: {
    dia: string;
    metaAtingida: number;
    metaEsperada: number;
  }[];
};

const Indicadores = () => {
  const token = useToken();

  // PERÍODO SELECIONADO
  const [periodo, setPeriodo] = useState<Periodo>("DIARIO");

  // META
  const [meta, setMeta] = useState(0);

  // DADOS DOS CARDS
  const [clientes, setClientes] = useState<ClientesCard | null>(null);
  const [lucro, setLucro] = useState<LucroCard | null>(null);
  const [campanhas, setCampanhas] = useState<CampanhasCard | null>(null);
  const [produtos, setProdutos] = useState<ProdutosCard | null>(null);
  const [grafico, setGrafico] = useState<GraficoCard | null>(null);

  const [carregando, setCarregando] = useState(true);

  // BUSCAR INDICADORES
  useEffect(() => {
    if (!token) return;
    const tokenAutenticado = token;

    let ativo = true;

    async function buscarIndicadores() {
      setCarregando(true);

      try {
        const [dadosClientes, dadosLucro, dadosCampanhas, dadosProdutos, dadosGrafico] =
          await Promise.all([
            apiGet<ClientesCard>(
              `/indicadores/clientes?periodo=${periodo}`,
              tokenAutenticado,
            ),

            apiGet<LucroCard>(
              `/indicadores/vendas?periodo=${periodo}&meta=${meta}`,
              tokenAutenticado,
            ),

            apiGet<CampanhasCard>(
              `/indicadores/campanhas?periodo=${periodo}`,
              tokenAutenticado,
            ),

            apiGet<ProdutosCard>(
              `/indicadores/produtos?periodo=${periodo}`,
              tokenAutenticado,
            ),

            apiGet<GraficoCard>(
              `/indicadores/grafico?meta=${meta}`,
              tokenAutenticado,
            ),
          ]);

        if (!ativo) return;

        setClientes(dadosClientes);
        setLucro(dadosLucro);
        setCampanhas(dadosCampanhas);
        setProdutos(dadosProdutos);
        setGrafico(dadosGrafico)
      } catch (error) {
        if (!ativo) return;

        toast.add({
          title: "Não foi possível carregar os indicadores",
          type: "error",
        });
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    buscarIndicadores();

    return () => {
      ativo = false;
    };
  }, [token, periodo, meta]);

  // FORMATAR MOEDA
  const formatarMoeda = (valor: number) =>
    valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  // TREND PADRÃO
  const trendPadrao: Trend = {
    direction: "up",
    value: "0%",
  };

  return (
    <main>
      {/* TÍTULO + FILTRO DE PERÍODO */}
      <div className="flex justify-between items-center">
        <PageHeader
          title="Indicadores de Performance"
          subtitle="Acompanhe em tempo real o rendimento de suas campanhas"
        />

        <PeriodSelector periodo={periodo} onChange={setPeriodo} />
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 justify-items-start mt-8 gap-4">
        {/* CLIENTES */}
        <PageCards
          icon={Users}
          title="Clientes totais"
          loading={carregando}
          value={clientes?.totalClientes.value ?? 0}
          trend={clientes?.novos.trend ?? trendPadrao}
          footer={[
            {
              label: "Novos",
              value: clientes?.novos.value ?? 0,
            },
            {
              label: "Recorrentes",
              value: clientes?.recorrentes.value ?? 0,
            },
          ]}
        />

        {/* LUCRO */}
        <PageCards
          icon={Wallet}
          title="Lucro Total"
          loading={carregando}
          value={formatarMoeda(lucro?.faturamento.value ?? 0)}
          trend={lucro?.faturamento.trend ?? trendPadrao}
          progress={{
            label: "Meta Atingida",
            value: lucro?.meta.percentual ?? 0,
          }}
        />

        {/* CAMPANHAS */}
        <PageCards
          icon={Ad}
          title="Campanhas criadas"
          loading={carregando}
          value={campanhas?.campanhas.value ?? 0}
          trend={campanhas?.campanhas.trend ?? trendPadrao}
          footer={[
            {
              label: "Clientes atingidos",
              value: campanhas?.clientesAtingidos.value ?? 0,
            },
            {
              label: "Mensagens enviadas",
              value: campanhas?.mensagens.value ?? 0,
            },
          ]}
        />

        {/* PRODUTOS */}
        <PageCards
          icon={HandCoins}
          title="Produtos vendidos"
          loading={carregando}
          value={produtos?.produtosVendidos.value ?? 0}
          trend={produtos?.produtosVendidos.trend ?? trendPadrao}
          footer={[
            {
              label: "Categoria mais vendida",
              value: produtos?.categoriaMaisVendida.value ?? "Sem vendas",
            },
          ]}
        />
      </div>

      {/* GRÁFICO */}
      <DashboardChart
        data={grafico?.dados ?? []}
        meta={meta}
        onMetaChange={setMeta}
      />

      {/* TABELA */}
      {/* <DashboardTable /> */}
    </main>
  );
};

export default Indicadores;
