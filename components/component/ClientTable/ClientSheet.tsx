// Componente responsável por abrir o Sheet de cadastro de cliente
// A princípio vai ficar dentro desta pasta, mas se for utlizado em
// outro lugar, mudar para a pasta 'component'

import { Button } from "@/components/ui/button";
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
          <SheetTitle>Adicionar Cliente</SheetTitle>
          <SheetDescription>
            Preencha todos os campos para cadastrar um cliente.
          </SheetDescription>
        </SheetHeader>
        <div className="grid flex-1 auto-rows-min gap-6 px-4">
          <div className="grid gap-3">
            <Label>Nome</Label>
            <Input />
          </div>
          <div className="grid gap-3">
            <Label>Email</Label>
            <Input />
          </div>
          <div className="grid gap-3">
            <Label>Telefone</Label>
            <Input />
          </div>
          <div className="grid gap-3">
            <Label>CPF</Label>
            <Input />
          </div>
          <div className="grid gap-3">
            <Label>Cidade</Label>
            <Input />
          </div>
          <div className="grid gap-3">
            <Label>Estado</Label>
            <Input />
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

export default ClientSheet;
