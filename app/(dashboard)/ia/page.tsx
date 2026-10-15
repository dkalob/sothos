"use client";

import PageHeader from "@/components/component/PageHeader";
import {
  ArrowRight,
  Mail,
  MessageSquareText,
  Users,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";

const cards = [
  {
    label: "Criar Email",
    descricao:
      "Crie um email marketing com inteligência artificial",
    btnLabel: "Começar agora",
    url: "/email",
    icon: Mail,
    cor: "violet",
  },
  {
    label: "Criar Whatsapp",
    descricao:
      "Crie uma mensagem para o Whatsapp com inteligência artificial",
    btnLabel: "Começar agora",
    url: "/whatsapp",
    icon: MessageSquareText,
    cor: "teal",
  },
  {
    label: "Associar Clientes",
    descricao:
      "Descubra quais produtos seus clientes podem gostar",
    btnLabel: "Analisar grupos",
    url: "/associar/clientes",
    icon: Users,
    cor: "orange",
  },
  {
    label: "Associar Produtos",
    descricao:
      "Descubra quais clientes podem gostar de um produto",
    btnLabel: "Explorar produtos",
    url: "/associar/produtos",
    icon: ShoppingBag,
    cor: "blue",
  },
];

const estilos = {
  violet: {
    icon: "bg-violet-100 text-violet-600",
    detalhe: "bg-violet-50",
  },
  teal: {
    icon: "bg-teal-100 text-teal-700",
    detalhe: "bg-teal-50",
  },
  orange: {
    icon: "bg-orange-100 text-orange-700",
    detalhe: "bg-orange-50",
  },
  blue: {
    icon: "bg-blue-100 text-blue-700",
    detalhe: "bg-blue-50",
  },
};

const IA = () => {
  return (
    <main>
      <PageHeader
        title="Inteligência Artificial"
        subtitle="Aumente sua produtividade e melhore seus resultados com nossas ferramentas de IA integradas."
      />

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        
        {cards.map((card) => {
          const Icon = card.icon;
          const estilo = estilos[card.cor as keyof typeof estilos];

          return (
            <div
              key={card.url}
              className="group relative isolate min-h-53 overflow-hidden rounded-xl border border-slate-200 bg-white p-16 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              {/* Detalhe decorativo no canto */}
              <div
                className={`absolute -right-10 -top-10 -z-10 size-28 rounded-full ${estilo.detalhe}`}
              />

              {/* Ícone */}
              <div
                className={`mb-4 flex size-10 items-center justify-center rounded-md ${estilo.icon}`}
              >
                <Icon size={20} strokeWidth={2} />
              </div>

              {/* Conteúdo */}
              <h2 className="text-base font-semibold text-black">
                {card.label}
              </h2>

              <p className="mt-1 max-w-md text-sm leading-5 text-muted-foreground">
                {card.descricao}
              </p>

              {/* Link de ação */}
              <Link
                href={card.url}
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-800"
              >
                {card.btnLabel}

                <ArrowRight
                  size={16}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </Link>
            </div>
          );
        })}
      </div>
    </main>
  );
};

export default IA;