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

import { categoriaSchema, type CategoriaFormErrors, type Categoria } from "./CategoriaSchema";

interface CategoriaSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategoriaCadastrada: () => void | Promise<void>;
  categoriaEditando?: Categoria | null; // NOVO — se vier preenchido, é edição
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
  categoriaEditando,
}: CategoriaSheetProps) => {
  const [form, setForm] = useState<CategoriaForm>(initialForm);
  const [errors, setErrors] = useState<CategoriaFormErrors>({});
  const token = useToken();

  const emEdicao = !!categoriaEditando;

  // Preenche o form com os dados da categoria quando o Sheet abre em modo edição
  useEffect(() => {
    if (categoriaEditando) {
      setForm({ nome: categoriaEditando.nome });
    } else {
      setForm(initialForm);
    }
    setErrors({});
  }, [categoriaEditando, open]);

  // USAR ESSA FUNÇÃO PARA CADASTRAR OU EDITAR NO BANCO
  async function salvarCategoria() {
    const result = categoriaSchema.safeParse(form);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({ nome: fieldErrors.nome?.[0] });
      return;
    }

    try {
      if (emEdicao && categoriaEditando) {
        // MODO EDIÇÃO
        await apiPut(
          `/categorias/${categoriaEditando.id}`,
          { nome: form.nome.trim() },
          token ?? undefined,
        );
        toast.add({ title: "Categoria atualizada com sucesso!", type: "success" });
      } else {
        // MODO CRIAÇÃO
        await apiPost(
          "/categorias",
          { nome: form.nome.trim() },
          token ?? undefined,
        );
        toast.add({ title: "Categoria cadastrada com sucesso!", type: "success" });
      }

      onOpenChange(false);
      setForm(initialForm);
      await onCategoriaCadastrada();
    } catch (error) {
      toast.add({
        title: emEdicao
          ? "Não foi possível atualizar a categoria"
          : "Não foi possível cadastrar a categoria",
        type: "error",
      });
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {emEdicao ? "Editar Categoria" : "Adicionar Categoria"}
          </SheetTitle>
          <SheetDescription>
            {emEdicao
              ? "Altere o nome da categoria."
              : "Preencha o campo abaixo para cadastrar uma nova categoria."}
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
              onChange={(e) =>
                setForm((prev) => ({ ...prev, nome: e.target.value }))
              }
              type="text"
              aria-invalid={!!errors.nome}
            />

            <FieldDescription
              className={errors.nome ? "text-destructive" : undefined}
            >
              {errors.nome ?? "Este campo precisa ser preenchido."}
            </FieldDescription>
          </Field>
        </div>

        <SheetFooter>
          <Button onClick={salvarCategoria}>
            {emEdicao ? "Salvar categoria" : "Cadastrar categoria"}
          </Button>
          <SheetClose render={<Button variant="outline">Fechar</Button>} />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default CategoriaSheet;