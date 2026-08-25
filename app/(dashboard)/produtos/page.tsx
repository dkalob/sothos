import PageCards from "@/components/component/PageCards";
import PageHeader from "@/components/component/PageHeader";
import ProductTable from "@/components/component/ProductsPage/ProductTable";
import { Boxes, Megaphone, PackageSearch, ShoppingCart } from "lucide-react";

const Produtos = () => {
  return (
    <div>

      <PageHeader
        title="Gerenciamento de Produtos"
        subtitle="Gerencie seu inventário de produtos e acompanhe seu desempenho em campanhas."
        importButton={{ value: "Produtos" }}
      />

    {/* CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 justify-items-start mt-8 gap-4">
        <PageCards
          icon={PackageSearch}
          title="Produtos cadastrados"
          value="20.435"
          trend={{ direction: "up", value: "+12%" }}
          footer={[
            { label: "Novos", value: 2542 },
            { label: "Recorrentes", value: 847 },
          ]}
        />
      
        <PageCards
          icon={ShoppingCart}
          title="Produtos sem venda"
          value="88%"
          trend={{ direction: "up", value: "+12%" }}
          footer={[
            { label: "Produtos que ainda não tiveram vendas no período", value: 10 },
          ]}
        />

        <PageCards
          icon={Boxes}
          title="Estoque"
          value="8"
          trend={{ direction: "up", value: "+12%" }}
          footer={[
            { label: "Valor a faturar em campanhas", value: 60 },
          ]}
        />

        <PageCards
          icon={Megaphone}
          title="Campanhas vinculadas a produtos"
          value="20"
          trend={{ direction: "up", value: "+12%" }}
          footer={[
            { label: "Valor arrecadado em campanhas", value: 4530 },
          ]}
        />
      
      </div>

      {/* TABELA */}
      <ProductTable/>




    </div>
      
  );
};

export default Produtos;
