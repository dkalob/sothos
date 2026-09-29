"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";

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

import { apiGet, apiPost } from "@/lib/api";
import { useToken } from "@/hooks/use-token";
import { clienteSchema, GrupoFormErrors, grupoSchema } from "./ClienteSchema";

interface GrupoSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGrupoCadastrado: () => Promise<void>;
}

type GrupoForm = {
  nome: string;
  clientes: Cliente[];
};

const initialForm: GrupoForm = {
  nome: "",
  clientes: [],
};

const GrupoSheet = ({
  open,
  onOpenChange,
  onGrupoCadastrado,
}: GrupoSheetProps) => {
  const [form, setForm] = useState<GrupoForm>(initialForm);
  const [errors, setErrors] = useState<GrupoFormErrors>({});
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteSelecionado, setClienteSelecionado] = useState("");
  const [clienteDuplicado, setClienteDuplicado] = useState(false);

  const token = useToken();

  // Busca os clientes para transformar o ID
  // selecionado em um objeto Cliente
  useEffect(() => {
    if (!token || !open) return;

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
      }
    }

    buscarClientes();
  }, [token, open]);

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

  async function cadastrarGrupo() {
    // Valida o formulário usando o schema de GRUPO
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

      await apiPost(
        "/clientes/grupos",
        payload,
        token ?? undefined,
      );

      toast.add({
        title: "Grupo cadastrado com sucesso!",
        type: "success",
      });

      setForm(initialForm);
      setErrors({});
      setClienteSelecionado("");
      setClienteDuplicado(false);

      onOpenChange(false);

      await onGrupoCadastrado();
    } catch (error) {
      console.error("Erro ao cadastrar grupo:", error);

      toast.add({
        title: "Não foi possível cadastrar o grupo",
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
          <SheetTitle>Adicionar Grupo de cliente</SheetTitle>
          <SheetDescription>
            Preencha todos os campos para cadastrar um grupo de clientes.
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
                <FieldLabel>Adicionar Clientes</FieldLabel>
                <span className="text-destructive">*</span>
              </div>
              <ClienteCombobox
                value={clienteSelecionado}
                onChange={(value) => {
                  setClienteSelecionado(value);
                  adicionarCliente(value);
                }}
              />
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
        </div>
        <SheetFooter>
          <Button onClick={cadastrarGrupo}>Cadastrar grupo</Button>
          <SheetClose render={<Button variant="outline">Fechar</Button>} />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default GrupoSheet;
