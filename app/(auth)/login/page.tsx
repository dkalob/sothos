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
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { loginSchema, LoginFormErrors } from "../schemas/LoginSchema";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api";

type LoginForm = {
  email: string;
  senha: string;
};

const Login = () => {
  const [form, setForm] = useState<LoginForm>({ email: "", senha: "" });
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [carregando, setCarregando] = useState(false);
  const [erroGeral, setErroGeral] = useState("");
  const router = useRouter();

  async function validaUsuario(dados: LoginForm) {
    setErroGeral("");
    setErrors({});

    const resultado = loginSchema.safeParse(dados);

    if (!resultado.success) {
      const novosErros: LoginFormErrors = {};
      resultado.error.issues.forEach((issue) => {
        const campo = issue.path[0] as keyof LoginForm;
        if (!novosErros[campo]) novosErros[campo] = issue.message;
      });
      setErrors(novosErros);
      return;
    }

    setCarregando(true);

    try {
      const resposta = await apiPost<{ token: string; usuario: unknown }>(
        "/auth/login",
        { email: dados.email, senha: dados.senha }
      );

      localStorage.setItem("sothos_token", resposta.token);
      localStorage.setItem("sothos_usuario", JSON.stringify(resposta.usuario));

      router.push("/clientes");
    } catch (erro) {
      setErroGeral(
        erro instanceof Error ? erro.message : "Erro ao entrar"
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
          <CardDescription>Bem-vindo de volta!</CardDescription>
        </CardHeader>

        <CardContent>
          <form>
            <div className="flex flex-col gap-6 mt-3">
              <Field>
                <div className="grid gap-2">
                  <FieldLabel className="text-md" htmlFor="email">
                    Email
                  </FieldLabel>
                  <Input
                    className="p-4"
                    placeholder="m@email.com"
                    value={form.email}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                    aria-invalid={!!errors.email}
                  />
                  {errors.email && (
                    <FieldDescription className="text-destructive">
                      {errors.email}
                    </FieldDescription>
                  )}
                </div>
              </Field>
              
              <div className="grid gap-2">
                <Field>
                  <div className="flex items-center">
                    <FieldLabel className="text-md" htmlFor="password">
                      Senha
                    </FieldLabel>
                    <a
                      href="recuperar-senha"
                      className="ml-auto inline-block text-sm text-primary underline-offset-4 hover:underline"
                    >
                      Esqueceu sua senha?
                    </a>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      className="p-4"
                      type="password"
                      placeholder="*******"
                      value={form.senha}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, senha: e.target.value }))
                      }
                      aria-invalid={!!errors.senha}
                    />
                    {errors.senha && (
                    <FieldDescription className="text-destructive">
                      {errors.senha}
                    </FieldDescription>
                  )}
                </div>
              </Field>
              </div>
            </div>
            <div className="flex items-center mt-4 gap-3">
              <Checkbox
                className="cursor-pointer"
                id="toggle-checkbox"
                name="toggle-checkbox"
              />
              <span>Permanecer conectado</span>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button
            className="w-full text-lg p-6 cursor-pointer"
            onClick={() => validaUsuario(form)}
            disabled={carregando}
          >
            {carregando ? "Entrando..." : "Entrar"}
          </Button>
          {erroGeral && (
            <p className="text-sm text-destructive text-center">{erroGeral}</p>
          )}
          <div className="flex items-center gap-4 py-3 text-center">
            <span>Não tem uma conta? </span>
            <a
              href="/cadastro"
              className="text-sm text-primary underline-offset-4 hover:underline"
            >
              Cadastre-se
            </a>
          </div>
        </CardFooter>
      </Card>
    </main>
  );
};

export default Login;
