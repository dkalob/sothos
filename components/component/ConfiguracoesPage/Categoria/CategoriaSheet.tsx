"use client";

import { useState } from "react";

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

import { apiPost } from "@/lib/api";
import { useToken } from "@/hooks/use-token";

import { categoriaSchema, type CategoriaFormErrors } from "./CategoriaSchema";

interface CategoriaSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategoriaCadastrada: () => void | Promise<void>;
}

type CategoriaForm = {
  nome: string;
};

const initialForm: CategoriaForm = {
  nome: "",
};

const CategoriaSheet = ({
  open,
  onOpenChange,
  onCategoriaCadastrada,
}: CategoriaSheetProps) => {
  const [form, setForm] = useState<CategoriaForm>(initialForm);
  const [errors, setErrors] = useState<CategoriaFormErrors>({});
  const [salvando, setSalvando] = useState(false);

  const token = useToken();

  const cadastrarCategoria = async () => {
    const result = categoriaSchema.safeParse(form);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;

      setErrors({
        nome: fieldErrors.nome?.[0],
      });

      return;
    }

    if (!token || salvando) return;

    try {
      setSalvando(true);

      await apiPost(
        "/categorias",
        {
          nome: form.nome.trim(),
        },
        token,
      );

      toast.add({
        title: "Categoria cadastrada com sucesso!",
        type: "success",
      });

      setForm(initialForm);
      setErrors({});
      onOpenChange(false);

      await onCategoriaCadastrada();
    } catch (error) {
      toast.add({
        title:
          error instanceof Error
            ? error.message
            : "Não foi possível cadastrar a categoria",
        type: "error",
      });
    } finally {
      setSalvando(false);
    }
  };

  const handleOpenChange = (novoEstado: boolean) => {
    if (salvando) return;

    if (!novoEstado) {
      setForm(initialForm);
      setErrors({});
    }

    onOpenChange(novoEstado);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Adicionar Categoria</SheetTitle>

          <SheetDescription>
            Preencha o campo abaixo para cadastrar uma nova categoria.
          </SheetDescription>
        </SheetHeader>

        <div className="grid flex-1 auto-rows-min gap-6 px-4">
          <Field>
            <div className="flex gap-0.5">
              <FieldLabel>Nome</FieldLabel>
              <span className="text-destructive">*</span>
            </div>

            <Input
              placeholder="Ex.: Eletrônicos"
              value={form.nome}
              onChange={(event) => {
                setForm((prev) => ({
                  ...prev,
                  nome: event.target.value,
                }));

                if (errors.nome) {
                  setErrors({});
                }
              }}
              type="text"
              aria-invalid={!!errors.nome}
              disabled={salvando}
              autoFocus
            />

            <FieldDescription
              className={errors.nome ? "text-destructive" : undefined}
            >
              {errors.nome ?? "Este campo precisa ser preenchido."}
            </FieldDescription>
          </Field>
        </div>

        <SheetFooter>
          <Button onClick={cadastrarCategoria} disabled={salvando}>
            {salvando ? "Cadastrando..." : "Cadastrar categoria"}
          </Button>

          <SheetClose
            render={
              <Button variant="outline" disabled={salvando}>
                Fechar
              </Button>
            }
          />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default CategoriaSheet;
