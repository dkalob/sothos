import { DatePickerWithRange } from "@/components/component/DateCalendarFilter";
import PeriodSelector from "@/components/component/PeriodSelector";
import { Ad, HandCoins, Users, Wallet } from "lucide-react";
import DownloadReportButton from "@/components/component/DownloadReportButton";
import DashboardChart from "@/components/component/DashboardPage/DashboardChart";
import PageCards from "@/components/component/PageCards";
import DashboardTable from "@/components/component/DashboardPage/DashboardTable/page";
import PageHeader from "@/components/component/PageHeader";

const Dashboard = () => {
  return (
    <div>
      {/* TÍTULO + BOTÕES */}
      <div className="flex justify-between items-center">
        <PageHeader
          title="Indicadores de Performance"
          subtitle="Acompanhe em tempo real o rendimento de suas campanhas"
        />

        <div className="flex gap-6">
          <PeriodSelector />
          <DatePickerWithRange />
          <DownloadReportButton />
        </div>
      </div>

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
          icon={Wallet}
          title="Lucro Total"
          value="R$1.24M"
          trend={{ direction: "up", value: "+12%" }}
          progress={{ label: "Meta Atingida", value: 76 }}
        />

        <PageCards
          icon={Ad}
          title="Campanhas em andamento"
          value={6}
          trend={{ direction: "down", value: "-12%" }}
          footer={[{ label: "Clientes atingidos", value: 847 }]}
        />

        <PageCards
          icon={HandCoins}
          title="Saldo de créditos"
          value="1.230"
          trend={{ direction: "down", value: "-15%" }}
          footer={[{ label: "Consumo", value: 42 }]}
        />
      </div>

      {/* GRÁFICO */}
      <DashboardChart />

      {/* TABELA */}
      <DashboardTable />
    </div>
  );
};

export default Dashboard;
