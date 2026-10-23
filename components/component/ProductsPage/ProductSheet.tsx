"use client";
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
import { useState, useEffect } from "react";
import { ProdutoFormErrors, produtoSchema, caracteristicaProdutoSchema } from "./ProductSchema";
import { useToken } from "@/hooks/use-token";
import { apiGet, apiPost, apiPut } from "@/lib/api";
import { toast } from "@/components/ui/toast";
import CategoriaCombobox from "../CategoriaComboBox";
import { Switch } from "@/components/ui/switch";
import { ImagePlus, X } from "lucide-react";
import { uploadImagem } from "@/lib/cloudinary";
import Link from "next/link";
import { Caracteristica } from "../ConfiguracoesPage/Caracteristicas/CaracteristicaSchema";
import CaracteristicaCombobox from "../CaracteristicasComboBox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProdutoCadastrado: () => void;
  produtoId?: string | null;
}

type CaracteristicaProduto = {
  caracteristica: Caracteristica; // a característica em si (nome, opcoes, etc)
  valor: string; // o valor escolhido/digitado pelo usuário
};

type ProdutoForm = {
  imagem: File | null;
  nome: string;
  categoriaId: string;
  preco: string;
  sku: string;
  ativo: boolean;
};

type ProdutoDetalhado = {
  id: string;
  imagem: string | null;
  nome: string;
  categoriaId: string;
  categoria: {
    id: string;
    nome: string;
  } | null;
  preco: string;
  sku: string | null;
  ativo: boolean;
  caracteristicas: {
    caracteristicaId: string;
    valor: string;
    caracteristica: {
      id: string;
      nome: string;
      tipo: string;
      opcoes: string[];
    };
  }[];
};

const initialForm: ProdutoForm = {
  imagem: null,
  nome: "",
  categoriaId: "",
  preco: "",
  sku: "",
  ativo: true,
};

const ProductSheet = ({
  open,
  onOpenChange,
  onProdutoCadastrado,
  produtoId,
}: ProductSheetProps) => {
  const [form, setForm] = useState<ProdutoForm>(initialForm);
  const [errors, setErrors] = useState<ProdutoFormErrors>({});
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);
  const [imagemAtual, setImagemAtual] = useState<string | null>(null);
  const [caracteristicasProduto, setCaracteristicasProduto] = useState<CaracteristicaProduto[]>([]);
  const [caracteristicasExistentes, setCaracteristicasExistentes] = useState<Caracteristica[]>([]);
  const [carregandoCaracteristicas, setCarregandoCaracteristicas] = useState(true);

  useEffect(() => {
    if (!form.imagem) {
      setImagemPreview(imagemAtual);
      return;
    }

    const url = URL.createObjectURL(form.imagem);
    setImagemPreview(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [form.imagem, imagemAtual]);

  const token = useToken();

  useEffect(() => {
    if (!token) return;

    async function verificarCaracteristicas() {
      try {
        const dados = await apiGet<Caracteristica[]>(
          "/caracteristicas-produto",
          token ?? undefined,
        );
        setCaracteristicasExistentes(dados);
      } catch (error) {
        console.error("Erro ao verificar características:", error);
      } finally {
        setCarregandoCaracteristicas(false);
      }
    }

    verificarCaracteristicas();
  }, [token]);

  //Função para recarregar dados do produto selecionado
  useEffect(() => {
  if (!open || !produtoId || !token) return;

  let cancelado = false;

  async function carregarProduto() {
      try {
        const produto = await apiGet<ProdutoDetalhado>(
          `/produtos/${produtoId}`,
          token || undefined,
        );

        if (cancelado) return;

        setForm({
          imagem: null,
          nome: produto.nome,
          categoriaId: produto.categoriaId ?? "",
          preco: produto.preco,
          sku: produto.sku ?? "",
          ativo: produto.ativo,
        });

        setImagemAtual(produto.imagem);
        setErrors({});

        setCaracteristicasProduto(
          produto.caracteristicas.map((item) => {
            const existente = caracteristicasExistentes.find(
              (c) => c.id === item.caracteristicaId,
            );

            if (existente) {
              return {
                caracteristica: existente,
                valor: item.valor,
              };
            }

            return {
              caracteristica: {
                id: item.caracteristica.id,
                nome: item.caracteristica.nome,
                tipo: item.caracteristica.tipo as Caracteristica["tipo"],
                opcoes: item.caracteristica.opcoes,
              } as Caracteristica,
              valor: item.valor,
            };
          }),
        );
      } catch (error) {
        if (cancelado) return;

        console.error("Erro ao carregar produto:", error);

        toast.add({
          title: "Não foi possível carregar o produto",
          type: "error",
        });
      }
    }

    carregarProduto();

    return () => {
      cancelado = true;
    };
  }, [open, produtoId, token, caracteristicasExistentes]);

  async function salvarProduto() {
    const result = produtoSchema.safeParse({
      imagem: form.imagem ?? imagemAtual ?? undefined,
      nome: form.nome,
      categoriaId: form.categoriaId,
      preco: form.preco,
      sku: form.sku,
      ativo: form.ativo,
    });

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;

      setErrors({
        imagem: fieldErrors.imagem?.[0],
        nome: fieldErrors.nome?.[0],
        categoriaId: fieldErrors.categoriaId?.[0],
        preco: fieldErrors.preco?.[0],
        sku: fieldErrors.sku?.[0],
        ativo: fieldErrors.ativo?.[0],
      });

      return;
    }

    const resultadoCaracteristicas =
      caracteristicaProdutoSchema.safeParse(
        caracteristicasProduto.map((item) => ({
          caracteristicaId: item.caracteristica.id,
          valor: item.valor,
        })),
      );

    if (!resultadoCaracteristicas.success) {
      const issue = resultadoCaracteristicas.error.issues[0];
      const indice = Number(issue.path[0]);

      toast.add({
        title: "Verifique as características",
        type: "error",
      });

      console.error(
        "Característica inválida:",
        caracteristicasProduto[indice]?.caracteristica.nome,
        issue.message,
      );

      return;
    }

    try {
      let imagemUrl = imagemAtual ?? "";

      if (form.imagem) {
        imagemUrl = await uploadImagem(form.imagem);
      }

      const dadosProduto = {
        imagem: imagemUrl,
        nome: form.nome.trim(),
        categoriaId: form.categoriaId,
        preco: result.data.preco,
        sku: form.sku.trim(),
        ativo: form.ativo,
        caracteristicas: resultadoCaracteristicas.data,
      };

      if (produtoId) {
        await apiPut(
          `/produtos/${produtoId}`,
          dadosProduto,
          token ?? undefined,
        );

        toast.add({
          title: "Produto atualizado com sucesso!",
          type: "success",
        });
      } else {
        await apiPost(
          "/produtos",
          dadosProduto,
          token ?? undefined,
        );

        toast.add({
          title: "Produto cadastrado com sucesso!",
          type: "success",
        });
      }

      await onProdutoCadastrado();

      onOpenChange(false);
      setForm(initialForm);
      setImagemAtual(null);
      setImagemPreview(null);
      setCaracteristicasProduto([]);
      setErrors({});
    } catch (error) {
      console.error("Erro ao salvar produto:", error);

      toast.add({
        title: produtoId
          ? "Não foi possível atualizar o produto"
          : "Não foi possível cadastrar o produto",
        type: "error",
      });
    }
}

  function adicionarCaracteristica(caracteristica: Caracteristica) {
    const jaAdicionada = caracteristicasProduto.some(
      (item) => item.caracteristica.id === caracteristica.id,
    );

    if (jaAdicionada) {
      toast.add({
        title: "Essa característica já foi adicionada",
        type: "warning",
      });
      return;
    }

    setCaracteristicasProduto((prev) => [
      ...prev,
      { caracteristica, valor: "" }, // começa sem valor escolhido ainda
    ]);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>{produtoId ? "Editar Produto" : "Adicionar Produto"}</SheetTitle>
          <SheetDescription>
            {produtoId
              ? "Altere os dados do produto conforme necessário."
              : "Preencha os campos para cadastrar um produto."}
          </SheetDescription>
        </SheetHeader>
        <div className="grid flex-1 auto-rows-min gap-6 px-4 overflow-y-auto">
          <div className="grid gap-3">
            <Field>
              <div className="flex gap-0.5">
                <FieldLabel>Foto do produto</FieldLabel>
                <span className="text-destructive">*</span>
              </div>
              <label
                htmlFor="imagem-produto"
                className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/20 p-6 text-center transition-colors hover:border-primary/50 hover:bg-muted/40"
              >
                {imagemPreview ? (
                  <img
                    src={imagemPreview}
                    alt="Prévia do produto"
                    className="h-40 w-full object-contain"
                  />
                ) : (
                  <>
                    <div className="mb-2 text-3xl">
                      <ImagePlus />
                    </div>

                    <p className="text-sm font-medium">
                      Clique para selecionar uma imagem
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      PNG, JPG ou WEBP • até 5 MB
                    </p>
                  </>
                )}

                <input
                  id="imagem-produto"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;

                    setForm((prev) => ({
                      ...prev,
                      imagem: file,
                    }));
                  }}
                  aria-invalid={!!errors.imagem}
                />
              </label>
              <FieldDescription
                className={errors.imagem ? "text-destructive" : undefined}
              >
                {errors.imagem ?? "Selecione uma imagem do produto"}
              </FieldDescription>
            </Field>
          </div>
          <div className="grid gap-3">
            <Field>
              <div className="flex gap-0.5">
                <FieldLabel>Nome</FieldLabel>
                <span className="text-destructive">*</span>
              </div>
              <Input
                placeholder="Nome do Produto"
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
                {errors.nome ?? "Esse campo deve ser preenchido"}
              </FieldDescription>
            </Field>
          </div>
          <div className="grid gap-3">
            <Field>
              <div className="flex gap-0.5">
                <FieldLabel>Categoria</FieldLabel>
                <span className="text-destructive">*</span>
              </div>
              <CategoriaCombobox
                onSelect={(categoria) =>
                  setForm((prev) => ({
                    ...prev,
                    categoriaId: categoria.id,
                  }))
                }
              />
              <FieldDescription
                className={errors.categoriaId ? "text-destructive" : undefined}
              >
                {errors.categoriaId ?? "Esse campo deve ser preenchido"}
              </FieldDescription>
            </Field>
          </div>
          <div className="grid gap-3">
            <Field>
              <div className="flex gap-0.5">
                <FieldLabel>Preço</FieldLabel>
                <span className="text-destructive">*</span>
              </div>
              <Input
                value={form.preco}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    preco: e.target.value,
                  }))
                }
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                aria-invalid={!!errors.preco}
              />
              <FieldDescription
                className={errors.preco ? "text-destructive" : undefined}
              >
                {errors.preco ?? "Esse campo deve ser preenchido"}
              </FieldDescription>
            </Field>
          </div>
          <div className="grid gap-3">
            <Field>
              <FieldLabel>Sku no E-commerce</FieldLabel>
              <Input
                value={form.sku}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, sku: e.target.value }))
                }
                type="text"
                aria-invalid={!!errors.sku}
              />
              <FieldDescription
                className={errors.sku ? "text-destructive" : undefined}
              >
                {errors.sku ?? ""}
              </FieldDescription>
            </Field>
          </div>
          <div className="flex items-center space-x-2">
            <Label>Ativo</Label>
            <Switch
              id="ativo"
              checked={form.ativo}
              onCheckedChange={(checked) =>
                setForm((prev) => ({
                  ...prev,
                  ativo: checked,
                }))
              }
            />
          </div>
          {carregandoCaracteristicas ? null : caracteristicasExistentes.length >
            0 ? (
            // EXISTE pelo menos uma característica cadastrada no sistema
            <div className="grid gap-3">
              <Field>
                <FieldLabel>Características de produto</FieldLabel>
                <div className="flex flex-col gap-4">
                  <CaracteristicaCombobox
                    onSelect={adicionarCaracteristica}
                    onCaracteristicasCarregadas={(dados) => {
                      setCaracteristicasExistentes(dados);
                      setCarregandoCaracteristicas(false);
                    }}
                  />

                  {caracteristicasProduto.map((item, index) => (
                    <div
                      key={item.caracteristica.id}
                      className="flex flex-col gap-2"
                    >
                      <FieldLabel>{item.caracteristica.nome}</FieldLabel>

                      <div className="flex items-center gap-2">
                        {item.caracteristica.opcoes.length > 0 ? (
                          <Select
                            value={item.valor}
                            onValueChange={(valor) => {
                              setCaracteristicasProduto((prev) =>
                                prev.map((c, i) =>
                                  i === index
                                    ? { ...c, valor: valor ?? "" }
                                    : c,
                                ),
                              );
                            }}
                          >
                            <SelectTrigger className="flex-1">
                              {" "}
                              <SelectValue placeholder="Selecione uma opção" />
                            </SelectTrigger>
                            <SelectContent>
                              {item.caracteristica.opcoes.map((opcao) => (
                                <SelectItem key={opcao} value={opcao}>
                                  {opcao}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            placeholder="Digite o valor"
                            value={item.valor}
                            onChange={(e) => {
                              const valor = e.target.value;
                              setCaracteristicasProduto((prev) =>
                                prev.map((c, i) =>
                                  i === index ? { ...c, valor } : c,
                                ),
                              );
                            }}
                            className="flex-1"
                          />
                        )}

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setCaracteristicasProduto((prev) =>
                              prev.filter((_, i) => i !== index),
                            )
                          }
                          title="Remover característica"
                        >
                          <X className="size-4 text-destructive" />{" "}
                          <span className="sr-only">Remover</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Field>
            </div>
          ) : (
            // NÃO existe nenhuma característica cadastrada ainda
            <div className="grid gap-3">
              <Field>
                <Link href="/configuracoes">
                  <FieldLabel className="text-sm text-muted-foreground hover:bg-secondary hover:text-primary">
                    Você ainda não configurou as características de seus
                    produtos. Clique aqui para configurá-las.
                  </FieldLabel>
                </Link>
              </Field>
            </div>
          )}
        </div>
        <SheetFooter>
          <Button onClick={salvarProduto}>
            {produtoId ? "Salvar alterações" : "Cadastrar produto"}
          </Button>
          <SheetClose render={<Button variant="outline">Fechar</Button>} />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default ProductSheet;
