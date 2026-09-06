"use client";
//IMPORTS DOS COMPONENTES DO SHADCN
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { passwordSchema, PasswordFormErrors } from "../schemas/PasswordSchema";

type PasswordForm = {
  novaSenha: string;
  confirmarSenha: string;
};

const Password = () => {
  const [form, setForm] = useState<PasswordForm>({
    novaSenha: "",
    confirmarSenha: "",
  });
  const [errors, setErrors] = useState<PasswordFormErrors>({});

  async function validaSenha({ novaSenha, confirmarSenha }: PasswordForm) {
    // implementar validação do usuário
  }

  return (
    <main className="flex h-screen w-full items-center justify-center bg-red-50">
      <Card className="w-full max-w-sm justify-center">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Sothos</CardTitle>
          <CardDescription>Cadastre uma nova senha</CardDescription>
        </CardHeader>

        <CardContent>
          <form>
            <div className="flex flex-col gap-6 mt-3">
              <Field>
                <div className="grid gap-2">
                  <FieldLabel className="text-md" htmlFor="email">
                    Digite uma nova senha
                  </FieldLabel>
                  <Input
                    type="password"
                    className="p-4"
                    placeholder="*********"
                    value={form.novaSenha}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        novaSenha: e.target.value,
                      }))
                    }
                    aria-invalid={!!errors.novaSenha}
                  />
                  <FieldDescription
                    className={
                      errors.novaSenha ? "text-destructive" : undefined
                    }
                  >
                    {errors.novaSenha ??
                      "Sua senha deve conter pelo menos 6 caracteres e um caracter especial"}
                  </FieldDescription>
                </div>
              </Field>

              <div className="grid gap-2">
                <Field>
                  <FieldLabel className="text-md">
                    Confirme sua senha
                  </FieldLabel>
                  <div className="relative">
                    <Input
                      className="p-4"
                      type="password"
                      placeholder="*********"
                      value={form.confirmarSenha}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          confirmarSenha: e.target.value,
                        }))
                      }
                      aria-invalid={!!errors.confirmarSenha}
                    />
                    {errors.confirmarSenha && (
                      <FieldDescription className="text-destructive">
                        {errors.confirmarSenha}
                      </FieldDescription>
                    )}
                  </div>
                </Field>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button
            className="w-full text-lg p-6 cursor-pointer"
            onClick={() => validaSenha(form)}
          >
            Alterar Senha
          </Button>
          <a
            href="/login"
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            Voltar para o login
          </a>
        </CardFooter>
      </Card>
    </main>
  );
};

export default Password;
