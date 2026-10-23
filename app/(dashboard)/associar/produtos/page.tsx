"use client";

import AssociarProdutoTableView from "@/components/component/AssociarPage/Produto/AssociarProdutoTableView";
import InsightCard from "@/components/component/ClientPage/ClientDetailsPage/InsightCard";
import PageHeader from "@/components/component/PageHeader";
import ProdutoCombobox, {
  Produto,
} from "@/components/component/ProdutoComboBox";
import { Button } from "@/components/ui/button";
import { WandSparkles } from "lucide-react";
import { useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";

const AssociarProdutos = () => {
  const [produtoSelecionado, setProdutoSelecionado] = useState("");
  const [produtoAnalisado, setProdutoAnalisado] = useState("");
  const [produto, setProduto] = useState<Produto | null>(null);
  
  return (
    <main>

      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/ia">IA</Link>} />
          </BreadcrumbItem>
          <BreadcrumbSeparator></BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>Associar Produtos</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>


      <PageHeader
        title="Associar Produtos"
        subtitle="Essa ferramenta irá recomendar quais clientes podem se interessar pelo produto selecionado"
      />

      <div className="flex items-stretch gap-6 mt-8">
        {/* Escolher cliente + botão */}
        <div className="w-1/2">
          <div className="group relative isolate min-h-54 overflow-hidden rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="absolute -right-10 -top-10 -z-10 size-28 rounded-full bg-orange-50" />

            <div className="ml-0.5 text-base font-semibold text-black">
              Escolher um produto
            </div>

            <div className="mt-2 max-w-md text-sm leading-5 text-muted-foreground">
              <ProdutoCombobox
                value={produtoSelecionado}
                onChange={(valor) => {
                  setProdutoSelecionado(valor);
                  setProdutoAnalisado(""); // limpa a tabela do produto anterior
                }}
                onSelect={(produtoSelecionado) => {
                  setProduto(produtoSelecionado);
                  setProdutoSelecionado(produtoSelecionado.id);
                  setProdutoAnalisado("");
                }}
              />
            </div>

            <Button
              className="mt-4 h-10 text-base"
              onClick={() => setProdutoAnalisado(produtoSelecionado)}
              disabled={!produtoSelecionado}
            >
              Analisar
              <WandSparkles className="size-5" />
            </Button>

            <div className="mt-5 text-sm text-muted-foreground">
              Para melhores resultados é ideal cadastrar e preencher o máximo de
              características de produtos
            </div>
          </div>
        </div>

        {/* Insights */}
        {produto && (
          <div className="grid w-1/2 grid-cols-2 grid-rows-2 gap-4">
            <InsightCard
              title="Valor vendido"
              icon="payments"
              color="text-green-600 bg-green-100"
              value={20}
              valueType="currency"
            />
            <InsightCard
              title="Categoria"
              icon="receipt_long"
              color="text-orange-600 bg-orange-100"
              value={40}
              valueType="currency"
            />
            <InsightCard
              title="Pedidos"
              icon="shopping_cart"
              color="text-blue-600 bg-blue-100"
              value={40}
              valueType="number"
            />
            <InsightCard
              title="Última compra"
              icon="calendar_month"
              color="text-purple-600 bg-purple-100"
              date={new Date()}
            />
          </div>
        )}
      </div>

      {/* Tabela de recomendações */}
      <AssociarProdutoTableView
        produtoId={produtoAnalisado}
      />
      
    </main>
  );
};

export default AssociarProdutos;
