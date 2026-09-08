import Link from "next/link";
import { apiGet } from "@/lib/api";
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
import { RFMSegmento } from "@/components/component/RFMBadge";

interface ClientePageProps {
  params: Promise<{ id: string }>;
}

type Cliente = {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cpf: string | null;
  cidade: string | null;
  estado: string | null;
  aceitaMarketing: boolean;

  segmento: string;

  totalGasto: number;
  ticketMedio: number;
  quantidadePedidos: number;
  ultimaCompra: string | null;

  campanhas: {
    criadoEm: string;
    campanha: {
      id: string;
      nome: string;
    };
  }[];

  pedidos: {
    id: string;
    valorTotal: number;
    realizadoEm: string;
  }[];
};

const ClientePage = async ({ params }: ClientePageProps) => {
  const { id } = await params;

  const cliente = await apiGet<Cliente>(`/clientes/${id}`);

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
            <BreadcrumbPage>{cliente.nome}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* CONTAINER */}
      <div className="mt-4 flex flex-col xl:flex-row gap-8">
        {/* LADO ESQUERDO */}
        <div className="w-full xl:w-1/3 space-y-6">
          {/* NOME + TAG RFM */}
          <NameCard
            id={cliente.id}
            cliente={cliente.nome}
            segmento={cliente.segmento as RFMSegmento}
          />

          {/* OUTROS DADOS */}
          <FormCard 
            cliente={cliente}/>

          {/* INSIGHTS CALCULADOS */}
          <div className="grid grid-cols-2 gap-3">
            <InsightCard
              title="Total gasto"
              icon="payments"
              color="text-green-600 bg-green-100"
              value={cliente.totalGasto}
              valueType="currency"
            />
            <InsightCard
              title="Ticket médio"
              icon="receipt_long"
              color="text-orange-600 bg-orange-100"
              value={cliente.ticketMedio}
              valueType="currency"
            />
            <InsightCard
              title="Pedidos"
              icon="shopping_cart"
              color="text-blue-600 bg-blue-100"
              value={cliente.quantidadePedidos}
              valueType="number"
            />
            <InsightCard
              title="Última compra"
              icon="calendar_month"
              color="text-purple-600 bg-purple-100"
              date={
                cliente.ultimaCompra
                  ? new Date(cliente.ultimaCompra)
                  : undefined
              }
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
