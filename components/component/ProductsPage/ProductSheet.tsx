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

interface ProductSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProductSheet = ({ open, onOpenChange }: ProductSheetProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Adicionar Produto</SheetTitle>
          <SheetDescription>
            Preencha todos os campos para cadastrar um produto.
          </SheetDescription>
        </SheetHeader>
        <div className="grid flex-1 auto-rows-min gap-6 px-4">
          <div className="grid gap-3">
            <Field>
              <div className="flex gap-0.5">
                <FieldLabel>Nome</FieldLabel>
                <span className="text-destructive">*</span>
              </div>
              <Input type="text" required />
              <FieldDescription>Esse campo deve ser preenchido</FieldDescription>
            </Field>
          </div>
          <div className="grid gap-3">
            <Field>
              <div className="flex gap-0.5">
                <FieldLabel>Categoria</FieldLabel>
                <span className="text-destructive">*</span>
              </div>
              <Input type="text" required />
              <FieldDescription>Esse campo deve ser preenchido</FieldDescription>
            </Field>
          </div>
          <div className="grid gap-3">
            <Field>
              <div className="flex items-center gap-0.5">
                <FieldLabel>SKU no Ecommerce</FieldLabel>
                <span className="text-destructive">(Opcional)</span>
              </div>
              <Input type="text" required />
            </Field>
          </div>
          <div className="grid gap-3">
            <Label>Estoque</Label>
            <Input type="number" />
          </div>
          <div className="grid gap-3">
            <Label>Preço</Label>
            <Input type="number" />
          </div>
        </div>
        <SheetFooter>
          <Button type="submit">Cadastrar cliente</Button>
          <SheetClose render={<Button variant="outline">Fechar</Button>} />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default ProductSheet;
