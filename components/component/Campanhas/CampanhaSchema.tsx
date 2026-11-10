import { z } from "zod";

export const campanhaSchema = z.object({
  titulo: z.string().trim().min(3, "O título deve ter pelo menos 3 letras"),

  tipo: z.enum(["EMAIL", "WHATSAPP"], {
    message: "Selecione o tipo da campanha",
  }),

  mensagem: z.string().min(1, "Selecione uma mensagem"),

  grupo: z.string().min(1, "Selecione um grupo de clientes"),

  agendadoPara: z
    .string()
    .min(1, "Informe a data e a hora do disparo")
    .refine((v) => new Date(v).getTime() > Date.now(), "A data deve ser no futuro"),
});

export type CampanhaFormErrors = Partial<
  Record<keyof z.infer<typeof campanhaSchema>, string>
>;