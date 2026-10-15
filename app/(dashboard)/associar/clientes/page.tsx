"use client";

import ClienteCombobox from "@/components/component/ClienteComboBox";
import InsightCard from "@/components/component/ClientPage/ClientDetailsPage/InsightCard";
import PageHeader from "@/components/component/PageHeader";
import { Button } from "@/components/ui/button";
import { WandSparkles } from "lucide-react";
import { useState } from "react";

const AssociarClientes = () => {
  const [clienteSelecionado, setClienteSelecionado] = useState("");

  return (
    <main>
      <PageHeader
        title="Associar Clientes"
        subtitle="Essa ferramenta irá recomendar potenciais produtos que um cliente da sua loja possa se interessar."
      />

      <div className="mt-8 flex items-stretch gap-6">
       
        {/* Div Escolher cliente + botão */}
        <div className="w-1/2">
          <div className="group relative isolate min-h-54 overflow-hidden rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            
            {/* Detalhe decorativo no canto */}
            <div className="absolute -right-10 -top-10 -z-10 size-28 rounded-full bg-orange-50" />

            {/* Conteúdo */}
            <div className="text-base font-semibold text-black ml-0.5">
              Escolher um cliente
            </div>

            {/* Box do cliente */}
            <div className="mt-2 max-w-md text-sm leading-5 text-muted-foreground">
              <ClienteCombobox
                value={clienteSelecionado}
                onChange={(valor) => setClienteSelecionado(valor)}
              />
            </div>

            <Button className="mt-4 h-10 text-base">
              Analisar
              <WandSparkles className="size-5" />
            </Button>
            
            <div className="text-muted-foreground text-sm mt-5">
                Para melhores resultados é ideal cadastrar e preencher o máximo de características de produtos 
            </div>
          </div>
        </div>

        {/* Div Insight cards: grid 2x2, só é mostrada ao selecionar um cliente */}
        { clienteSelecionado && (
        <div className="w-1/2 grid grid-cols-2 grid-rows-2 gap-4">
          
          
            <InsightCard 
              title="Total gasto"
              icon="payments"
              color="text-green-600 bg-green-100"
              value={20}
              valueType="currency"
            />
          

          
            <InsightCard
              title="Ticket médio"
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

      
    </main>
  );
};

export default AssociarClientes;
