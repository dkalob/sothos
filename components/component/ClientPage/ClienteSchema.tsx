import { z } from "zod";

export const clienteSchema = z.object({
  nome: z.string().trim().min(3, "Nome deve ter pelo menos 3 letras"),
  email: z.string().trim().email("Email Inválido"),
  telefone: z
    .string()
    .trim()
    .min(1, "Telefone é obrigatório")
    .regex(/^\d{10,11}$/, "Telefone deve ter 10 ou 11 dígitos"),
  cpf: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || val.length === 11, "CPF deve ter 11 dígitos"),
  estado: z.string().trim().min(1, "Selecione um estado"),
  cidade: z.string().trim().min(1, "Selecione uma cidade"),
});

export type ClienteFormErrors = Partial<
  Record<keyof z.infer<typeof clienteSchema>, string>
>;
