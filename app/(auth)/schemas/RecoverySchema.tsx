import { z } from "zod";

export const recoverySchema = z.object({
  email: z.email("Email inválido"),
});

export type RecoveryFormErrors = Partial<
  Record<keyof z.infer<typeof recoverySchema>, string>
>;