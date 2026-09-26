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
import { ProdutoFormErrors, produtoSchema } from "./ProductSchema";
import { useToken } from "@/hooks/use-token";
import { apiPost } from "@/lib/api";
import { toast } from "@/components/ui/toast";
import CategoriaCombobox from "../CategoriaComboBox";
import { Switch } from "@/components/ui/switch";
import { ImagePlus } from "lucide-react";
import { uploadImagem } from "@/lib/cloudinary";

interface ProductSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProdutoCadastrado: () => void;
}

type ProdutoForm = {
  imagem: File | null;
  nome: string;
  categoriaId: string;
  preco: string;
  sku: string;
  ativo: boolean;
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
}: ProductSheetProps) => {
  const [form, setForm] = useState<ProdutoForm>(initialForm);
  const [errors, setErrors] = useState<ProdutoFormErrors>({});
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!form.imagem) {
      setImagemPreview(null);
      return;
    }

    const url = URL.createObjectURL(form.imagem);
    setImagemPreview(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [form.imagem]);

  const token = useToken();

  async function cadastrarProduto() {
    const result = produtoSchema.safeParse({
      imagem: form.imagem,
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

    try {
      let imagemUrl = "";

      if (form.imagem) {
        imagemUrl = await uploadImagem(form.imagem);
      }

      await apiPost(
        "/produtos",
        {
          imagem: imagemUrl,
          nome: form.nome,
          categoriaId: form.categoriaId,
          preco: form.preco,
          sku: form.sku,
          ativo: form.ativo,
        },
        token ?? undefined,
      );

      toast.add({
        title: "Produto cadastrado com sucesso!",
        type: "success",
      });

      onOpenChange(false);
      setForm(initialForm);
      onProdutoCadastrado();
    } catch (error) {
      toast.add({
        title: "Não foi possível cadastrar o produto",
        type: "error",
      });
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Adicionar Produto</SheetTitle>
          <SheetDescription>
            Preencha os campos para cadastrar um produto.
          </SheetDescription>
        </SheetHeader>
        <div className="grid flex-1 auto-rows-min gap-6 px-4">
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
                value={form.categoriaId}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    categoriaId: value,
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
        </div>
        <SheetFooter>
          <Button onClick={cadastrarProduto}>Cadastrar produto</Button>
          <SheetClose render={<Button variant="outline">Fechar</Button>} />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default ProductSheet;
