import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Email Inválido"),
  senha: z
    .string()
    .trim()
    .min(6, "Deve possuir pelo menos 6 caracteres")
    .regex(/[^A-Za-z0-9]/, "Deve possuir pelo menos um caractere especial"),
});

export type LoginFormErrors = Partial<
  Record<keyof z.infer<typeof loginSchema>, string>
>;
