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

export type Mensagem = {
  id: string;
  titulo: string;
};

interface MensagemComboboxProps {
  value: string;
  onChange: (value: string) => void;
  tipo: string
}

const MensagemCombobox = ({ value, onChange, tipo }: MensagemComboboxProps) => {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [carregando, setCarregando] = useState(true);

  const token = useToken();

  useEffect(() => {
    if (!token || !tipo ) return;

    let cancelado = false;

    async function buscarMensagens() {
      try {
        const dados = await apiGet<Mensagem[]>(
          `/mensagens?tipo=${tipo}`,
          token ?? undefined,
        );
        if (!cancelado) setMensagens(dados)
      } catch (error) {
        toast.add({
          title: "Não foi possível carregar as mensagens",
          type: "error",
        });
      } 
      
    }

    buscarMensagens();

    return () => {
      cancelado = true
    }

  }, [token, tipo]);


  return (
    <Combobox
      items={mensagens}
      value={value}
      onValueChange={(value) => onChange((value as string) ?? "")}
    >
      <ComboboxInput
        disabled={!tipo}
        placeholder={tipo ? "Selecione a mensagem" : "Escolha o tipo primeiro"}
        value={mensagens.find((mensagem) => mensagem.id === value)?.titulo ?? ""}
      />

      <ComboboxContent>
        <ComboboxEmpty>Nenhuma mensagem encontrada.</ComboboxEmpty>

        <ComboboxList>
          {mensagens.map((mensagem) => (
            <ComboboxItem key={mensagem.id} value={mensagem.id}>
              <span className="font-semibold">{mensagem.titulo}</span>
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
};

export default MensagemCombobox;
