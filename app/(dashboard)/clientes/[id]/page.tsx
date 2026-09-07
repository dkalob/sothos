import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import NameCard from "@/components/component/ClientPage/ClientDetailsPage/NameCard";
import InsightCard from "@/components/component/ClientPage/ClientDetailsPage/InsightCard";
import FormCard from "@/components/component/ClientPage/ClientDetailsPage/FormCard";

interface ClientePageProps {
  params: Promise<{ id: string }>;
}

const ClientePage = async ({ params }: ClientePageProps) => {
  const { id } = await params;

  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/dashboard">Início</Link>} />
          </BreadcrumbItem>
          <BreadcrumbSeparator></BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/clientes">Clientes</Link>} />
          </BreadcrumbItem>
          <BreadcrumbSeparator></BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>Nome do usuário</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* CONTAINER */}
      <div className="mt-4 flex flex-col xl:flex-row gap-8">
        {/* LADO ESQUERDO */}
        <div className="w-full xl:w-1/3 space-y-6">
          {/* NOME + TAG RFM */}
          <NameCard cliente="João" segmento="Campeões" />

          {/* OUTROS DADOS */}
          <FormCard />

          {/* INSIGHTS CALCULADOS */}
          <div className="grid grid-cols-2 gap-3">
            <InsightCard
              title="Total gasto"
              icon="payments"
              color="text-green-600 bg-green-100"
              value={4280}
              valueType="currency"
            />
            <InsightCard
              title="Ticket médio"
              icon="receipt_long"
              color="text-orange-600 bg-orange-100"
              value={237}
              valueType="currency"
            />
            <InsightCard
              title="Pedidos"
              icon="shopping_cart"
              color="text-blue-600 bg-blue-100"
              value={18}
              valueType="number"
            />
            <InsightCard
              title="Última compra"
              icon="calendar_month"
              color="text-purple-600 bg-purple-100"
              date={new Date("2025-05-12")}
            />
          </div>
        </div>
        {/* LADO DIREITO */}
        <div className="w-full xl:w-2/3 space-y-6">
          {/* CAMPANHAS */}
          <div className="bg-primary-foreground p-4 rounded-lg">
            Campanhas que o cliente participou
          </div>
          {/* PRODUTOS */}
          <div className="bg-primary-foreground p-4 rounded-lg">
            Produtos que o cliente já comprou
          </div>
          {/* Pedidos */}
          <div className="bg-primary-foreground p-4 rounded-lg">
            Pedidos do cliente
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientePage;
