import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import RFMBadge from "./RFMBadge";
import { rfmSegmentos } from "./DataTable";
import CategoriaCombobox, { Categoria } from "./CategoriaComboBox";
import ProdutoCombobox, { Produto } from "./ProdutoComboBox";
import { statusPedidos } from "./OrdersPage/OrderSheet";
import { useLocalidades } from "@/hooks/use-localidades";
import { Badge } from "../ui/badge";
import { toast } from "../ui/toast";

interface FiltroClienteProps {
  onFiltrosChange: (filtros: FiltrosSelecionados) => void;
}

type FiltroField =
  | {
      id: string;
      type: "number";
      label: string;
    }
  | {
      id: string;
      type: "date";
      label: string;
    }
  | {
      id: string;
      type: "valor";
      label: string;
    }
  | {
      id: string;
      type: "rfm";
      label: string;
    }
  | {
      id: string;
      type: "categoria";
      label: string;
    }
  | {
      id: string;
      type: "produto";
      label: string;
    }
  | {
      id: string;
      type: "status-pedido";
      label: string;
    }
  | {
    id: string;
    type: "localizacao";
    label: string;
    }

type FiltroOption = {
  id: string;
  label: string;
  fields?: FiltroField[];
};

type FiltroCliente = {
  id: string;
  label: string;
  title: string;
  description: string;
  breadcrumb: string[];
  options: FiltroOption[];
};

type FiltroAplicado = {
  filtroId: string;
  opcaoId: string;
  valores: Record<string, ValorFiltro>;
};

export type FiltrosSelecionados = {
  opcoes: Record<string, string>;
  valores: Record<string, Record<string, ValorFiltro>>;
};

type ValorFiltro = string | Categoria | Produto;

export const filtros: FiltroCliente[] = [
  {
    id: "recencia",
    label: "Recência",
    title: "Recência",
    description:
      "Filtra clientes que realizaram pelo menos uma compra nos últimos X dias.",
    breadcrumb: ["Filtro", "Recência"],

    options: [
      {
        id: "compraram",
        label: "Clientes que compraram nos últimos 'X' Dias",
        fields: [
          {
            id: "dias",
            type: "number",
            label: "Dias",
          },
        ],
      },
      {
        id: "nao-compraram",
        label: "Clientes que não compraram nos últimos 'X' Dias ",
        fields: [
          {
            id: "dias",
            type: "number",
            label: "Dias",
          },
        ],
      },
    ],
  },
  {
    id: "frequencia",
    label: "Frequência",
    title: "Frequência",
    description: "Filtra clientes de acordo com a frequência de suas compras.",
    breadcrumb: ["Filtro", "Frequência"],

    options: [
      {
        id: "pelo-menos",
        label: "Que compraram pelo menos 'X' vezes",
        fields: [
          {
            id: "quantidade",
            type: "number",
            label: "Quantidade de compras",
          },
          {
            id: "data-inicial",
            type: "date",
            label: "Data inicial",
          },
          {
            id: "data-final",
            type: "date",
            label: "Data final",
          },
        ],
      },
      {
        id: "exatamente",
        label: "Que compraram exatamente 'X' vezes",
        fields: [
          {
            id: "quantidade",
            type: "number",
            label: "Quantidade de compras",
          },
          {
            id: "data-inicial",
            type: "date",
            label: "Data inicial",
          },
          {
            id: "data-final",
            type: "date",
            label: "Data final",
          },
        ],
      },
      {
        id: "nunca",
        label: "Que nunca compraram",
      },
    ],
  },
  {
    id: "valor",
    label: "Valor",
    title: "Valor",
    description:
      "Filtra clientes de acordo com o valor total gasto em suas compras.",
    breadcrumb: ["Filtro", "Valor"],

    options: [
      {
        id: "maior-que",
        label: "Que gastaram mais de R$ 'X'",
        fields: [
          {
            id: "valor",
            type: "number",
            label: "Valor",
          },
        ],
      },
      {
        id: "menor-ou-igual",
        label: "Que gastaram até R$ 'X'",
        fields: [
          {
            id: "valor",
            type: "number",
            label: "Valor",
          },
        ],
      },
    ],
  },
  {
    id: "rfm",
    label: "RFM",
    title: "RFM",
    description: "Filtra clientes de acordo com suas tags RFM.",
    breadcrumb: ["Filtro", "RFM"],

    options: [
      {
        id: "pertence",
        label: "Que pertencem à tag RFM",
        fields: [
          {
            id: "segmento",
            type: "rfm",
            label: "Tag RFM",
          },
        ],
      },
      {
        id: "nao-pertence",
        label: "Que não pertencem à tag RFM",
        fields: [
          {
            id: "segmento",
            type: "rfm",
            label: "Tag RFM",
          },
        ],
      },
    ],
  },
  {
    id: "categoria",
    label: "Categoria",
    title: "Categoria",
    description:
      "Filtra clientes que compraram produtos pertencentes a determinadas categorias.",
    breadcrumb: ["Filtro", "Categoria"],

    options: [
      {
        id: "compraram",
        label: "Que compraram da categoria",
        fields: [
          {
            id: "categoria",
            type: "categoria",
            label: "Categoria",
          },
        ],
      },
      {
        id: "nao-compraram",
        label: "Que não compraram da categoria",
        fields: [
          {
            id: "categoria",
            type: "categoria",
            label: "Categoria",
          },
        ],
      },
    ],
  },
  {
    id: "produto",
    label: "Produto",
    title: "Produto",
    description: "Filtra clientes que compraram um produto específico.",
    breadcrumb: ["Filtro", "Produto"],

    options: [
      {
        id: "compraram",
        label: "Que compraram o produto",
        fields: [
          {
            id: "produto",
            type: "produto",
            label: "Produto",
          },
        ],
      },
      {
        id: "nao-compraram",
        label: "Que não compraram o produto",
        fields: [
          {
            id: "produto",
            type: "produto",
            label: "Produto",
          },
        ],
      },
    ],
  },
  {
    id: "status-pedido",
    label: "Status de pedido",
    title: "Status de pedido",
    description: "Filtra clientes de acordo com o status dos seus pedidos.",
    breadcrumb: ["Filtro", "Status de pedido"],

    options: [
      {
        id: "possui",
        label: "Que possuem pedido(s) com status",
        fields: [
          {
            id: "status",
            type: "status-pedido",
            label: "Status do pedido",
          },
        ],
      },
      {
        id: "nao-possui",
        label: "Que não possuem pedido(s) com status",
        fields: [
          {
            id: "status",
            type: "status-pedido",
            label: "Status do pedido",
          },
        ],
      },
    ],
  },
  {
    id: "localizacao",
    label: "Localização",
    title: "Localização",
    description: "Filtra clientes de acordo com sua localização.",
    breadcrumb: ["Filtro", "Localização"],

    options: [
      {
        id: "pertence",
        label: "Que pertencem ao Estado",
        fields: [
          {
            id: "estado",
            type: "localizacao",
            label: "Estado",
          },
        ],
      },
      {
        id: "nao-pertence",
        label: "Que não pertencem ao Estado",
        fields: [
          {
            id: "estado",
            type: "localizacao",
            label: "Estado",
          },
        ],
      },
    ],
  },
];


const FiltroCliente = ({ onFiltrosChange }: FiltroClienteProps) => {
  const [opcoesSelecionadas, setOpcoesSelecionadas] = useState<Record<string, string>>({});
  const [valoresFiltros, setValoresFiltros] = useState<Record<string, Record<string, ValorFiltro>>>({});
  const [filtrosAplicados, setFiltrosAplicados] = useState<FiltroAplicado[]>([]);

  const [selectInstanceKey, setSelectInstanceKey] = useState(0); // corrige um bug visual do rfm

  const { estados, carregarEstados} = useLocalidades();

  useEffect(() => {
    carregarEstados();
  }, []);

  useEffect(() => {
    onFiltrosChange({
      opcoes: opcoesSelecionadas,
      valores: valoresFiltros,
    });
  }, [opcoesSelecionadas, valoresFiltros, onFiltrosChange]);

 


  return (
    <div className="flex flex-col md:flex-row gap-6 overflow-hidden max-w-full">
      <div className="flex-1 min-w-0 -mr-6 pr-7">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-full">
          {filtros.map((filtro) => {
            const opcaoSelecionada = filtro.options.find(
              (option) => option.id === opcoesSelecionadas[filtro.id],
            );

            return (
              <Dialog key={filtro.id}>
                <DialogTrigger
                  render={<Button variant="outline">{filtro.label}</Button>}
                />

                <DialogContent className="sm:max-w-md">
                  {/* CABEÇALHO */}
                  <DialogHeader>
                    <DialogTitle>{filtro.title}</DialogTitle>
                    <DialogDescription>{filtro.description}</DialogDescription>
                  </DialogHeader>

                  {/*LISTA DE OPÇÕES */}
                  <RadioGroup
                    value={opcoesSelecionadas[filtro.id] ?? ""}
                    onValueChange={(value) => {
                      setOpcoesSelecionadas((prev) => ({
                        ...prev,
                        [filtro.id]: value,
                      }));

                      setValoresFiltros((prev) => ({
                        ...prev,
                        [filtro.id]: {},
                      }));
                    }}
                  >
                    {filtro.options.map((option) => (
                      <div key={option.id} className="flex items-start gap-3">
                        <RadioGroupItem
                          value={option.id}
                          id={`${filtro.id}-${option.id}`}
                        />

                        <Label htmlFor={`${filtro.id}-${option.id}`}>
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>

                  {/*  FIELDS AO ESCOLHER UMA OPÇÇÃO */}
                  {opcaoSelecionada?.fields?.map((field) => {
                    
                    {/* RECÊNCIA E FREQUÊNCIA */}
                    if (field.type === "number" || field.type === "date") {
                      return (
                        <div key={field.id} className="space-y-2">
                          <Label htmlFor={`${filtro.id}-${field.id}`}>
                            {field.label}
                          </Label>

                          <Input
                            id={`${filtro.id}-${field.id}`}
                            type={field.type}
                            value={String(
                              valoresFiltros[filtro.id]?.[field.id] ?? "",
                            )}
                            onChange={(event) => {
                              setValoresFiltros((prev) => ({
                                ...prev,
                                [filtro.id]: {
                                  ...prev[filtro.id],
                                  [field.id]: event.target.value,
                                },
                              }));
                            }}
                          />
                        </div>
                      );
                    }

                    {/* RFM */}
                    if (field.type === "rfm") {
                      return (
                        <div key={field.id} className="space-y-2">
                          <Label>{field.label}</Label>

                          <Select
                            key={selectInstanceKey}
                            value={String(
                              valoresFiltros[filtro.id]?.[field.id] ?? "",
                            )}
                            onOpenChange={(open) => {
                              if (!open) {
                                setSelectInstanceKey((key) => key + 1);
                              }
                            }}
                            onValueChange={(value) => {
                              setValoresFiltros((prev) => ({
                                ...prev,
                                [filtro.id]: {
                                  ...prev[filtro.id],
                                  [field.id]: value ?? "",
                                },
                              }));
                            }}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecione uma tag RFM" />
                            </SelectTrigger>

                            <SelectContent>
                              <SelectGroup>
                                {rfmSegmentos.map((segmento) => (
                                  <SelectItem key={segmento} value={segmento}>
                                    <RFMBadge segmento={segmento} />
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
                      );
                    }

                    {/* Categoria */}
                    if (field.type === "categoria") {
                      return (
                        <div key={field.id} className="space-y-2">
                          <Label>{field.label}</Label>

                          <CategoriaCombobox
                            onSelect={(categoria) => {
                              setValoresFiltros((prev) => ({
                                ...prev,
                                [filtro.id]: {
                                  ...prev[filtro.id],
                                  [field.id]: categoria,
                                },
                              }));
                            }}
                          />
                        </div>
                      );
                    }
                    
                    {/* Produto */}
                    if (field.type === "produto") {
                      return (
                        <div key={field.id} className="space-y-2">
                          <Label>{field.label}</Label>

                          <ProdutoCombobox
                            onSelect={(produto) => {
                              setValoresFiltros((prev) => ({
                                ...prev,
                                [filtro.id]: {
                                  ...prev[filtro.id],
                                  [field.id]: produto,
                                },
                              }));
                            }}
                          />
                        </div>
                      );
                    }

                    {/* Status */}
                    if (field.type === "status-pedido") {
                      return (
                        <div key={field.id} className="space-y-2">
                            <Label>{field.label}</Label>

                            <Select
                                key={selectInstanceKey}
                                value={
                                (valoresFiltros[filtro.id]?.[field.id] as string) ?? ""
                                }
                                onOpenChange={(open) => {
                                if (!open) {
                                    setSelectInstanceKey((key) => key + 1);
                                }
                                }}
                                onValueChange={(value) => {
                                setValoresFiltros((prev) => ({
                                    ...prev,
                                    [filtro.id]: {
                                    ...prev[filtro.id],
                                    [field.id]: value ?? "",
                                    },
                                }));
                                }}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecione o status" />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectGroup>
                                        {statusPedidos.map((status) => (
                                        <SelectItem key={status} value={status}>
                                            {status}
                                        </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                      );
                    }

                    {/* Localização */}
                    if (field.type === "localizacao") {
                      return (
                        <div key={field.id} className="space-y-2">
                            <Label>{field.label}</Label>

                            <Select
                                value={
                                (valoresFiltros[filtro.id]?.[field.id] as string) ?? ""
                                }
                                onValueChange={(value) => {
                                setValoresFiltros((prev) => ({
                                    ...prev,
                                    [filtro.id]: {
                                    ...prev[filtro.id],
                                        [field.id]: value ?? "",
                                    },
                                }));
                                }}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecione o estado" />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectGroup>
                                        {estados.map((estado) => (
                                        <SelectItem
                                            key={estado.id}
                                            value={estado.sigla}
                                        >
                                            {estado.nome} ({estado.sigla})
                                        </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                      );
                    }

                    return null;
                  })}

                  <DialogFooter>
                    <Button
                      type="button"
                      onClick={() => {
                        const opcaoId = opcoesSelecionadas[filtro.id];

                        if (!opcaoId) {
                          toast.add({
                            title: "Selecione uma opção de filtro",
                            type: "error",
                          });
                          return;
                        }

                        setFiltrosAplicados((prev) => [
                          ...prev.filter((item) => item.filtroId !== filtro.id),
                          {
                            filtroId: filtro.id,
                            opcaoId,
                            valores: { ...valoresFiltros[filtro.id] },
                          },
                        ]);
                      }}
                    >
                      Incluir filtro
                    </Button>
                    <DialogClose
                      render={
                        <Button type="button" variant="outline">
                          Fechar
                        </Button>
                      }
                    />
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            );
          })}
        </div>
        { /* EXIBE OS FILTROS SELECIONADOS */ }
        {filtrosAplicados.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium">Filtros incluídos</p>

            <div className="flex flex-wrap gap-2">
              {filtrosAplicados.map((filtroAplicado) => {
                const filtro = filtros.find(
                  (item) => item.id === filtroAplicado.filtroId,
                );

                const opcao = filtro?.options.find(
                  (item) => item.id === filtroAplicado.opcaoId,
                );

                if (!filtro || !opcao) return null;

                const valores = (opcao.fields ?? [])
                  .map((field) => {
                    const valor = filtroAplicado.valores?.[field.id];

                    if (valor === undefined || valor === "") return null;

                    if (typeof valor === "object") {
                      return "nome" in valor ? valor.nome : String(valor);
                    }

                    if (field.type === "localizacao") {
                      const estado = estados.find((estado) => estado.sigla === valor);
                      return estado ? `${estado.nome} (${estado.sigla})` : String(valor);
                    }

                    return String(valor);

                  })
                  .filter(Boolean) as string[];

                const valoresTexto = valores.length ? valores.join(" - ") : "";

                return (
                  <Badge key={filtroAplicado.filtroId} variant="secondary">
                    {opcao.label} {valoresTexto}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FiltroCliente;
