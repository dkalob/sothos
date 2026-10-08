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
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { useState, useEffect } from "react";
import { apiGet, apiPost, apiPut } from "@/lib/api";
import { useToken } from "@/hooks/use-token";
import { OrderFormErrors, orderSchema } from "./OrderSchema";
import ClienteCombobox from "../ClienteComboBox";
import ProdutoCombobox from "../ProdutoComboBox";
import { X } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface OrderSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPedidoCadastrado: () => Promise<void>;
  pedidoId?: string | null;
}

type ItemPedido = {
  produtoId: string;
  nomeProduto: string;
  sku: string | null;
  imagem: string | null;
  precoUnitario: string;
  quantidade: number | "";
};

type OrderForm = {
  cliente: string;
  itens: ItemPedido[];
  idPedido: string;
  data: string;
  temFrete: boolean;
  frete: number | "";
  temDesconto: boolean;
  desconto: number | "";
  status: StatusPedido;
};

type PedidoDetalhado = {
  id: string;
  clienteId: string | null;
  numero: string | null;
  status: StatusPedido;
  valorFrete: number;
  valorDesconto: number;
  realizadoEm: string;
  itens: {
    produtoId: string | null;
    nomeProduto: string;
    sku: string | null;
    quantidade: number;
    precoUnitario: number;
  }[];
};

const initialForm: OrderForm = {
  cliente: "",
  itens: [],
  idPedido: "",
  data: new Date().toISOString().split("T")[0],
  temFrete: false,
  frete: "",
  temDesconto: false,
  desconto: "",
  status: "PENDENTE",
};

type ClienteComboBox = {
  id: string;
  nome: string;
  cpf: string;
}

type StatusPedido =
  | "PENDENTE"
  | "PAGO"
  | "ENVIADO"
  | "ENTREGUE"
  | "CANCELADO"
  | "DEVOLVIDO";

export const statusPedidos: StatusPedido[] = [
  "PENDENTE",
  "PAGO",
  "ENVIADO",
  "ENTREGUE",
  "CANCELADO",
  "DEVOLVIDO",
];

const OrderSheet = ({
  open,
  onOpenChange,
  onPedidoCadastrado,
  pedidoId,
}: OrderSheetProps) => {
  const [form, setForm] = useState<OrderForm>(initialForm);
  const [errors, setErrors] = useState<OrderFormErrors>({});
  const [produtoDuplicado, setProdutoDuplicado] = useState(false);
  const [clientes, setClientes] = useState<ClienteComboBox[]>([]);

  const token = useToken();

  //Função para recarregar dados do pedido selecionado
  useEffect(() => {
    if (!open || !pedidoId || !token) return;

    async function carregarPedido() {
      try {
        const pedido = await apiGet<PedidoDetalhado>(
          `/pedidos/${pedidoId}`,
          token ?? undefined,
        );

        setForm({
          cliente: pedido.clienteId ?? "",

          itens: pedido.itens.map((item) => ({
            produtoId: item.produtoId ?? "",
            nomeProduto: item.nomeProduto,
            sku: item.sku,
            imagem: null,
            precoUnitario: String(item.precoUnitario),
            quantidade: item.quantidade,
          })),

          idPedido: pedido.numero ?? "",

          data: pedido.realizadoEm.split("T")[0],

          temFrete: Number(pedido.valorFrete) > 0,
          frete: Number(pedido.valorFrete) || "",

          temDesconto: Number(pedido.valorDesconto) > 0,
          desconto: Number(pedido.valorDesconto) || "",

          status: pedido.status,
        });

        setErrors({});
        setProdutoDuplicado(false);
      } catch (error) {
        console.error("Erro ao carregar pedido:", error);

        toast.add({
          title: "Não foi possível carregar o pedido",
          type: "error",
        });
      }
    }

    carregarPedido();
  }, [open, pedidoId, token]);

  //Função para resetar o form quando o Sheet abrir sem pedidoId
  useEffect(() => {
    if (open && !pedidoId) {
      setForm(initialForm);
      setErrors({});
      setProdutoDuplicado(false);
    }
  }, [open, pedidoId]);

  //Função para calcular o valor do pedido com base nos itens e estoque
  function calcularValorTotal() {
    const valorProdutos = (form.itens ?? []).reduce((total, item) => {
      const preco = Number(item.precoUnitario);
      const quantidade = Number(item.quantidade);

      return total + preco * quantidade;
    }, 0);

    const frete = form.temFrete ? Number(form.frete) : 0;
    const desconto = form.temDesconto ? Number(form.desconto) : 0;

    return valorProdutos + frete - desconto;
  }

  //Função para cadastrar pedido
  async function salvarPedido() {
    const dadosPedido = {
      clienteId: form.cliente,

      itens: form.itens.map((item) => ({
        produtoId: item.produtoId,
        nomeProduto: item.nomeProduto,
        sku: item.sku ?? undefined,
        quantidade: Number(item.quantidade),
        precoUnitario: Number(item.precoUnitario),
      })),

      valorFrete: form.temFrete ? Number(form.frete) : 0,

      valorDesconto: form.temDesconto ? Number(form.desconto) : 0,

      status: form.status,

      realizadoEm: form.data,

      numero: form.idPedido || undefined,
    };

    try {
      if (pedidoId) {
        // EDITAR PEDIDO
        await apiPut(`/pedidos/${pedidoId}`, dadosPedido, token ?? undefined);

        toast.add({
          title: "Pedido atualizado com sucesso!",
          type: "success",
        });
      } else {
        // CADASTRAR PEDIDO
        await apiPost("/pedidos", dadosPedido, token ?? undefined);

        toast.add({
          title: "Pedido cadastrado com sucesso!",
          type: "success",
        });
      }

      await onPedidoCadastrado();

      onOpenChange(false);

      setForm(initialForm);
      setErrors({});
    } catch (error) {
      console.error(error);

      toast.add({
        title: pedidoId
          ? "Não foi possível atualizar o pedido"
          : "Não foi possível cadastrar o pedido",
        type: "error",
      });
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex h-full flex-col">
        <SheetHeader>
          <SheetTitle>
            {pedidoId ? "Editar Pedido" : "Cadastrar pedido"}
          </SheetTitle>
          <SheetDescription>
            {pedidoId
              ? "Altere os dados do pedido conforme necessário."
              : "Preencha todos os campos para cadastrar um pedido."}
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4">
          <div className="grid auto-rows-min gap-6 pb-6">
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
                <ProdutoCombobox
                  onSelect={(produto) => {
                    const produtoJaAdicionado = form.itens.some(
                      (item) => item.produtoId === produto.id,
                    );

                    if (produtoJaAdicionado) {
                      setProdutoDuplicado(true);
                      return;
                    }

                    setProdutoDuplicado(false);

                    setForm((prev) => ({
                      ...prev,
                      itens: [
                        ...prev.itens,
                        {
                          produtoId: produto.id,
                          nomeProduto: produto.nome,
                          sku: produto.sku,
                          imagem: produto.imagem,
                          precoUnitario: produto.precoAtual,
                          quantidade: "",
                        },
                      ],
                    }));
                  }}
                />

                {produtoDuplicado && (
                  <p className="text-sm text-destructive">
                    Este produto já foi adicionado ao pedido.
                  </p>
                )}
                {/* Tabela que aparece quando o usuário escolhe os produtos */}
                {form.itens.length > 0 && (
                  <div className="mt-3">
                    {/* Cabeçalho */}
                    <div className="grid grid-cols-[1fr_90px_70px_24px] items-center gap-2 px-1 pb-2 text-xs text-muted-foreground">
                      <span className="text-left font-semibold">Nome</span>
                      <span className="text-left font-semibold ml-1.5">R$</span>
                      <span className="text-left font-semibold">
                        Quantidade
                      </span>
                      <span />
                    </div>

                    {/* Produtos */}
                    <div className="space-y-2 border-b  border-t  pt-3 pb-3">
                      {form.itens.map((item) => (
                        <div
                          key={item.produtoId}
                          className="grid grid-cols-[minmax(0,1fr)_80px_80px_24px] items-center gap-2"
                        >
                          {/* Nome */}
                          <span className="truncate text-sm ml-1">
                            {item.nomeProduto}
                          </span>

                          {/* Preço */}
                          <Input
                            value={item.precoUnitario}
                            onChange={(e) => {
                              const novoPreco = e.target.value;

                              setForm((prev) => ({
                                ...prev,
                                itens: prev.itens.map((produto) =>
                                  produto.produtoId === item.produtoId
                                    ? {
                                        ...produto,
                                        precoUnitario: novoPreco,
                                      }
                                    : produto,
                                ),
                              }));
                            }}
                            type="number"
                            step="0.01"
                            min="0"
                            className="h-8 text-right"
                          />

                          {/* Quantidade */}
                          <Input
                            value={item.quantidade}
                            onChange={(e) => {
                              const novaQuantidade = e.target.value;

                              setForm((prev) => ({
                                ...prev,
                                itens: prev.itens.map((produto) =>
                                  produto.produtoId === item.produtoId
                                    ? {
                                        ...produto,
                                        quantidade:
                                          novaQuantidade === ""
                                            ? ""
                                            : Number(novaQuantidade),
                                      }
                                    : produto,
                                ),
                              }));
                            }}
                            type="number"
                            min="1"
                            step="1"
                            className="h-8 text-right"
                          />

                          {/* Remover */}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => {
                              setForm((prev) => ({
                                ...prev,
                                itens: prev.itens.filter(
                                  (produto) =>
                                    produto.produtoId !== item.produtoId,
                                ),
                              }));
                            }}
                          >
                            <X />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <FieldDescription
                  className={errors.produto ? "text-destructive" : undefined}
                >
                  {errors.produto ?? "Este campo deve ser preenchido."}
                </FieldDescription>
              </Field>
            </div>
            <div className="grid gap-3">
              <Field>
                <FieldLabel>Valor Total do Pedido</FieldLabel>
                <Input
                  value={`R$ ${calcularValorTotal()
                    .toFixed(2)
                    .replace(".", ",")}`}
                  type="text"
                  disabled
                />
                <span className="text-muted-foreground">
                  Este campo é preenchido automaticamente.
                </span>

                <div className="grid gap-2 mt-0.5">
                  {/* Frete */}
                  <div className="flex items-center gap-2">
                    <span>Tem frete?</span>

                    <Switch
                      checked={form.temFrete}
                      onCheckedChange={(checked) =>
                        setForm((prev) => ({
                          ...prev,
                          temFrete: checked,
                          frete: checked ? prev.frete : "",
                        }))
                      }
                    />

                    {form.temFrete && (
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="R$ 0,00"
                        value={form.frete}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            frete:
                              e.target.value === ""
                                ? ""
                                : Number(e.target.value),
                          }))
                        }
                        className="ml-auto h-8 w-20 text-right"
                      />
                    )}
                  </div>

                  {/* Desconto */}
                  <div className="flex items-center gap-2">
                    <span>Tem desconto?</span>

                    <Switch
                      checked={form.temDesconto}
                      onCheckedChange={(checked) =>
                        setForm((prev) => ({
                          ...prev,
                          temDesconto: checked,
                          desconto: checked ? prev.desconto : "",
                        }))
                      }
                    />

                    {form.temDesconto && (
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="R$ 0,00"
                        value={form.desconto}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            desconto:
                              e.target.value === ""
                                ? ""
                                : Number(e.target.value),
                          }))
                        }
                        className="ml-auto h-8 w-20 text-right"
                      />
                    )}
                  </div>
                </div>
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
                <FieldLabel>Status</FieldLabel>
                <Combobox
                  items={statusPedidos}
                  value={form.status ?? "PENDENTE"}
                  onValueChange={(value) => {
                    setForm((prev) => ({
                      ...prev,
                      status: value as StatusPedido,
                    }));
                  }}
                >
                  <ComboboxInput placeholder="Selecione o status" />
                  <ComboboxContent>
                    <ComboboxEmpty>Nenhum status encontrado.</ComboboxEmpty>
                    <ComboboxList>
                      {statusPedidos.map((status) => (
                        <ComboboxItem key={status} value={status}>
                          {status}
                        </ComboboxItem>
                      ))}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
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
        </div>
        <SheetFooter>
          <Button onClick={salvarPedido}>
            {pedidoId ? "Salvar alterações" : "Cadastrar pedido"}
          </Button>
          <SheetClose render={<Button variant="outline">Fechar</Button>} />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default OrderSheet;
