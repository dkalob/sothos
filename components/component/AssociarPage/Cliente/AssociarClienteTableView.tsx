"use client";

import { useEffect, useState } from "react";

import { DataTable } from "@/components/component/DataTable"; // ajusta o caminho
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { apiGet } from "@/lib/api";
import { useToken } from "@/hooks/use-token";
import { columnsRecomendacao, type ProdutoRecomendado } from "./columns";
import { TriangleAlert } from "lucide-react";

interface AssociarClienteTableViewProps {
  clienteId: string; // vazio = nada analisado ainda
}

// Imita o formato da tabela enquanto os dados carregam
const TabelaSkeleton = () => (
  <div className="overflow-hidden rounded-md border bg-white">
    {Array.from({ length: 4 }).map((_, i) => (
      <div
        key={i}
        className="flex items-center gap-4 border-b p-4 last:border-b-0"
      >
        <Skeleton className="size-10 rounded-md" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
      </div>
    ))}
  </div>
);

const AssociarClienteTableView = ({
  clienteId,
}: AssociarClienteTableViewProps) => {
  const [recomendacoes, setRecomendacoes] = useState<ProdutoRecomendado[] | null>(null);
  const [carregando, setCarregando] = useState(false);

  const token = useToken();

  useEffect(() => {
    // Sem cliente analisado: limpa tudo e sai
    if (!clienteId || !token) {
      setRecomendacoes(null);
      setCarregando(false);
      return;
    }

    let cancelado = false;

    async function buscarRecomendacoes() {
      setCarregando(true);

      try {
        const dados = await apiGet<ProdutoRecomendado[]>(
          `/recomendacoes/cliente/${clienteId}`,
          token ?? undefined,
        );

        if (!cancelado) setRecomendacoes(dados);
      } catch (error) {
        if (!cancelado) {
          setRecomendacoes(null);
          toast.add({
            title: "Não foi possível gerar as recomendações",
            type: "error",
          });
        }
      } finally {
        if (!cancelado) setCarregando(false);
      }
    }

    buscarRecomendacoes();

    // Se o cliente mudar no meio da busca, ignora a resposta antiga
    return () => {
      cancelado = true;
    };
  }, [clienteId, token]);

  if (!clienteId) return null;

  // Nomes de característica que aparecem nos resultados, sem repetir
  const nomesCaracteristicas = Array.from(
    new Set((recomendacoes ?? []).flatMap((p) => Object.keys(p.caracteristicas))),
  );

  return (
    <div className="mt-8">
      <h2 className="mb-2 text-base font-semibold">Produtos recomendados</h2>

      {carregando && <TabelaSkeleton />}

      {!carregando && recomendacoes && recomendacoes.length === 0 && (
        <div className="flex items-center gap-1 justify-center h-100">
                <TriangleAlert size={18} className="text-primary font-semibold"/>
                <p className="text-sm text-muted-foreground font-semibold">
                Este cliente não possui vendas, então não há base para recomendar produtos.
                </p>
              </div>
      )}

      {!carregando && recomendacoes && recomendacoes.length > 0 && (
        <DataTable
          columns={columnsRecomendacao(nomesCaracteristicas)}
          data={recomendacoes}
          hasPagination={false}
        />
      )}
    </div>
  );
};

export default AssociarClienteTableView;