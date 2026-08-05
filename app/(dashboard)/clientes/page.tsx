import ClientTable from "@/components/component/ClientTable/ClientTable";
import PageCards from "@/components/component/PageCards";
import PageHeader from "@/components/component/PageHeader";
import { Megaphone, Users, UsersRound, UserStar } from "lucide-react";

const Clientes = () => {
  return (
    <div>
    <PageHeader
      title="Gerenciamento de Clientes"
      subtitle="Gerencie seu portifólio de clientes e acompanhe o crescimento."
      button={{ value: "Clientes" }}
    />

    {/* CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 justify-items-start mt-8 gap-4">
        <PageCards
          icon={Users}
          title="Clientes totais"
          value="20.435"
          trend={{ direction: "up", value: "+12%" }}
          footer={[
            { label: "Novos", value: 2542 },
            { label: "Recorrentes", value: 847 },
          ]}
        />
      
        <PageCards
          icon={UserStar}
          title="Taxa de retenção"
          value="88%"
          trend={{ direction: "up", value: "+12%" }}
          footer={[
            { label: "Clientes que voltaram a comprar", value: 10 },
          ]}
        />

        <PageCards
          icon={UsersRound}
          title="Quantidade de grupos"
          value="8"
          trend={{ direction: "up", value: "+12%" }}
          footer={[
            { label: "Porcentagem de clientes em grupos", value: 60 },
          ]}
        />

        <PageCards
          icon={Megaphone}
          title="Campanhas Ativas"
          value="20"
          trend={{ direction: "up", value: "+12%" }}
          footer={[
            { label: "Quantidade de clientes impactados", value: 4530 },
          ]}
        />
      
      </div>

      {/* TABELA */}
      <ClientTable/>

    </div>
  );
};

export default Clientes;
