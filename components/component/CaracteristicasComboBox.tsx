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
import { Caracteristica } from "./ConfiguracoesPage/Caracteristicas/CaracteristicaSchema";

interface CaracteristicaComboBoxProps {
    onSelect: (caracteristica: Caracteristica) =>  void,
    onCaracteristicasCarregadas?: (caracteristicas: Caracteristica[]) => void;
}

const CaracteristicaCombobox = ({ onSelect, onCaracteristicasCarregadas, }: CaracteristicaComboBoxProps) => {
    const [caracteristica, setCaracteristica] = useState<Caracteristica[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [inputValue, setInputValue] = useState("");

    const token = useToken();

    useEffect(() => {
        if (!token) return;
    
        async function buscarCaracteristicas() {
          try {
            const dados = await apiGet<Caracteristica[]>(
              "/caracteristicas-produto",
              token ?? undefined,
            );
    
            setCaracteristica(dados);
            onCaracteristicasCarregadas?.(dados); // avisa para o product sheet que existem caracteristicas novas
          } catch (error) {
            toast.add({
              title: "Não foi possível carregar as caracteristicas",
              type: "error",
            });
          } finally {
            setCarregando(false);
          }
        }
    
        buscarCaracteristicas();
      }, [token]);

    const caracteristicasFiltradas = caracteristica.filter((caracteristica) => {
        const busca = inputValue.toLowerCase().trim();
        return caracteristica.nome.toLowerCase().includes(busca);
    });

    const nenhumaCategoriaEncontrada = caracteristicasFiltradas.length === 0;

    return (
    <Combobox
      items={caracteristica}
      onValueChange={(value) => {
        const caracteristicaSelecionada = caracteristica.find(
          (caracteristica) => caracteristica.nome === value,
        );

        if (!caracteristicaSelecionada) return;

        onSelect(caracteristicaSelecionada);
        setInputValue("");
      }}
      filter={null}
    >
      <ComboboxInput
        value={inputValue}
        placeholder={
          carregando ? "Carregando características..." : "Selecione a característica"
        }
        onChange={(event) => setInputValue(event.target.value)}
      />

      <ComboboxContent>
        <ComboboxList>
          {carregando ? (
            <div className="px-3 py-2 text-center text-sm text-muted-foreground">
              Carregando caracteristica...
            </div>
          ) : nenhumaCategoriaEncontrada ? (
                <div></div>
          ) : (
            <>
              {caracteristicasFiltradas.map((caracteristica) => (
                <ComboboxItem key={caracteristica.id} value={caracteristica.nome}>
                  {caracteristica.nome}
                </ComboboxItem>
              ))}

              <ComboboxItem
                className="cursor-pointer text-sm text-muted-foreground hover:bg-secondary hover:text-primary"
                render={
                  <Link href="/configuracoes">
                    <span>+ adicionar opção</span>
                  </Link>
                }
              />
            </>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );



}

export default CaracteristicaCombobox