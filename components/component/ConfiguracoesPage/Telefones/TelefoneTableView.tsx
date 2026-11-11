"use client";

import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/component/DataTable";
import { apiGet } from "@/lib/api";
import { useToken } from "@/hooks/use-token";
import TelefoneSheet from "./TelefoneSheet";
import type { Telefone } from "./columns";

interface TelefoneTableViewProps {
  columnsTelefone: (
    atualizarTelefones: () => Promise<void>,
    editarTelefone: (telefone: Telefone) => void,
  ) => ColumnDef<Telefone>[];
}

const TabelaSkeleton = () => (
  <div className="overflow-hidden rounded-md border bg-white">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 border-b p-4 last:border-b-0">
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-20" />
      </div>
    ))}
  </div>
);

const TelefoneTableView = ({ columnsTelefone }: TelefoneTableViewProps) => {
  const [telefones, setTelefones] = useState<Telefone[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [sheetAberto, setSheetAberto] = useState(false);
  const [telefoneEditando, setTelefoneEditando] = useState<Telefone | null>(null);

  const token = useToken();

  async function buscarTelefones() {
    if (!token) return;

    try {
      setTelefones(await apiGet<Telefone[]>("/telefones", token));
    } catch (erro) {
      console.error("Erro ao buscar telefones:", erro);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    buscarTelefones();
  }, [token]);

  function novoTelefone() {
    setTelefoneEditando(null);
    setSheetAberto(true);
  }

  function editarTelefone(telefone: Telefone) {
    setTelefoneEditando(telefone);
    setSheetAberto(true);
  }

  if (carregando) return <TabelaSkeleton />;

  return (
    <div className="mt-8 mx-auto w-full max-w-[50vw]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col">
          <span className="font-bold text-2xl">Telefones de Disparo</span>
          <span className="text-sm text-gray-600">
            Cadastre e gerencie os telefones da sua loja.
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button className="min-w-45" variant="default" onClick={novoTelefone}>
            <Plus />
            Novo telefone
          </Button>

        <TelefoneSheet
          open={sheetAberto}
          onOpenChange={setSheetAberto}
          telefone={telefoneEditando}
          onTelefoneSalvo={buscarTelefones}
        />
        </div>
      </div>

      <DataTable
        columns={columnsTelefone(buscarTelefones, editarTelefone)}
        data={telefones}
        filterColumn="nome"
        filterPlaceholder="Pesquisar telefone por nome"
      />
    </div>
  );
};

export default TelefoneTableView;