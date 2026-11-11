"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
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
import { apiPost, apiPut } from "@/lib/api";
import { useToken } from "@/hooks/use-token";
import {
  formatarTelefone,
  telefoneSchema,
  type TelefoneFormErrors,
} from "./TelefoneSchema";
import type { Telefone } from "./columns";

interface TelefoneSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  telefone?: Telefone | null; // com telefone = edição; sem = novo
  onTelefoneSalvo: () => void | Promise<void>;
}

type TelefoneForm = { nome: string; numero: string };

const initialForm: TelefoneForm = { nome: "", numero: "" };

const Rotulo = ({ children }: { children: React.ReactNode }) => (
  <div className="flex gap-0.5">
    <FieldLabel>{children}</FieldLabel>
    <span className="text-destructive">*</span>
  </div>
);

const TelefoneSheet = ({
  open,
  onOpenChange,
  telefone,
  onTelefoneSalvo,
}: TelefoneSheetProps) => {
  const [form, setForm] = useState<TelefoneForm>(initialForm);
  const [errors, setErrors] = useState<TelefoneFormErrors>({});
  const [salvando, setSalvando] = useState(false);

  const token = useToken();
  const editando = !!telefone;

  // Ao abrir: formulário vazio (novo) ou preenchido (edição)
  useEffect(() => {
    if (!open) return;

    setErrors({});
    setForm(
      telefone
        ? { nome: telefone.nome ?? "", numero: telefone.numero }
        : initialForm,
    );
  }, [open, telefone]);

  async function salvar() {
    const result = telefoneSchema.safeParse(form);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        nome: fieldErrors.nome?.[0],
        numero: fieldErrors.numero?.[0],
      });
      return;
    }

    setErrors({});
    setSalvando(true);

    const corpo = { nome: form.nome.trim(), numero: form.numero };

    try {
      if (telefone) {
        await apiPut(`/telefones/${telefone.id}`, corpo, token ?? undefined);
      } else {
        await apiPost("/telefones", corpo, token ?? undefined);
      }

      toast.add({
        title: editando
          ? "Telefone atualizado com sucesso!"
          : "Telefone cadastrado com sucesso!",
        type: "success",
      });
      onOpenChange(false);
      await onTelefoneSalvo();
    } catch (erro) {
      toast.add({
        title:
          erro instanceof Error
            ? erro.message
            : "Não foi possível salvar o telefone",
        type: "error",
      });
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {editando ? "Editar Telefone" : "Adicionar Telefone"}
          </SheetTitle>
          <SheetDescription>
            Esse número poderá ser escolhido como remetente das campanhas de
            WhatsApp.
          </SheetDescription>
        </SheetHeader>

        <div className="grid flex-1 auto-rows-min gap-6 px-4">
          <Field>
            <Rotulo>Nome</Rotulo>
            <Input
              placeholder="Atendimento"
              value={form.nome}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, nome: e.target.value }))
              }
              aria-invalid={!!errors.nome}
            />
            <FieldDescription
              className={errors.nome ? "text-destructive" : undefined}
            >
              {errors.nome ?? "Um nome para identificar o número"}
            </FieldDescription>
          </Field>

          <Field>
            <Rotulo>Número</Rotulo>
            <Input
              placeholder="(11) 91234-5678"
              inputMode="numeric"
              value={formatarTelefone(form.numero)}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  numero: e.target.value.replace(/\D/g, "").slice(0, 11),
                }))
              }
              aria-invalid={!!errors.numero}
            />
            <FieldDescription
              className={errors.numero ? "text-destructive" : undefined}
            >
              {errors.numero ?? "DDD + número"}
            </FieldDescription>
          </Field>
        </div>

        <SheetFooter>
          <Button onClick={salvar} disabled={salvando}>
            {salvando
              ? "Salvando..."
              : editando
                ? "Salvar alterações"
                : "Cadastrar telefone"}
          </Button>
          <SheetClose render={<Button variant="outline">Fechar</Button>} />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default TelefoneSheet;
