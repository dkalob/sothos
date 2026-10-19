"use client";

import { useEffect, useState } from "react";

import { DataTable } from "@/components/component/DataTable"; // ajusta o caminho
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { apiGet, apiPost } from "@/lib/api";
import { useToken } from "@/hooks/use-token";
import { ClienteRecomendado, columnsProdutoRecomendacao } from "./columns";
import CriarGrupoSheet from "./CriarGrupoSheet";
import { Button } from "@/components/ui/button";
import { UsersRound } from "lucide-react";

interface AssociarProdutoTableViewProps {
  produtoId: string; // vazio = nada analisado ainda
}

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

const AssociarProdutoTableView = ({
    produtoId,
}: AssociarProdutoTableViewProps) => {

    const [recomendacoes, setRecomendacoes] = useState<ClienteRecomendado[] | null>(null);
    const [carregando, setCarregando] = useState(false);
    const [selecionados, setSelecionados] = useState<string[]>([]);
    const [grupoSheet, setGrupoSheet] = useState(false);
    
    const token = useToken();

    useEffect(() => {

        setSelecionados([]);
        

        if (!produtoId || !token) {
            setRecomendacoes(null)
            setCarregando(false)
            return
        }

        let cancelado = false

        async function buscarRecomendacoes() {
            setCarregando(true)
            
            try {
                const dados = await apiGet<ClienteRecomendado[]>(
                    `/recomendacoes/produto/${produtoId}`,
                    token ?? undefined,
                )

                if (!cancelado) setRecomendacoes(dados)
            } catch (error) {
                if (!cancelado) {
                    setRecomendacoes(null)
                    toast.add({
                        title: "Não foi possível gerar as recomendações",
                        type: "error",
                    });
                }
            } finally {
                if (!cancelado) setCarregando(false)
            }
        }

        buscarRecomendacoes()

        return () => {
            cancelado = true
        }
    }, [produtoId, token])

    if (!produtoId) return null

    const lista = recomendacoes ?? [];
    const todosMarcados = lista.length > 0 && selecionados.length === lista.length

    // Marca ou desmarca um cliente
  function alternarCliente(id: string) {
    setSelecionados((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  // Marca todos, ou desmarca todos se já estiverem marcados
  function alternarTodos() {
    setSelecionados(todosMarcados ? [] : lista.map((c) => c.id));
  }

  async function criarGrupo(nome:string) {
    try {
      await apiPost(
        "/clientes/grupos",
        { nome, clientesIds: selecionados},
        token ?? undefined
      )
      toast.add({
        title: "Grupo criado com sucesso!",
        type: "sucess"
      })
    } catch (error) {
      console.error("Erro ao criar grupo:", error);
      toast.add({
        title: "Não foi possível criar o grupo.",
        type: "error"
      })
    }
    
  }

    return (
        <div className="mt-8">
            <div className="flex justify-between items-center">
              <div className="mb-2">
                <h2 className="text-base font-semibold">Clientes recomendados</h2>
                <span className="text-sm text-muted-foreground">
                  Selecione os clientes e clique em "Criar grupo" para criar um grupo com os clientes selecionados.
                </span>
              </div>

              { selecionados.length === 0 && (
              <Button
                variant="outline"
                onClick={() => setGrupoSheet(true)}
                disabled={selecionados.length === 0}
              >
                <UsersRound />
                Criar grupo
              </Button>
              )}

              { selecionados.length === 1 && (
              <Button
                variant="outline"
                onClick={() => setGrupoSheet(true)}
    
              >
                <UsersRound />
                Criar grupo com {selecionados.length > 0 && `${selecionados.length}`} cliente
              </Button>
              )}

              { selecionados.length > 1 && (
              <Button
                variant="outline"
                onClick={() => setGrupoSheet(true)}
    
              >
                <UsersRound />
                Criar grupo com {selecionados.length > 0 && `${selecionados.length}`} clientes
              </Button>
              )}


            </div>
            
        
            {carregando && <TabelaSkeleton />}
        
            {!carregando && recomendacoes && recomendacoes.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Este cliente ainda não tem compras registradas, então não há base para
                recomendar produtos.
              </p>
            )}
        
            {!carregando && recomendacoes && recomendacoes.length > 0 && (
              <DataTable
                columns={columnsProdutoRecomendacao(
                  selecionados,
                  alternarCliente,
                  alternarTodos,
                  todosMarcados,
                )}
                data={recomendacoes}
                hasPagination={false}
              />
            )}

            <CriarGrupoSheet
              open={grupoSheet}
              onOpenChange={setGrupoSheet}
              quantidade={selecionados.length}
              onConfirmar={criarGrupo}
            />

        </div>
    )
}

export default AssociarProdutoTableView