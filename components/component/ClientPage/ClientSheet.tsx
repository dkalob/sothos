"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { useEffect, useState } from "react";
import { clienteSchema, type ClienteFormErrors } from "./ClienteSchema";
import { useLocalidades } from "@/hooks/use-localidades";
import { apiPost } from "@/lib/api";
import { useToken } from "@/hooks/use-token";

interface ClientSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClienteCadastrado: () => void | Promise<void>; // NOVO
}

type ClienteForm = {
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  estado: string;
  cidade: string;
  aceita_marketing: boolean;
};

const initialForm: ClienteForm = {
  nome: "",
  email: "",
  telefone: "",
  cpf: "",
  estado: "",
  cidade: "",
  aceita_marketing: true,
};

const ClientSheet = ({
  open,
  onOpenChange,
  onClienteCadastrado,
}: ClientSheetProps) => {
  const [form, setForm] = useState<ClienteForm>(initialForm);
  const [errors, setErrors] = useState<ClienteFormErrors>({});
  const { estados, cidades, carregarEstados, carregarCidades, setCidades } =
    useLocalidades();

  const token = useToken();

  useEffect(() => {
    carregarEstados();
  }, []);

  useEffect(() => {
    setCidades([]);
    setForm((prev) => ({ ...prev, cidade: "" }));

    if (!form.estado) return;

    carregarCidades(form.estado);
  }, [form.estado]);

  async function cadastrarCliente() {
    const result = clienteSchema.safeParse(form);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        nome: fieldErrors.nome?.[0],
        email: fieldErrors.email?.[0],
        telefone: fieldErrors.telefone?.[0],
        cpf: fieldErrors.cpf?.[0],
        estado: fieldErrors.estado?.[0],
        cidade: fieldErrors.cidade?.[0],
      });
      return;
    }

    try {
      await apiPost(
        "/clientes",
        {
          nome: form.nome,
          email: form.email,
          telefone: form.telefone,
          cpf: form.cpf,
          cidade: form.cidade,
          estado: form.estado,
          aceitaMarketing: form.aceita_marketing,
        },
        token ?? undefined,
      );

      toast.add({ title: "Cliente cadastrado com sucesso!", type: "success" });
      onOpenChange(false);
      setForm(initialForm);
      await onClienteCadastrado(); // ALTERADO — chama a função do pai, em vez de router.refresh()
    } catch (error) {
      toast.add({
        title: "Não foi possível cadastrar o cliente",
        type: "error",
      });
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Adicionar Cliente</SheetTitle>
          <SheetDescription>
            Preencha os campos para cadastrar um cliente.
          </SheetDescription>
        </SheetHeader>
        <div className="grid flex-1 auto-rows-min gap-6 px-4">
          <div className="grid gap-3">
            <Field>
              <div className="flex gap-0.5">
                <FieldLabel>Nome</FieldLabel>
                <span className="text-destructive">*</span>
              </div>
              <Input
                placeholder="Ana"
                value={form.nome}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, nome: e.target.value }))
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
                <FieldLabel>CPF</FieldLabel>
                <span className="text-destructive">*</span>
              </div>
              <Input
                placeholder="123.456.789-00"
                value={form.cpf}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, cpf: e.target.value }))
                }
                type="text"
                aria-invalid={!!errors.cpf}
              />
              <FieldDescription
                className={errors.cpf ? "text-destructive" : undefined}
              >
                {errors.cpf ?? "Esse campo deve ser preenchido"}
              </FieldDescription>
            </Field>
          </div>
          <div className="grid gap-3">
            <Field>
              <div className="flex gap-0.5">
                <FieldLabel>Telefone</FieldLabel>
                <span className="text-destructive">*</span>
              </div>
              <Input
                placeholder="(11) 9999-9999"
                value={form.telefone}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, telefone: e.target.value }))
                }
                type="tel"
                aria-invalid={!!errors.telefone}
              />
              <FieldDescription
                className={errors.telefone ? "text-destructive" : undefined}
              >
                {errors.telefone ?? "Esse campo deve ser preenchido"}
              </FieldDescription>
            </Field>
          </div>
          <div className="grid gap-3">
            <Field>
              <div className="flex gap-0.5">
                <FieldLabel>Email</FieldLabel>
                <span className="text-destructive">*</span>
              </div>
              <Input
                placeholder="ana@email.com"
                value={form.email}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, email: e.target.value }))
                }
                type="email"
                aria-invalid={!!errors.email}
              />
              <FieldDescription
                className={errors.email ? "text-destructive" : undefined}
              >
                {errors.email ?? "Esse campo deve ser preenchido"}
              </FieldDescription>
            </Field>
          </div>

          <div className="grid gap-3">
            <Label>Estado</Label>
            <Combobox
              items={estados}
              value={form.estado}
              onValueChange={(value) =>
                setForm((prev) => ({ ...prev, estado: value as string }))
              }
            >
              <ComboboxInput placeholder="Selecione um Estado" />
              <ComboboxContent>
                <ComboboxEmpty>Nenhum estado encontrado</ComboboxEmpty>
                <ComboboxList>
                  {(estado) => (
                    <ComboboxItem key={estado.id} value={estado.sigla}>
                      {estado.nome}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>
          <div className="grid gap-3">
            <Label>Cidade</Label>
            <Combobox
              items={cidades}
              value={form.cidade}
              onValueChange={(value) =>
                setForm((prev) => ({ ...prev, cidade: value as string }))
              }
              disabled={!form.estado}
            >
              <ComboboxInput placeholder="Selecione uma cidade" />
              <ComboboxContent>
                <ComboboxEmpty>Nenhuma cidade encontrada</ComboboxEmpty>
                <ComboboxList>
                  {(cidade) => (
                    <ComboboxItem key={cidade.id} value={cidade.nome}>
                      {cidade.nome}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>
          <div className="flex items-center space-x-2">
            <Label>Aceita receber campanhas</Label>
            <Switch
              id="aceita-marketing"
              checked={form.aceita_marketing}
              onCheckedChange={(checked) =>
                setForm((prev) => ({
                  ...prev,
                  aceita_marketing: checked,
                }))
              }
            />
          </div>
        </div>
        <SheetFooter>
          <Button onClick={cadastrarCliente}>Cadastrar cliente</Button>
          <SheetClose render={<Button variant="outline">Fechar</Button>} />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default ClientSheet;
