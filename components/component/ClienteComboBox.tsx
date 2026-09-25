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

export type Cliente = {
  id: string;
  nome: string;
  cpf: string;
};

interface ClienteComboboxProps {
  value: string;
  onChange: (value: string) => void;
}

const ClienteCombobox = ({ value, onChange }: ClienteComboboxProps) => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [carregando, setCarregando] = useState(true);
  const token = useToken();

  useEffect(() => {
    if (!token) return;

    async function buscarClientes() {
      try {
        const dados = await apiGet<Cliente[]>(
          "/clientes/combobox",
          token ?? undefined,
        );

        setClientes(dados);
      } catch (error) {
        toast.add({
          title: "Não foi possível carregar os clientes",
          type: "error",
        });
      } finally {
        setCarregando(false);
      }
    }

    buscarClientes();
  }, [token]);

  function formatarCpf(cpf: string) {
    const numeros = cpf.replace(/\D/g, "");

    return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }

  return (
    <Combobox items={clientes} value={value} onValueChange={(value) => onChange(value as string ?? "")}>
      <ComboboxInput placeholder="Selecione o cliente" />

      <ComboboxContent>
          <ComboboxEmpty>Nenhum cliente encontrado.</ComboboxEmpty> 

        <ComboboxList>
          {clientes.map((cliente) => (
            <ComboboxItem key={cliente.id} value={cliente.nome}>
              <span className="font-semibold">{cliente.nome}</span>-
              <span className="text-muted-foreground">
                ({formatarCpf(cliente.cpf)})
              </span>
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
};

export default ClienteCombobox;
