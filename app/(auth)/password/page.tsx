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
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { passwordSchema, PasswordFormErrors } from "../schemas/PasswordSchema";
import { apiPost } from "@/lib/api";

type PasswordForm = {
  novaSenha: string;
  confirmarSenha: string;
};

const PasswordForm = () => {
  const [form, setForm] = useState<PasswordForm>({
    novaSenha: "",
    confirmarSenha: "",
  });
  const [errors, setErrors] = useState<PasswordFormErrors>({});
  const [carregando, setCarregando] = useState(false);
  const [erroGeral, setErroGeral] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");  

  async function validaSenha(dados: PasswordForm) {
    setErroGeral("");
    setErrors({});

    if (!token) {
      setErroGeral("Link inválido. Solicite a recuperação novamente.");
      return;
    }

    const resultado = passwordSchema.safeParse(dados);

    if (!resultado.success) {
      const novosErros: PasswordFormErrors = {};
      resultado.error.issues.forEach((issue) => {
        const campo = issue.path[0] as keyof PasswordForm;
        if (!novosErros[campo]) novosErros[campo] = issue.message;
      });
      setErrors(novosErros);
      return;
    }

    setCarregando(true);

    try {
      await apiPost("/auth/redefinir-senha", {
        token,
        senha: dados.novaSenha,
      });
      setSucesso(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (erro) {
      setErroGeral(
        erro instanceof Error ? erro.message : "Erro ao alterar senha"
      );
    } finally {
      setCarregando(false);
    }
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
          {sucesso ? (
            <p className="text-sm text-center">
              Senha alterada com sucesso. Redirecionando para o login...
            </p>
          ) : (
            <>
              <Button
                className="w-full text-lg p-6 cursor-pointer"
                onClick={() => validaSenha(form)}
                disabled={carregando}
              >
                {carregando ? "Alterando..." : "Alterar Senha"}
              </Button>
              {erroGeral && (
                <p className="text-sm text-destructive text-center">
                  {erroGeral}
                </p>
              )}
            </>
          )}
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

const Password = () => (
  <Suspense fallback={<div />}>
    <PasswordForm />
  </Suspense>
);

export default Password;