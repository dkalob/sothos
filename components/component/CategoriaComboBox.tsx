"use client";

import { useEffect, useState } from "react";
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { apiGet } from "@/lib/api";
import { useToken } from "@/hooks/use-token";
import { toast } from "@/components/ui/toast";
import Link from "next/link";

export type Categoria = {
  id: string;
  nome: string;
};

interface CategoriaComboboxProps {
  onSelect: (categoria: Categoria) => void;
}

const CategoriaCombobox = ({ onSelect }: CategoriaComboboxProps) => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [inputValue, setInputValue] = useState("");

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

  const categoriasFiltradas = categorias.filter((categoria) => {
    const busca = inputValue.toLowerCase().trim();

    return categoria.nome.toLowerCase().includes(busca);
  });

  const nenhumaCategoriaEncontrada = categoriasFiltradas.length === 0;

  return (
    <Combobox
      items={categorias}
      onValueChange={(value) => {
        const categoriaSelecionada = categorias.find(
          (categoria) => categoria.nome === value,
        );

        if (!categoriaSelecionada) return;

        onSelect(categoriaSelecionada);
        setInputValue("");
      }}
      filter={null}
    >
      <ComboboxInput
        placeholder={
          carregando ? "Carregando categorias..." : "Selecione a categoria"
        }
        onChange={(event) => setInputValue(event.target.value)}
      />

      <ComboboxContent>
        <ComboboxList>
          {carregando ? (
            <div className="px-3 py-2 text-center text-sm text-muted-foreground">
              Carregando categorias...
            </div>
          ) : nenhumaCategoriaEncontrada ? (
            <ComboboxItem
              className="text-sm text-muted-foreground hover:bg-secondary hover:text-primary"
              render={
                <Link href="/configuracoes">
                  <span>Nenhuma categoria encontrada.</span>
                </Link>
              }
            />
          ) : (
            <>
              {categoriasFiltradas.map((categoria) => (
                <ComboboxItem key={categoria.id} value={categoria.nome}>
                  {categoria.nome}
                </ComboboxItem>
              ))}

              <ComboboxItem
                className="cursor-pointer text-sm text-muted-foreground hover:bg-secondary hover:text-primary"
                render={
                  <Link href="/configuracoes">
                    <span>+ adicionar categoria</span>
                  </Link>
                }
              />
            </>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
};

export default CategoriaCombobox;
