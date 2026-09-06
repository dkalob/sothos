import { z } from "zod";

export const passwordSchema = z
  .object({
    novaSenha: z
      .string()
      .trim()
      .min(6, "Deve possuir pelo menos 6 caracteres")
      .regex(/[^A-Za-z0-9]/, "Deve possuir pelo menos um caractere especial"),
    confirmarSenha: z.string().trim(),
  })
  .refine((data) => data.novaSenha === data.confirmarSenha, {
    message: "As senhas não coincidem",
    path: ["confirmarSenha"], 
  });

export type PasswordFormErrors = Partial<
  Record<keyof z.infer<typeof passwordSchema>, string>
>;
