import { z } from "zod";

export const TIPOS_CARACTERISTICA = ["TEXTO", "NUMERO", "BOOLEANO", "OPCAO"] as const;

export type TipoCaracteristica = (typeof TIPOS_CARACTERISTICA)[number];

export const caracteristicaSchema = z
  .object({
    nome: z
      .string()
      .trim()
      .min(1, "Nome da característica é obrigatório")
      .max(100, "Nome muito longo"),
    tipo: z.enum(TIPOS_CARACTERISTICA, {
      message: "Selecione um tipo válido",
    }),
    opcoes: z.array(z.string().trim().min(1)).optional(),
  })
  .refine(
    (data) => {
      if (data.tipo === "OPCAO") {
        return !!data.opcoes && data.opcoes.length > 0;
      }
      return true;
    },
    {
      message: "Características do tipo Opção precisam de ao menos uma opção",
      path: ["opcoes"],
    },
  );

export type CaracteristicaFormErrors = Partial<
  Record<"nome" | "tipo" | "opcoes", string>
>;

export type Caracteristica = {
  id: string;
  nome: string;
  tipo: TipoCaracteristica;
  ativo: boolean;
  opcoes: string[];
};