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

import { apiPost, apiPut } from "@/lib/api";
import { useToken } from "@/hooks/use-token";

import {
  caracteristicaSchema,
  type CaracteristicaFormErrors,
  type Caracteristica,
} from "./CaracteristicaSchema";

interface CaracteristicasSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCaracteristicaCadastrada: () => void | Promise<void>;
  caracteristicaEditando?: Caracteristica | null; 
}

type CaracteristicaForm = {
  nome: string
  opcoes: string[]
};

const initialForm: CaracteristicaForm = {
  nome: "",
  opcoes: [],
};

const CaracteristicaSheet = ({
  open,
  onOpenChange,
  onCaracteristicaCadastrada,
  caracteristicaEditando,
}: CaracteristicasSheetProps) => {
  const [form, setForm] = useState<CaracteristicaForm>(initialForm);
  const [errors, setErrors] = useState<CaracteristicaFormErrors>({});
  const [novaOpcao, setNovaOpcao] = useState("");
  const token = useToken();

  const emEdicao = !!caracteristicaEditando;

  
  useEffect(() => {
    if (caracteristicaEditando) {
      setForm({ 
        nome: caracteristicaEditando.nome,
        opcoes: caracteristicaEditando.opcoes
    });
    } else {
      setForm(initialForm);
    }
    setErrors({});
    setNovaOpcao("");
  }, [caracteristicaEditando, open]);

  function adicionarOpcao() {
    const valor = novaOpcao.trim();
    if (!valor) return;

    const jaExiste = form.opcoes.some(
      (opcao) => opcao.toLowerCase() === valor.toLowerCase(),
    );
    if (jaExiste) {
      toast.add({ title: "Essa opção já foi adicionada", type: "warning" });
      return;
    }

    setForm((prev) => ({ ...prev, opcoes: [...prev.opcoes, valor] }));
    setNovaOpcao("");
  }

  function removerOpcao(opcao: string) {
    setForm((prev) => ({
      ...prev,
      opcoes: prev.opcoes.filter((item) => item !== opcao),
    }));
  }

  // USAR ESSA FUNÇÃO PARA CADASTRAR OU EDITAR NO BANCO
  // ESTOU IGNORANDO A TIPAGEM DAS CARACTERÍSTICAS
  async function salvarCaracteristica() {

    const tipo = form.opcoes.length > 0 ? "OPCAO" : "TEXTO";

    const result = caracteristicaSchema.safeParse({
      nome: form.nome,
      tipo,
      opcoes: form.opcoes,
    });

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        nome: fieldErrors.nome?.[0],
      });
      return;
    }

    try {
      const payload = {
        nome: result.data.nome,
        tipo: result.data.tipo,
        opcoes: result.data.tipo === "OPCAO" ? result.data.opcoes : undefined,
      };

      if (emEdicao && caracteristicaEditando) {
        await apiPut(
          `/caracteristicas-produto/${caracteristicaEditando.id}`,
          payload,
          token ?? undefined,
        );
        toast.add({ title: "Característica atualizada com sucesso!", type: "success" });
      } else {
        await apiPost("/caracteristicas-produto", payload, token ?? undefined);
        toast.add({ title: "Característica cadastrada com sucesso!", type: "success" });
      }

      onOpenChange(false);
      setForm(initialForm);
      await onCaracteristicaCadastrada();
    } catch (error) {
      toast.add({
        title: emEdicao
          ? "Não foi possível atualizar a característica"
          : "Não foi possível cadastrar a característica",
        type: "error",
      });
    }
  }

   return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {emEdicao ? "Editar Característica" : "Adicionar Característica"}
          </SheetTitle>
          <SheetDescription>
            {emEdicao
              ? "Altere os dados da característica."
              : "Preencha os campos para cadastrar uma nova característica de produto."}
          </SheetDescription>
        </SheetHeader>

        <div className="grid flex-1 auto-rows-min gap-6 px-4">
          {/* NOME */}
          <Field>
            <div className="flex gap-0.5">
              <FieldLabel>Nome</FieldLabel>
              <span className="text-destructive">*</span>
            </div>
            <Input
              placeholder="Ex.: Cor, Tamanho, Marca"
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

          {/* OPÇÕES - só aparece quando tipo === OPCAO */}
            <Field>
              <div className="flex gap-0.5">
                <FieldLabel>Opções</FieldLabel>
                <span className="text-destructive">*</span>
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Ex.: Vermelho"
                  value={novaOpcao}
                  onChange={(e) => setNovaOpcao(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      adicionarOpcao();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={adicionarOpcao}>
                  Adicionar
                </Button>
              </div>

              {form.opcoes.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.opcoes.map((opcao) => (
                    <Badge key={opcao} variant="outline" className="gap-1 pr-1">
                      {opcao}
                      <button
                        type="button"
                        onClick={() => removerOpcao(opcao)}
                        className="ml-1 rounded-full p-0.5 hover:bg-destructive/20 hover:text-destructive"
                        title={`Remover ${opcao}`}
                      >
                        <X className="size-3" />
                        <span className="sr-only">Remover {opcao}</span>
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              <FieldDescription
                className={errors.opcoes ? "text-destructive" : undefined}
              >
                {errors.opcoes ?? "Adicione ao menos uma opção."}
              </FieldDescription>
            </Field>
        </div>

        <SheetFooter>
          <Button onClick={salvarCaracteristica}>
            {emEdicao ? "Salvar característica" : "Cadastrar característica"}
          </Button>
          <SheetClose render={<Button variant="outline">Fechar</Button>} />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};


export default CaracteristicaSheet;