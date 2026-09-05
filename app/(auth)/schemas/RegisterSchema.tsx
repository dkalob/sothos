import { z } from "zod";

export const registerSchema = z.object({
  email: z.email("Email Inválido"),
  senha: z
    .string()
    .trim()
    .min(6, "Deve possuir pelo menos 6 caracteres")
    .regex(/[^A-Za-z0-9]/, "Deve possuir pelo menos um caractere especial"),
  nomeLoja: z.string().min(1, "Nome da loja é obrigatório"),
  ramoLoja: z.string().min(1, "Ramo da loja é obrigatório"),
});


export type RegisterFormErrors = Partial<
  Record<keyof z.infer<typeof registerSchema>, string>
>;
