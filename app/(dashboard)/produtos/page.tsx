
"use client";

import { useEffect, useState } from "react";
import PageCards from "@/components/component/PageCards";
import PageHeader from "@/components/component/PageHeader";
import ProductTable from "@/components/component/ProductsPage/ProductTable";
import { Boxes, Megaphone, PackageSearch, ShoppingCart } from "lucide-react";
import { apiGet } from "@/lib/api";
import { useToken } from "@/hooks/use-token";
import { toast } from "@/components/ui/toast";

type Trend = {
  direction: "up" | "down";
  value: string;
};

type ProdutosDashboard = {
  produtos: {
    value: number;
    novosMes: number;
    trend: Trend;
  };
  semVenda: {
    value: number;
    quantidade: number;
    trend: Trend;
  };
  vendas: {
    value: number;
    valor: number;
    trend: Trend;
  };
  campanhas: {
    value: number;
    categoriaMaisVendida: string;
    trend: Trend;
  };
};

const Produtos = () => {
  const token = useToken();

  const [dashboard, setDashboard] = useState<ProdutosDashboard | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!token) return;

    async function buscarDashboard() {
      try {
        const dados = await apiGet<ProdutosDashboard>(
          "/produtos/cards",
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
        title="Gerenciamento de Produtos"
        subtitle="Gerencie seu inventário de produtos e acompanhe seu desempenho em campanhas."
      />

      {/* CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 justify-items-start mt-8 gap-4">
        <PageCards
          icon={PackageSearch}
          title="Produtos cadastrados"
          value={carregando ? "..." : dashboard?.produtos.value ?? 0}
          trend={dashboard?.produtos.trend ?? { direction: "up", value: "0%" }}
          footer={[
            {
              label: "Novos",
              value: dashboard?.produtos.novosMes ?? 0,
            },
          ]}
        />

        <PageCards
          icon={ShoppingCart}
          title="Produtos sem venda"
          value={carregando ? "..." : `${dashboard?.semVenda.value ?? 0}%`}
          trend={dashboard?.semVenda.trend ?? { direction: "up", value: "0%" }}
          footer={[
            {
              label: "Produtos que ainda não tiveram vendas no mês atual",
              value: dashboard?.semVenda.quantidade ?? 0,
            },
          ]}
        />

        <PageCards
          icon={Boxes}
          title="Quantidade vendida"
          value={carregando ? "..." : dashboard?.vendas.value ?? 0}
          trend={dashboard?.vendas.trend ?? { direction: "up", value: "0%" }}
          footer={[
            {
              label: "Valor a faturar em vendas no mês atual",
              value: formatarMoeda(dashboard?.vendas.valor ?? 0),
            },
          ]}
        />

        <PageCards
          icon={Megaphone}
          title="Campanhas vinculadas a produtos"
          value={carregando ? "..." : dashboard?.campanhas.value ?? 0}
          trend={dashboard?.campanhas.trend ?? { direction: "up", value: "0%" }}
          footer={[
            {
              label: "Categoria de produto mais vendida do mês",
              value: dashboard?.campanhas.categoriaMaisVendida ?? "-",
            },
          ]}
        />
      </div>

      {/* TABELA */}
      <ProductTable />
    </div>
  );
};

export default Produtos;
