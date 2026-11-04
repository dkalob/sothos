"use client";

import { useEffect, useState } from "react";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { apiGet } from "@/lib/api";
import { useToken } from "@/hooks/use-token";
import { toast } from "@/components/ui/toast";

type GrupoCliente = {
  id: string;
  nome: string;
};

interface GrupoClienteComboboxProps {
  value: string;
  onChange: (value: string) => void;
  onNomeChange: (nome: string) => void;
}

const GrupoClienteCombobox = ({
  value,
  onChange,
  onNomeChange,
}: GrupoClienteComboboxProps) => {
  const [grupos, setGrupos] = useState<GrupoCliente[]>([]);
  const [carregando, setCarregando] = useState(true);

  const token = useToken();

  useEffect(() => {
    if (!token) return;

    async function buscarGruposClientes() {
      try {
        const dados = await apiGet<GrupoCliente[]>(
          "/clientes/grupos/combobox",
          token ?? undefined,
        );

        setGrupos(dados);
      } catch (error) {
        console.error("Erro ao buscar grupos de clientes:", error);
        toast.add({
          title: "Não foi possível carregar os grupos clientes",
          type: "error",
        });
      } finally {
        setCarregando(false);
      }
    }

    buscarGruposClientes();
  }, [token]);

  return (
    <Combobox
      items={grupos}
      value={value}
      onValueChange={(value) => {
        const id = (value as string) ?? "";
        onChange(id);

        const grupo = grupos.find((grupo) => grupo.id === id);
        onNomeChange(grupo?.nome ?? "");
      }}
    >
      <ComboboxInput
        placeholder="Selecione o grupo"
        value={grupos.find((grupo) => grupo.id === value)?.nome ?? ""}
      />

      <ComboboxContent>
        <ComboboxEmpty>Nenhum grupo encontrado.</ComboboxEmpty>

        <ComboboxList>
          {grupos.map((grupo) => (
            <ComboboxItem key={grupo.id} value={grupo.id}>
              <span className="font-semibold">{grupo.nome}</span>
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
};

export default GrupoClienteCombobox;
