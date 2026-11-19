"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "../DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Skeleton } from "@/components/ui/skeleton";
import { ClientTableColumns, GroupTableColumns } from "./columns";
import { Download, Plus } from "lucide-react";
import { apiDownload, apiGet, apiPost } from "@/lib/api";
import { useToken } from "@/hooks/use-token";
import ClientSheet from "./ClientSheet";
import GroupClientSheet from "./GroupClientSheet";
import { toast } from "@/components/ui/toast";
import ImportarClientesSheet from "./ImportarClientesSheet";

interface ClientTableViewProps {
  columnsClient: (
    atualizarClientes: () => Promise<void>,
  ) => ColumnDef<ClientTableColumns>[];
  columnsGroup: (
    atualizarGrupos: () => Promise<void>,
    editarGrupo: (grupoId: string) => void,
  ) => ColumnDef<GroupTableColumns>[];
}

const TabelaSkeleton = () => (
  <div className="w-full overflow-x-auto rounded-md border bg-white mt-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <div
        key={i}
        className="flex min-w-150 items-center gap-4 border-b p-4 last:border-b-0"
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

const ClientTableView = ({
  columnsClient,
  columnsGroup,
}: ClientTableViewProps) => {
  const [aba, setAba] = useState<"clientes" | "grupos">("clientes");
  const [clientesData, setClientesData] = useState<ClientTableColumns[]>([]);
  const [gruposData, setGruposData] = useState<GroupTableColumns[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [clienteSheet, setClienteSheet] = useState(false);
  const [grupoSheet, setGrupoSheet] = useState(false);
  const [grupoSelecionado, setGrupoSelecionado] = useState<string | null>(null);
  const [recalculando, setRecalculando] = useState(false);
  const [importarClienteSheet, setImportarClienteSheet] = useState(false);
  const [exportando, setExportando] = useState(false);

  const token = useToken();

  async function buscarClientes() {
    if (!token) return;
    try {
      const clientes = await apiGet<ClientTableColumns[]>("/clientes", token);
      setClientesData(clientes);
    } catch (erro) {
      console.error("Erro ao buscar clientes:", erro);
    } finally {
      setCarregando(false);
    }
  }

  async function buscarGrupos() {
    if (!token) return;
    try {
      const grupos = await apiGet<GroupTableColumns[]>(
        "/clientes/grupos",
        token,
      );
      setGruposData(grupos);
    } catch (erro) {
      console.error("Erro ao buscar grupos:", erro);
    }
  }

  const atualizarClientes = async () => {
    await buscarClientes();
  };

  const editarGrupo = (grupoId: string) => {
    setGrupoSelecionado(grupoId);
    setGrupoSheet(true);
  };

  useEffect(() => {
    buscarClientes();
    buscarGrupos();
  }, [token]);

  async function recalcularRfm() {
    setRecalculando(true);

    try {
      await apiPost("/rfm/recalcular", {}, token ?? undefined);
      toast.add({ title: "Segmentação RFM recalculada!", type: "success" });
      await buscarClientes(); // a função que você já usa para recarregar a lista
    } catch (erro) {
      toast.add({
        title:
          erro instanceof Error
            ? erro.message
            : "Não foi possível recalcular o RFM",
        type: "error",
      });
    } finally {
      setRecalculando(false);
    }
  }

  if (carregando) {
    return <TabelaSkeleton />;
  }

  
  async function exportarClientes() {
    if (!token) return;

    setExportando(true);

    try {
      await apiDownload(
        "/exportacao/clientes",
        token,
        "clientes.csv",
      );

      toast.add({
        title: "Clientes exportados com sucesso!",
        type: "success",
      });
    } catch (erro) {
      toast.add({
        title:
          erro instanceof Error
            ? erro.message
            : "Não foi possível exportar os clientes",
        type: "error",
      });
    } finally {
      setExportando(false);
    }
  }


  return (
    <div className="mt-8">
      {/* ABAS */}
      <div className="mb-3 flex flex-wrap items-center gap-1 sm:gap-2">
        <Button
          variant="link"
          className={aba === "clientes" ? "text-black" : "text-gray-400"}
          onClick={() => setAba("clientes")}
        >
          Todos os clientes
        </Button>
        <Button
          variant="link"
          className={aba === "grupos" ? "text-black" : "text-gray-400"}
          onClick={() => setAba("grupos")}
        >
          Grupos de clientes
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* TÍTULO + SUBTÍTULO */}
          <div className="flex min-w-0 flex-col px-1 sm:px-0">
            {aba === "clientes" ? (
              <>
                <span className="text-md font-medium">Todos os clientes</span>
                <span className="text-sm text-gray-600">
                  Visualize e administre todos os clientes da sua loja em uma
                  única tela
                </span>
              </>
            ) : (
              <>
                <span className="text-md font-medium">Grupos de clientes</span>
                <span className="text-sm text-gray-600">
                  Crie e gerencie grupos para segmentar os clientes da sua loja
                </span>
              </>
            )}
          </div>

          {/* BOTÕES */}
          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:justify-end">
            <Button
              variant="outline"
              className="w-full min-w-0 truncate sm:w-40"
              onClick={() => {
                if (aba === "clientes") {
                  exportarClientes();
                }
              }}
              disabled={aba !== "clientes" || exportando}
            >
              <Download />
              {aba === "clientes"
                ? exportando
                  ? "Exportando..."
                  : "Exportar Clientes"
                : "Exportar Grupos"}
            </Button>
            <Button
              variant="outline"
              className="w-full min-w-0 truncate sm:w-40"
              onClick={() => {
                if (aba === "clientes") {
                  setImportarClienteSheet(true);
                }
              }}
            >
              <Download className="rotate-180" />
              {aba === "clientes" ? "Importar Clientes" : "Importar Grupos"}
            </Button>

            <Button
              variant="default"
              className="col-span-2 w-full min-w-0 truncate sm:col-span-1 sm:w-32"
              onClick={() =>
                aba === "clientes" ? setClienteSheet(true) : setGrupoSheet(true)
              }
            >
              <Plus />
              {aba === "clientes" ? "Novo cliente" : "Novo Grupo"}
            </Button>

            <ClientSheet
              open={clienteSheet}
              onOpenChange={setClienteSheet}
              onClienteCadastrado={buscarClientes}
            />
            <GroupClientSheet
              open={grupoSheet}
              onOpenChange={(open) => {
                setGrupoSheet(open);

                if (!open) {
                  setGrupoSelecionado(null);
                }
              }}
              grupoId={grupoSelecionado}
              onGrupoCadastrado={buscarGrupos}
            />
            <ImportarClientesSheet
              open={importarClienteSheet}
              onOpenChange={setImportarClienteSheet}
              onClientesImportados={buscarClientes}
            />
          </div>
        </div>

        {aba === "clientes" ? (
          <DataTable
            columns={columnsClient(atualizarClientes)}
            data={clientesData}
            hasRFMFilter
            hasFilter
            filterColumn="cliente"
            filterPlaceholder="Pesquisar cliente por nome"
            onRecalcularRfm={recalcularRfm}
            recalculandoRfm={recalculando}
          />
        ) : (
          <DataTable
            columns={columnsGroup(buscarGrupos, editarGrupo)}
            data={gruposData}
            hasFilter
            hasPagination
            filterColumn="nome"
            filterPlaceholder="Pesquisar grupo por nome"
          />
        )}
      </div>
    </div>
  );
};

export default ClientTableView;
