// Componente responsável por abrir o Sheet de cadastro de cliente
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

interface OrderSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const OrderSheet = ({ open, onOpenChange }: OrderSheetProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Cadastrar pedido</SheetTitle>
          <SheetDescription>
            Preencha todos os campos para cadastrar um pedido.
          </SheetDescription>
        </SheetHeader>
        <div className="grid flex-1 auto-rows-min gap-6 px-4">
          <div className="grid gap-3">
            <Field>
              <FieldLabel>Id no E-commerce / ERP</FieldLabel>
              <Input type="number" required />
            </Field>
          </div>
          <div className="grid gap-3">
            <Field>
              <FieldLabel>Selecionar Cliente</FieldLabel>

              <Input type="text" required />
            </Field>
          </div>
          <div className="grid gap-3">
            <Field>
              <FieldLabel>Selecionar Produto</FieldLabel>

              <Input type="text" required />
            </Field>
          </div>
          <div className="grid gap-3">
            <Label>Valor</Label>
            <Input type="number" />
          </div>
          <div className="grid gap-3">
            <Label>Data do pedido</Label>
            <Input type="date" />
          </div>
        </div>
        <SheetFooter>
          <Button type="submit">Cadastrar pedido</Button>
          <SheetClose render={<Button variant="outline">Fechar</Button>} />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default OrderSheet;
