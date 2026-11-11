import { z } from "zod";

export const telefoneSchema = z.object({
  nome: z.string().trim().min(3, "O nome deve ter pelo menos 3 letras"),
  numero: z
    .string()
    .regex(/^\d{10,11}$/, "Informe o DDD e o número (10 ou 11 dígitos)"),
});

export type TelefoneFormErrors = Partial<
  Record<keyof z.infer<typeof telefoneSchema>, string>
>;

// 11912345678 → (11) 91234-5678
export function formatarTelefone(numero: string) {
  const d = numero.replace(/\D/g, "");

  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}