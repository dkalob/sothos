import { z } from "zod";

export const produtoSchema = z.object({
  imagem: z
    .instanceof(File, { message: "Imagem é obrigatória" })
    .refine(
      (file) =>
        ["image/jpeg", "image/png", "image/webp"].includes(file.type),
      "A imagem deve ser JPG, PNG ou WEBP",
    )
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      "A imagem deve ter no máximo 5 MB",
    ),
  nome: z.string().trim().min(3, "Nome deve ter pelo menos 3 letras"),
  categoriaId: z.string().uuid("Selecione uma categoria"),
  preco: z
    .string()
    .trim()
    .min(1, "Preço é obrigatório")
    .transform((valor) => Number(valor.replace(",", ".")))
    .refine((valor) => !Number.isNaN(valor), "Preço inválido")
    .refine((valor) => valor > 0, "Preço deve ser maior que zero"),
  sku: z.string().trim(),
  ativo: z.boolean(),
});

export type ProdutoFormErrors = Partial<
  Record<keyof z.infer<typeof produtoSchema>, string>
>;
