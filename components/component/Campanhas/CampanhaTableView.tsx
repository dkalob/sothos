"use client";

import { useState, useEffect } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { DataTable } from "../DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, Download, Mail, MessageCircle, Plus } from "lucide-react";
import { apiGet } from "@/lib/api";
import { useToken } from "@/hooks/use-token";
import { CampanhaTableColumns, MensagemTableColumns } from "./columns";
import Link from "next/link";
import CampanhaSheet from "./CampanhaSheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Whatsapp from "@/app/(dashboard)/whatsapp/page";

interface CampanhaTableViewProps {
  columnsCampanha: (
    atualizarCampanhas: () => Promise<void>,
    editarCampanha: (id: string) => void,
  ) => ColumnDef<CampanhaTableColumns>[];
  columnsMensagens: (
    atualizarMensagens: () => Promise<void>,
  ) => ColumnDef<MensagemTableColumns>[];
}

const TabelaSkeleton = () => (
  <div className="overflow-hidden rounded-md border bg-white mt-6">
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

const CampanhaTableView = ({
  columnsCampanha,
  columnsMensagens,
}: CampanhaTableViewProps) => {
  const [aba, setAba] = useState<"campanhas" | "mensagens">("campanhas");
  const [carregando, setCarregando] = useState(true);
  const [campanhaSheet, setCampanhaSheet] = useState(false);
  const [campanhasData, setCampanhasData] = useState<CampanhaTableColumns[]>(
    [],
  );
  const [mensagensData, setMensagensData] = useState<MensagemTableColumns[]>(
    [],
  );
  const [campanhaEditandoId, setCampanhaEditandoId] = useState<string | null>(
    null,
  );

  const token = useToken();

  async function buscarCampanhas() {
    if (!token) return;
    try {
      setCampanhasData(
        await apiGet<CampanhaTableColumns[]>("/campanhas", token),
      );
    } catch (erro) {
      console.error("Erro ao buscar campanhas:", erro);
    }
  }

  async function buscarMensagens() {
    if (!token) return;
    try {
      setMensagensData(
        await apiGet<MensagemTableColumns[]>("/mensagens", token),
      );
    } catch (erro) {
      console.error("Erro ao buscar mensagens:", erro);
    }
  }

  function novaCampanha() {
    setCampanhaEditandoId(null);
    setCampanhaSheet(true);
  }

  function editarCampanha(id: string) {
    setCampanhaEditandoId(id);
    setCampanhaSheet(true);
  }

  useEffect(() => {
    if (!token) return;

    Promise.all([buscarCampanhas(), buscarMensagens()]).finally(() =>
      setCarregando(false),
    );
  }, [token]);

  if (carregando) return <TabelaSkeleton />;

  return (
    <div className="mt-8">
      {/* ABAS */}
      <div className="flex items-center gap-2 mb-2">
        <Button
          variant="link"
          className={aba === "campanhas" ? "text-black" : "text-gray-400"}
          onClick={() => setAba("campanhas")}
        >
          Todas as Campanhas
        </Button>
        <Button
          variant="link"
          className={aba === "mensagens" ? "text-black" : "text-gray-400"}
          onClick={() => setAba("mensagens")}
        >
          Todas as mensagens
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          {/* TÍTULO + SUBTÍTULO */}
          <div className="flex flex-col ml-3">
            {aba === "campanhas" ? (
              <>
                <span className="text-md font-medium">Todos as campanhas</span>
                <span className="text-sm text-gray-600">
                  Visualize e administre todas as campanhas da sua loja em uma
                  única tela.
                </span>
              </>
            ) : (
              <>
                <span className="text-md font-medium">Todas as mensagens</span>
                <span className="text-sm text-gray-600">
                  Visualize e gerencie mensagens criadas pela IA.
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {aba === "campanhas" ? (
              <Button
                className="w-38 truncate justify-end"
                onClick={() => setCampanhaSheet(true)}
              >
                <Plus />
                Nova Campanha
              </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      className={buttonVariants({
                        variant: "default",
                        className: "w-38 truncate justify-end",
                      })}
                    >
                      <Plus /> Nova Mensagem
                    </Button>
                  }
                />
                <DropdownMenuContent className="w-36">
                  <DropdownMenuGroup>
                    <DropdownMenuItem className="focus:bg-secondary focus:text-primary not-data-[variant=destructive]:focus:**:text-primary">
                      <Link
                        href="/email"
                        className="flex w-full items-center gap-2"
                      >
                        <Mail />
                        De Email
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="focus:bg-secondary focus:text-primary not-data-[variant=destructive]:focus:**:text-primary">
                      <Link
                        href="/whatsapp"
                        className="flex w-full items-center gap-2"
                      >
                        <MessageCircle />
                        De Whatsapp
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <CampanhaSheet
              open={campanhaSheet}
              onOpenChange={setCampanhaSheet}
              onCampanhaSalva={buscarCampanhas}
              campanhaId={campanhaEditandoId}
            />
          </div>
        </div>

        {aba === "campanhas" ? (
          <DataTable
            columns={columnsCampanha(buscarCampanhas, editarCampanha)}
            data={campanhasData}
            hasFilter
            filterColumn="titulo"
            filterPlaceholder="Pesquisar campanha por título"
          />
        ) : (
          <DataTable
            columns={columnsMensagens(buscarMensagens)}
            data={mensagensData}
            hasFilter
            hasPagination
            filterColumn="titulo"
            filterPlaceholder="Pesquisar mensagem por título"
          />
        )}
      </div>
    </div>
  );
};

export default CampanhaTableView;
