import { z } from "zod";

export const whatsappSchema = z.object({
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

export type WhatsappFormErrors = Partial<
  Record<keyof z.infer<typeof whatsappSchema>, string>
>;