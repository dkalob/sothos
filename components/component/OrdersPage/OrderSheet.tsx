// Componente responsável por abrir o Sheet de cadastro de cliente
// A princípio vai ficar dentro desta pasta, mas se for utlizado em
// outro lugar, mudar para a pasta 'component'

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
import { useState, useEffect } from "react";
import { apiPost } from "@/lib/api";
import { useToken } from "@/hooks/use-token";
import { OrderFormErrors, orderSchema } from "./OrderSchema";
import ClienteCombobox from "../ClienteComboBox";

interface OrderSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ClienteComboBox = {
  id: string;
  nome: string;
  cpf: string;
};

type OrderForm = {
  cliente: string;
  produto: string;
  valor: number;
  idPedido: string;
  data: string;
};

const initialForm: OrderForm = {
  cliente: "",
  produto: "",
  valor: 0,
  idPedido: "",
  data: new Date().toISOString().split("T")[0],
};

const OrderSheet = ({ open, onOpenChange }: OrderSheetProps) => {
  const [form, setForm] = useState<OrderForm>(initialForm);
  const [errors, setErrors] = useState<OrderFormErrors>({});
  const [clientes, setClientes] = useState<ClienteComboBox[]>([]);
  const token = useToken();

  //Função para buscar clientes do combobox

  //Função para cadastrar pedido
  async function cadastrarPedido() {
    const result = orderSchema.safeParse(form);

    if (!result.success) {
      const fieldErros = result.error.flatten().fieldErrors;

      setErrors({
        cliente: fieldErros.cliente?.[0],
        produto: fieldErros.produto?.[0],
        valor: fieldErros.valor?.[0],
        idPedido: fieldErros.idPedido?.[0],
        data: fieldErros.data?.[0],
      });

      return;
    }

    try {
      await apiPost(
        "/pedidos",
        {
          cliente: form.cliente,
          produto: form.produto,
          valor: form.valor,
          idPedido: form.idPedido,
          data: form.data,
        },
        token ?? undefined,
      );

      toast.add({
        title: "Pedido cadastrado com sucesso!",
        type: "sucess",
      });

      onOpenChange(false);
      setForm(initialForm);
      setErrors({});
    } catch (error) {
      toast.add({
        title: "Não foi possível cadastrar o pedido",
        type: "error",
      });
    }
  }

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
              <div className="flex gap-0.5">
                <FieldLabel>Cliente</FieldLabel>
                <span className="text-destructive">*</span>
              </div>
              <ClienteCombobox
                value={form.cliente}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    cliente: value,
                  }))
                }
              />
              <FieldDescription
                className={errors.cliente ? "text-destructive" : undefined}
              >
                {errors.cliente ?? "Este campo deve ser preenchido."}
              </FieldDescription>
            </Field>
          </div>
          <div className="grid gap-3">
            <Field>
              <div className="flex gap-0.5">
                <FieldLabel>Produto(s)</FieldLabel>
                <span className="text-destructive">*</span>
              </div>
              <Input
                placeholder="Selecione um ou mais produtos"
                value={form.produto}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, produto: e.target.value }))
                }
                type="text"
                aria-invalid={!!errors.produto}
              />
              <FieldDescription
                className={errors.produto ? "text-destructive" : undefined}
              >
                {errors.produto ?? "Este campo deve ser preenchido."}
              </FieldDescription>
            </Field>
          </div>
          <div className="grid gap-3">
            <Field>
              <div className="flex gap-0.5">
                <FieldLabel>Valor</FieldLabel>
                <span className="text-destructive">*</span>
              </div>
              <Input
                value={form.valor}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    valor: Number(e.target.value),
                  }))
                }
                type="number"
                aria-invalid={!!errors.valor}
              />
              <FieldDescription
                className={errors.valor ? "text-destructive" : undefined}
              >
                {errors.valor ?? "Este campo deve ser preenchido."}
              </FieldDescription>
            </Field>
          </div>
          <div className="grid gap-3">
            <Field>
              <div className="flex gap-0.5">
                <FieldLabel>Data do pedido</FieldLabel>
                <span className="text-destructive">*</span>
              </div>
              <Input
                value={form.data}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, data: e.target.value }))
                }
                type="date"
                aria-invalid={!!errors.data}
              />
              <FieldDescription
                className={errors.data ? "text-destructive" : undefined}
              >
                {errors.data ?? "Este campo deve ser preenchido."}
              </FieldDescription>
            </Field>
          </div>
          <div className="grid gap-3">
            <Field>
              <FieldLabel>Id no E-commerce / ERP</FieldLabel>
              <Input
                type="text"
                value={form.idPedido}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, idPedido: e.target.value }))
                }
                required
              />
            </Field>
          </div>
        </div>
        <SheetFooter>
          <Button onClick={cadastrarPedido}>Cadastrar pedido</Button>
          <SheetClose render={<Button variant="outline">Fechar</Button>} />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default OrderSheet;
