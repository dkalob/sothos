"use client";

import { useEffect, useState } from "react";
import CampanhaTable from "@/components/component/Campanhas/CampanhaTable";
import PageCards from "@/components/component/PageCards";
import PageHeader from "@/components/component/PageHeader";
import { Boxes, Megaphone, PackageSearch, ShoppingCart } from "lucide-react";
import { apiGet } from "@/lib/api";
import { useToken } from "@/hooks/use-token";
import { toast } from "@/components/ui/toast";

interface CampanhaCards {
  campanhas: {
    value: number;
    novas: number;
    trend: { direction: "up" | "down"; value: string };
  };
  mensagens: {
    value: number;
    whatsapp: number;
    email: number;
    trend: { direction: "up" | "down"; value: string };
  };
  clientesAtingidos: {
    value: number;
    total: number;
    trend: { direction: "up" | "down"; value: string };
  };
  produtos: {
    value: number;
    aguardando: number;
    trend: { direction: "up" | "down"; value: string };
  };
}

const Campanhas = () => {
  const [cards, setCards] = useState<CampanhaCards | null>(null);
  const [carregando, setCarregando] = useState(true);

  const token = useToken();

  useEffect(() => {
    if (!token) return;

    async function buscarCards() {
      try {
        const dados = await apiGet<CampanhaCards>(
          "/campanhas/cards",
          token ?? undefined,
        );

        setCards(dados);
      } catch (error) {
        toast.add({
          title: "Não foi possível carregar os indicadores de campanhas",
          type: "error",
        });
      } finally {
        setCarregando(false);
      }
    }

    buscarCards();
  }, [token]);

  const valor = (numero: number) =>
    carregando ? "..." : numero.toLocaleString("pt-BR");

  return (
    <main>
      <PageHeader
        title="Gerenciamento de Campanhas"
        subtitle="Gerencie suas campanhas e acompanhe como elas estão performando"
      />

      {/* CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 justify-items-start mt-8 gap-4">
          <PageCards
            icon={PackageSearch}
            title="Total de campanhas cadastradas"
            value={valor(cards?.campanhas.value ?? 0)}
            loading={carregando}
            trend={{
              direction: cards?.campanhas.trend.direction ?? "up",
              value: cards?.campanhas.trend.value ?? "0%",
            }}
            footer={[{ label: "Novas no mês atual", value: cards?.campanhas.novas ?? 0 }]}
          />

          <PageCards
            icon={ShoppingCart}
            title="Total de mensagens enviadas"
            value={valor(cards?.mensagens.value ?? 0)}
            loading={carregando}
            trend={{
              direction: cards?.mensagens.trend.direction ?? "up",
              value: cards?.mensagens.trend.value ?? "0%",
            }}
            footer={[
              { label: "Por WhatsApp", value: cards?.mensagens.whatsapp ?? 0 },
              { label: "Por e-mail", value: cards?.mensagens.email ?? 0 },
            ]}
          />

          <PageCards
            icon={Boxes}
            title="Clientes atingidos no mês atual"
            loading={carregando}
            trend={{
              direction: cards?.clientesAtingidos.trend.direction ?? "up",
              value: cards?.clientesAtingidos.trend.value ?? "0%",
            }}
            value={valor(cards?.clientesAtingidos.value ?? 0)}
            progress={{
              label: "Total de clientes",
              value: cards?.clientesAtingidos.total ?? 0,
            }}
          />

          <PageCards
            icon={Megaphone}
            title="Produtos em campanhas no mês atual"
            loading={carregando}
            value={valor(cards?.produtos.value ?? 0)}
            trend={{
              direction: cards?.produtos.trend.direction ?? "up",
              value: cards?.produtos.trend.value ?? "0%",
            }}
            footer={[
              {
                label: "Produtos aguardando aparecer em campanhas",
                value: cards?.produtos.aguardando ?? 0,
              },
            ]}
          />
        </div>

      {/* TABELA */}
      <CampanhaTable />
    </main>
  );
};

export default Campanhas;
