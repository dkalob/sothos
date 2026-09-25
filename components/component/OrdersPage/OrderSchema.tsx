import { z } from "zod";

export const orderSchema = z.object({
  cliente: z
    .string()
    .trim()
    .min(3, "Nome deve ter pelo menos 3 letras"),

  produto: z
    .string()
    .trim()
    .min(1, "Produto é obrigatório"),

  valor: z
    .number()
    .min(0.01, "Valor deve ser maior que zero"),

  idPedido: z
    .string()
    .trim()
    .optional(),

  data: z
    .string()
    .min(1, "Data do pedido é obrigatória"),
});

export type OrderFormErrors = Partial<
  Record<keyof z.infer<typeof orderSchema>, string>
>;
