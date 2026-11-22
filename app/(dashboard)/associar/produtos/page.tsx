
"use client";

import { useEffect, useState } from "react";
import {
  Barcode,
  CalendarDays,
  CreditCard,
  ShoppingBag,
  WandSparkles,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import ProdutoCombobox from "@/components/component/ProdutoComboBox";
import InsightCard from "@/components/component/ClientPage/ClientDetailsPage/InsightCard";
import PageHeader from "@/components/component/PageHeader";
import AssociarProdutoTableView from "@/components/component/AssociarPage/Produto/AssociarProdutoTableView";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import Link from "next/link";
import { useToken } from "@/hooks/use-token";
import { apiGet } from "@/lib/api";

type ProdutoInsights = {
  valorVendido: number;
  categoria: string;
  pedidos: number;
  ultimaCompra: string | null;
};

const CardsSkeleton = () => (
  <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:w-1/2 lg:gap-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <div
        key={i}
        className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="size-10 rounded-lg" />
        </div>

        <Skeleton className="mt-5 h-7 w-32" />
        <Skeleton className="mt-2 h-3 w-20" />
      </div>
    ))}
  </div>
);

const AssociarProdutos = () => {
  const [produtoSelecionado, setProdutoSelecionado] = useState("");
  const [produtoAnalisado, setProdutoAnalisado] = useState("");

  const [produto, setProduto] = useState<ProdutoInsights | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  const token = useToken();

  useEffect(() => {
    if (!token || !produtoSelecionado) {
      setProduto(null);
      return;
    }

    let ativo = true;

    async function buscarProduto() {
      try {
        setCarregando(true);
        setErro("");

        const dados = await apiGet<ProdutoInsights>(
          `/produtos/${produtoSelecionado}/insights`,
          token!,
        );

        if (ativo) {
          setProduto(dados);
        }
      } catch (e) {
        if (ativo) {
          setErro("Não foi possível carregar os dados do produto.");
          setProduto(null);
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    buscarProduto();

    return () => {
      ativo = false;
    };
  }, [produtoSelecionado, token]);

  return (
    <main>
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/ia">IA</Link>} />
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbPage>Associar Produtos</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PageHeader
        title="Associar Produtos"
        subtitle="Essa ferramenta irá recomendar quais clientes podem se interessar pelo produto selecionado."
      />

      <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-stretch">
        {/* Escolher produto */}
        <div className="w-full lg:w-1/2">
          <div className="group relative isolate min-h-54 overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            <div className="absolute -right-10 -top-10 -z-10 size-28 rounded-full bg-orange-50" />

            <div className="ml-0.5 text-base font-semibold text-black">
              Escolher um produto
            </div>

            <div className="mt-2 max-w-md text-sm leading-5 text-muted-foreground">
              <ProdutoCombobox
                value={produtoSelecionado}
                onChange={(valor) => {
                  setProdutoSelecionado(valor);
                  setProdutoAnalisado("");
                }}
                onSelect={(produtoSelecionado) => {
                  setProdutoSelecionado(produtoSelecionado.id);
                  setProdutoAnalisado("");
                }}
              />
            </div>

            <Button
              className="mt-4 h-10 w-full text-base sm:w-auto"
              onClick={() => setProdutoAnalisado(produtoSelecionado)}
              disabled={!produtoSelecionado || carregando}
            >
              Analisar
              <WandSparkles className="size-5" />
            </Button>

            <div className="mt-5 text-sm text-muted-foreground">
              Para melhores resultados é ideal cadastrar e preencher o máximo
              de características de produtos.
            </div>
          </div>
        </div>

        {/* Insights */}
        {produtoSelecionado && (
          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:w-1/2 lg:gap-4">
            {carregando ? (
              <CardsSkeleton />
            ) : erro ? (
              <p className="text-sm text-red-500">{erro}</p>
            ) : produto ? (
              <>
                <InsightCard
                  title="Valor vendido"
                  icon={CreditCard}
                  color="text-green-600 bg-green-100"
                  value={produto.valorVendido}
                  valueType="currency"
                />

                <InsightCard
                  title="Categoria"
                  icon={Barcode}
                  color="text-orange-600 bg-orange-100"
                  text={produto.categoria}
                />

                <InsightCard
                  title="Pedidos"
                  icon={ShoppingBag}
                  color="text-blue-600 bg-blue-100"
                  value={produto.pedidos}
                  valueType="number"
                />

                <InsightCard
                  title="Última compra"
                  icon={CalendarDays}
                  color="text-purple-600 bg-purple-100"
                  date={
                    produto.ultimaCompra
                      ? new Date(produto.ultimaCompra)
                      : undefined
                  }
                />
              </>
            ) : null}
          </div>
        )}
      </div>

      {/* Tabela de recomendações */}
      <AssociarProdutoTableView produtoId={produtoAnalisado} />
    </main>
  );
};

export default AssociarProdutos;
