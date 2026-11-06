import { z } from "zod";

export const emailSchema = z.object({
  produto: z
    .string()
    .trim()
    .min(1, "Produto é obrigatório"),

  tom: z
    .string()
    .trim()
    .nullable()
    .refine((value) => !!value, "Tom é obrigatório"),

  objetivo: z
    .string()
    .trim()
    .nullable()
    .refine((value) => !!value, "Objetivo é obrigatório"),
});

export type EmailFormErrors = Partial<
  Record<keyof z.infer<typeof emailSchema>, string>
>;