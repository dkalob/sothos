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

export type Produto = {
  id: string;
  nome: string;
  sku: string | null;
  imagem: string | null;
  precoAtual: string;
};

interface ProdutoComboboxProps {
  onSelect: (produto: Produto) => void;
}

const ProdutoCombobox = ({ onSelect }: ProdutoComboboxProps) => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [inputValue, setInputValue] = useState("");

  const token = useToken();

  useEffect(() => {
    if (!token) return;

    async function buscarProdutos() {
      try {
        const dados = await apiGet<Produto[]>(
          "/produtos/combobox",
          token ?? undefined,
        );

        setProdutos(dados);
      } catch (error) {
        toast.add({
          title: "Não foi possível carregar os produtos",
          type: "error",
        });
      } finally {
        setCarregando(false);
      }
    }

    buscarProdutos();
  }, [token]);

  const produtosFiltrados = produtos.filter((produto) => {
    const busca = inputValue.toLowerCase();

    return (
      produto.nome.toLowerCase().includes(busca) ||
      produto.sku?.toLowerCase().includes(busca)
    );
  });

  return (
    <Combobox
      items={produtos}
      onValueChange={(value) => {
        const produtoSelecionado = produtos.find(
          (produto) => produto.nome === value,
        );

        if (!produtoSelecionado) return;

        onSelect(produtoSelecionado);

        setInputValue("");
      }}
      filter={null}
    >
      <ComboboxInput
        placeholder={
          carregando ? "Carregando produtos..." : "Selecione o produto"
        }
        onChange={(event) => setInputValue(event.target.value)}
      />

      <ComboboxContent>
        <ComboboxEmpty>
          {carregando ? "Carregando produtos..." : "Nenhum produto encontrado."}
        </ComboboxEmpty>

        <ComboboxList>
          {produtosFiltrados.map((produto) => (
            <ComboboxItem key={produto.id} value={produto.nome}>
              <div className="flex items-center gap-3">
                {produto.imagem ? (
                  <img
                    src={produto.imagem}
                    alt={produto.nome}
                    className="h-10 w-10 rounded-md object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-md bg-muted" />
                )}

                <div className="flex flex-col">
                  <span className="font-semibold">{produto.nome}</span>

                  <span className="text-sm text-muted-foreground">
                    SKU: {produto.sku ?? "Sem SKU"}
                  </span>
                </div>
              </div>
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
};

export default ProdutoCombobox;
