// Componente responsável por abrir o Sheet de cadastro de grupo de cliente
// A princípio vai ficar dentro desta pasta, mas se for utlizado em
// outro lugar, mudar para a pasta 'component'

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface ClientSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ClientSheet = ({ open, onOpenChange }: ClientSheetProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Adicionar Grupo de cliente</SheetTitle>
          <SheetDescription>
            Preencha todos os campos para cadastrar um cliente.
          </SheetDescription>
        </SheetHeader>
        <div className="grid flex-1 auto-rows-min gap-6 px-4">
          <div className="grid gap-3">
            <Field>
              <div className="flex gap-0.5">
                <FieldLabel>Nome do grupo</FieldLabel>
                <span className="text-destructive">*</span>
              </div>
              <Input type="text" required />
              <FieldDescription>Esse campo deve ser preenchido</FieldDescription>
            </Field>
          </div>
          <div className="grid gap-3">
            <Label>Adicionar Clientes</Label>
            <Input />
          </div>
        </div>
        <SheetFooter>
          <Button type="submit">Cadastrar grupo</Button>
          <SheetClose render={<Button variant="outline">Fechar</Button>} />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default ClientSheet;
