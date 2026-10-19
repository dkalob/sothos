"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface CriarGrupoSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quantidade: number; // quantos clientes estão marcados
  onConfirmar: (nome: string) => Promise<void>;
}

const CriarGrupoSheet = ({
  open,
  onOpenChange,
  quantidade,
  onConfirmar,
}: CriarGrupoSheetProps) => {
  const [nome, setNome] = useState("");
  const [erro, setErro] = useState<string | undefined>();

  // Abre sempre limpo
  useEffect(() => {
    setNome("");
    setErro(undefined);
  }, [open]);

  async function confirmar() {
    if (nome.trim().length < 3) {
      setErro("O nome deve ter pelo menos 3 letras");
      return;
    }
    await onConfirmar(nome.trim());
  }

  

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Criar grupo de clientes</SheetTitle>
          <SheetDescription>
            {quantidade} {quantidade === 1 ? "cliente selecionado" : "clientes selecionados"}.
          </SheetDescription>
        </SheetHeader>

        <div className="grid flex-1 auto-rows-min gap-6 px-4">
          <Field>
            <div className="flex gap-0.5">
              <FieldLabel>Nome do grupo</FieldLabel>
              <span className="text-destructive">*</span>
            </div>
            <Input
              placeholder="Ex.: Interessados no Tênis Adidas"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              aria-invalid={!!erro}
            />
            <FieldDescription className={erro ? "text-destructive" : undefined}>
              {erro ?? "Esse campo deve ser preenchido"}
            </FieldDescription>
          </Field>
        </div>

        <SheetFooter>
          <Button onClick={confirmar}>Criar grupo</Button>
          <SheetClose render={<Button variant="outline">Fechar</Button>} />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default CriarGrupoSheet;