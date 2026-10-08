"use client";

import { useEffect, useState } from "react";
import { Funnel, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { Toggle } from "@/components/ui/toggle";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import ClienteCombobox, { Cliente } from "../ClienteComboBox";

import { apiGet, apiPost, apiPut } from "@/lib/api";
import { useToken } from "@/hooks/use-token";
import { GrupoFormErrors, grupoSchema } from "./ClienteSchema";
import FiltroCliente from "../FiltroCliente";

interface GrupoSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGrupoCadastrado: () => Promise<void>;
  grupoId?: string | null;
}

type GrupoForm = {
  nome: string;
  clientes: Cliente[];
};

const initialForm: GrupoForm = {
  nome: "",
  clientes: [],
};

type GrupoDetalhado = {
  id: string;
  nome: string;
  itens: {
    id: string;
    nome: string;
  }[];
};

const GrupoSheet = ({
  open,
  onOpenChange,
  onGrupoCadastrado,
  grupoId,
}: GrupoSheetProps) => {
  const [form, setForm] = useState<GrupoForm>(initialForm);
  const [errors, setErrors] = useState<GrupoFormErrors>({});
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteSelecionado, setClienteSelecionado] = useState("");
  const [clienteDuplicado, setClienteDuplicado] = useState(false);
  const [filtroAtivo, setFiltroAtivo] = useState(false)

  const token = useToken();

  //Função para recarregar dados do grupo selecionado
  useEffect(() => {
    if (!token || !open) return;

    async function carregarDados() {
      try {
        // 1. Busca os clientes disponíveis no combobox
        const dadosClientes = await apiGet<Cliente[]>(
          "/clientes/combobox",
          token ?? undefined,
        );

        setClientes(dadosClientes);

        // 2. Se estiver editando, busca o grupo
        if (grupoId) {
          const grupo = await apiGet<GrupoDetalhado>(
            `/clientes/grupos/${grupoId}`,
            token ?? undefined,
          );

          // 3. Converte os itens do grupo em Cliente[]
          const clientesDoGrupo = grupo.itens
            .map((item) =>
              dadosClientes.find((cliente) => cliente.id === item.id),
            )
            .filter((cliente): cliente is Cliente => cliente !== undefined);

          setForm({
            nome: grupo.nome,
            clientes: clientesDoGrupo,
          });
        } else {
          // Novo grupo
          setForm(initialForm);
        }

        setErrors({});
        setClienteSelecionado("");
        setClienteDuplicado(false);
      } catch (error) {
        console.error("Erro ao carregar dados do grupo:", error);

        toast.add({
          title: "Não foi possível carregar os dados do grupo",
          type: "error",
        });
      }
    }

    carregarDados();
  }, [token, open, grupoId]);

  function adicionarCliente(clienteId: string) {
    if (!clienteId) return;

    const cliente = clientes.find((item) => item.id === clienteId);

    if (!cliente) return;

    const clienteJaAdicionado = form.clientes.some(
      (item) => item.id === cliente.id,
    );

    if (clienteJaAdicionado) {
      setClienteDuplicado(true);
      return;
    }

    setClienteDuplicado(false);

    setForm((prev) => ({
      ...prev,
      clientes: [...prev.clientes, cliente],
    }));

    setClienteSelecionado("");
  }

  function removerCliente(clienteId: string) {
    setForm((prev) => ({
      ...prev,
      clientes: prev.clientes.filter((cliente) => cliente.id !== clienteId),
    }));
  }

  async function salvarGrupo() {
    const result = grupoSchema.safeParse(form);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;

      setErrors({
        nome: fieldErrors.nome?.[0],
        clientes: fieldErrors.clientes?.[0],
      });

      return;
    }

    try {
      const payload = {
        nome: form.nome,
        clientesIds: form.clientes.map((cliente) => cliente.id),
      };

      if (grupoId) {
        await apiPut(
          `/clientes/grupos/${grupoId}`,
          payload,
          token ?? undefined,
        );

        toast.add({
          title: "Grupo atualizado com sucesso!",
          type: "success",
        });
      } else {
        await apiPost("/clientes/grupos", payload, token ?? undefined);

        toast.add({
          title: "Grupo cadastrado com sucesso!",
          type: "success",
        });
      }

      setForm(initialForm);
      setErrors({});
      setClienteSelecionado("");
      setClienteDuplicado(false);

      onOpenChange(false);

      await onGrupoCadastrado();
    } catch (error) {
      console.error("Erro ao salvar grupo:", error);

      toast.add({
        title: grupoId
          ? "Não foi possível atualizar o grupo"
          : "Não foi possível cadastrar o grupo",
        type: "error",
      });
    }
  }

  function fecharSheet() {
    setForm(initialForm);
    setErrors({});
    setClienteSelecionado("");
    setClienteDuplicado(false);

    onOpenChange(false);
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(valor) => {
        if (!valor) {
          fecharSheet();
        } else {
          onOpenChange(true);
        }
      }}
    >
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {grupoId ? "Editar Grupo de cliente" : "Adicionar Grupo de cliente"}
          </SheetTitle>
          <SheetDescription>
            {grupoId
              ? "Altere os dados do grupo conforme necessário."
              : "Preencha todos os campos para cadastrar um grupo de clientes."}
          </SheetDescription>
        </SheetHeader>
        <div className="grid flex-1 auto-rows-min gap-6 px-4">
          <div className="grid gap-3">
            <Field>
              <div className="flex gap-0.5">
                <FieldLabel>Nome do grupo</FieldLabel>
                <span className="text-destructive">*</span>
              </div>
              <Input
                placeholder="Clientes que mais compram"
                value={form.nome}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    nome: e.target.value,
                  }))
                }
                type="text"
                aria-invalid={!!errors.nome}
              />
              <FieldDescription
                className={errors.nome ? "text-destructive" : undefined}
              >
                {errors.nome ?? "Esse campo deve ser preenchido"}
              </FieldDescription>
            </Field>
          </div>
          <div className="grid gap-3">
            <Field>
              <div className="flex gap-0.5">
                <FieldLabel>Adicionar clientes individualmente</FieldLabel>
                <span className="text-destructive">*</span>
              </div>
              <ClienteCombobox
                value={clienteSelecionado}
                onChange={(value) => {
                  setClienteSelecionado(value);
                  adicionarCliente(value);
                }}
              />
              <FieldDescription
                className={errors.clientes ? "text-destructive" : undefined}
              >
                {errors.clientes ?? "Esse campo deve ser preenchido"}
              </FieldDescription>
              {clienteDuplicado && (
                <p className="text-sm text-destructive">
                  Este cliente já foi adicionado ao grupo.
                </p>
              )}
              {/* Bagdes dos clientes abaixo do input */}
              {form.clientes.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.clientes.map((cliente) => (
                    <Badge
                      key={cliente.id}
                      variant="outline"
                      className="gap-1 pr-1"
                    >
                      {cliente.nome}
                      <button
                        type="button"
                        onClick={() => removerCliente(cliente.id)}
                        className="ml-1 rounded-full p-0.5 hover:bg-destructive/20 hover:text-destructive"
                        title={`Remover ${cliente.nome}`}
                      >
                        <X className="size-3" />
                        <span className="sr-only">Remover {cliente.nome}</span>
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </Field>
          </div>
          <div className="grid gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Toggle 
                variant="outline" 
                aria-label="Toggle"
                pressed={filtroAtivo}
                onPressedChange={setFiltroAtivo}>
                <Funnel />
                Adicionar clientes com filtro
              </Toggle>
            </div>
          </div>
          {filtroAtivo && (
            <FiltroCliente />
          )}
        </div>
        <SheetFooter>
          <Button onClick={salvarGrupo}>
            {grupoId ? "Salvar alterações" : "Cadastrar grupo"}
          </Button>
          <SheetClose render={<Button variant="outline">Fechar</Button>} />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default GrupoSheet;
