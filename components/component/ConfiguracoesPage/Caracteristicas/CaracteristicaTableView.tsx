"use client";

import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable } from "../../DataTable";

import { apiGet } from "@/lib/api";
import { useToken } from "@/hooks/use-token";
import { toast } from "@/components/ui/toast";
import { Caracteristica } from "./CaracteristicaSchema";
import CaracteristicaSheet from "./CaracteristicaSheet";


interface CaracteristicaTableViewProps {
  columnsCaracteristica: (
    atualizarCaracteristicas: () => Promise<void>,
    onEditar: (caracteristica: Caracteristica) => void,
  ) => ColumnDef<Caracteristica>[];
}

const CaracteristicaTableView = ({ columnsCaracteristica }: CaracteristicaTableViewProps) => {
  const [caracteristicasData, setCaracteristicasData] = useState<Caracteristica[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [caracteristicaSheet, setCaracteristicaSheet] = useState(false);
  const [caracteristicaEditando, setCaracteristicaEditando] = useState<Caracteristica | null>(null); 

  const token = useToken();

  async function buscarCaracteristicas() {
    if (!token) return;

    try {
      const caracteristicas = await apiGet<Caracteristica[]>("/caracteristicas-produto", token);
      setCaracteristicasData(caracteristicas);
    } catch (error) {
      console.error("Erro ao buscar caracteristicas:", error);
      toast.add({ title: "Não foi possível carregar as caracteristicas", type: "error" });
    } finally {
      setCarregando(false);
    }
  }

  const atualizarCaracteristicas = async () => {
    await buscarCaracteristicas();
  };

  useEffect(() => {
    buscarCaracteristicas();
  }, [token]);

  //abre o Sheet já em modo edição (carregado)
  function abrirEdicao(caracteristica: Caracteristica) {
    setCaracteristicaEditando(caracteristica);
    setCaracteristicaSheet(true);
  }

  //abre o Sheet em modo criação (limpo)
  function abrirCriacao() {
    setCaracteristicaEditando(null);
    setCaracteristicaSheet(true);
  }

  if (carregando) {
    return <div className="mt-8">Carregando...</div>;
  }

  return (
    <div className="mt-8 mx-auto w-full max-w-[50vw]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col">
          <span className="font-bold text-2xl">Caracteristicas de Produtos</span>
          <span className="text-sm text-gray-600">
            Crie e gerencie as caracteristicas dos produtos da sua loja.
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button className="min-w-45" variant="default" onClick={abrirCriacao}>
            <Plus />
            Nova caracteristica
          </Button>

          <CaracteristicaSheet
            open={caracteristicaSheet}
            onOpenChange={setCaracteristicaSheet}
            onCaracteristicaCadastrada={atualizarCaracteristicas}
            caracteristicaEditando={caracteristicaEditando}
          />
        </div>
      </div>

      <DataTable
        columns={columnsCaracteristica(atualizarCaracteristicas, abrirEdicao)}
        data={caracteristicasData}
      />
    </div>
  );
};

export default CaracteristicaTableView;