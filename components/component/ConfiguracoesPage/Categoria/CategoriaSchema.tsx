import { z } from "zod";

export const categoriaSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(1, "Nome da categoria é obrigatório")
    .min(3, "Nome deve ter pelo menos 3 letras"),
});

export type CategoriaFormErrors = Partial<
  Record<keyof z.infer<typeof categoriaSchema>, string>
>;

export type Categoria = {
  id: string;
  nome: string;
};
