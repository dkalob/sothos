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

export type Categoria = {
  id: string;
  nome: string;
};

interface CategoriaComboboxProps {
  value: string;
  onChange: (value: string) => void;
}

const CategoriaCombobox = ({
  value,
  onChange,
}: CategoriaComboboxProps) => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [carregando, setCarregando] = useState(true);
  const token = useToken();

  useEffect(() => {
    if (!token) return;

    async function buscarCategorias() {
      try {
        const dados = await apiGet<Categoria[]>(
          "/categorias",
          token ?? undefined,
        );

        setCategorias(dados);
      } catch (error) {
        toast.add({
          title: "Não foi possível carregar as categorias",
          type: "error",
        });
      } finally {
        setCarregando(false);
      }
    }

    buscarCategorias();
  }, [token]);

  return (
    <Combobox
      items={categorias}
      value={value}
      onValueChange={(value) => onChange((value as string) ?? "")}
    >
      <ComboboxInput placeholder="Selecione a categoria" />

      <ComboboxContent>
        <ComboboxEmpty>
          {carregando
            ? "Carregando categorias..."
            : "Nenhuma categoria encontrada."}
        </ComboboxEmpty>

        <ComboboxList>
          {categorias.map((categoria) => (
            <ComboboxItem
              key={categoria.id}
              value={categoria.id}
            >
              {categoria.nome}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
};

export default CategoriaCombobox;
