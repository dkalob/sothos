"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import { useToken } from "@/hooks/use-token";
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
import { CalendarDays, CreditCard, Receipt, ShoppingBag, ShoppingCart } from "lucide-react";
import CampanhaList from "./HistoricoCards/CampanhaCard";
import ProdutoList from "./HistoricoCards/ProdutoCard";
import PedidoList from "./HistoricoCards/PedidoCard";

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
};

type HistoricoCliente = {
  produtos: {
    id: string;
    nome: string;
    categoria: string;
    foto: string | null;
  }[];

  pedidos: {
    id: string;
    valorTotal: number;
    realizadoEm: string;
    status: string;
  }[];

  campanhas: {
    criadoEm: string;
    status: string;
    campanha: {
      id: string;
      nome: string;
    };
  }[];
};

interface ClienteDetalheProps {
  id: string;
}

const ClienteDetalhe = ({ id }: ClienteDetalheProps) => {
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [historico, setHistorico] = useState<HistoricoCliente | null>(null);

  const token = useToken();

  useEffect(() => {
  
  if (!token) return;

  async function buscarCliente() {
    try {
      const dados = await apiGet<Cliente>(`/clientes/${id}`, token!);
      setCliente(dados);
    } catch (e) {
      setErro("Não foi possível carregar o cliente.");
    } finally {
      setCarregando(false);
    }
  }

  async function buscarHistorico() {
    try {
      const dados = await apiGet<HistoricoCliente>(
        `/clientes/${id}/historico`,
        token!
      );

      setHistorico(dados);
    } catch (e) {
      console.error("Erro ao carregar histórico:", e);
    }
  }

  buscarCliente();
  buscarHistorico();

}, [id, token]);

  if (carregando) {
    return <div className="mt-4">Carregando...</div>;
  }

  if (erro || !cliente) {
    return (
      <div className="mt-4 text-destructive">
        {erro ?? "Cliente não encontrado."}
      </div>
    );
  }

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

      <div className="mt-4 flex flex-col xl:flex-row gap-8">
        <div className="w-full xl:w-1/3 space-y-6">
          <NameCard
            id={cliente.id}
            cliente={cliente.nome}
            segmento={cliente.segmento as RFMSegmento}
          />

          <FormCard cliente={cliente} />

          <div className="grid grid-cols-2 gap-3">
            <InsightCard
              title="Total gasto"
              icon={CreditCard}
              color="text-green-600 bg-green-100"
              value={cliente.totalGasto}
              valueType="currency"
            />
            <InsightCard
              title="Ticket médio"
              icon={Receipt}
              color="text-orange-600 bg-orange-100"
              value={cliente.ticketMedio}
              valueType="currency"
            />
            <InsightCard
              title="Pedidos"
              icon={ShoppingBag}
              color="text-blue-600 bg-blue-100"
              value={cliente.quantidadePedidos}
              valueType="number"
            />
            <InsightCard
              title="Última compra"
              icon={CalendarDays}
              color="text-purple-600 bg-purple-100"
              date={
                cliente.ultimaCompra
                  ? new Date(cliente.ultimaCompra)
                  : undefined
              }
            />
          </div>
        </div>

        <div className="w-full xl:w-2/3 space-y-6">
          <CampanhaList campanhas={historico?.campanhas ?? []} />

          <ProdutoList produtos={historico?.produtos ?? []} />

          <PedidoList pedidos={historico?.pedidos ?? []} />
        </div>
      </div>
    </div>
  );
};

export default ClienteDetalhe;
