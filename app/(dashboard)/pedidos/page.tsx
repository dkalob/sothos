import OrderTable from "@/components/component/OrdersPage/OrderTable";
import PageCards from "@/components/component/PageCards";
import PageHeader from "@/components/component/PageHeader";
import { DollarSign, Store, UserRound, ShoppingBasket } from "lucide-react";

const Pedidos = () => {
  return (
    <div>
      <PageHeader
        title="Gerenciamento de Pedidos"
        subtitle="Gerencie sua lista de pedidos e acompanhe o desempenho de sua loja."
        importButton={{ value: "Pedidos" }}
      />

      {/* CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 justify-items-start mt-8 gap-4">
        <PageCards
          icon={Store}
          title="Pedidos Realizados"
          value="20.435"
          trend={{ direction: "up", value: "+12%" }}
          footer={[
            { label: "Novos", value: 2542 },
            { label: "Recorrentes", value: 847 },
          ]}
        />

        <PageCards
          icon={UserRound}
          title="Clientes atingidos"
          value="88%"
          trend={{ direction: "up", value: "+12%" }}
          footer={[
            { label: "Novos", value: 2542 },
            { label: "Recorrentes", value: 847 },
          ]}
        />

        <PageCards
          icon={DollarSign}
          title="Valor arrecadado"
          value="8"
          trend={{ direction: "up", value: "+12%" }}
          footer={[{ label: "Valor a faturar em campanhas", value: 60 }]}
        />

        <PageCards
          icon={ShoppingBasket}
          title="Produtos adquiridos em compras"
          value="20"
          trend={{ direction: "up", value: "+12%" }}
          footer={[{ label: "Valor arrecadado em campanhas", value: 4530 }]}
        />
      </div>

      {/* TABELA */}
      <OrderTable />
    </div>
  );
};

export default Pedidos;
