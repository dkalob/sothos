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
import Image from "next/image";
import { loginSchema, LoginFormErrors } from "../schemas/LoginSchema";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api";
import { toast } from "@/components/ui/toast";
import { Eye, EyeOff } from "lucide-react";

type LoginForm = {
  email: string;
  senha: string;
};

const Login = () => {
  const [form, setForm] = useState<LoginForm>({ email: "", senha: "" });
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [carregando, setCarregando] = useState(false);
  const [erroGeral, setErroGeral] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
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
      const resposta = await toast.promise(
        apiPost<{ token: string; usuario: unknown }>("/auth/login", {
          email: dados.email,
          senha: dados.senha,
        }),
        {
          loading: "Entrando..",
          success: "Login realizado com sucesso!",
          error: "Não foi possível entrar.",
        },
      );

      localStorage.setItem("sothos_token", resposta.token);
      localStorage.setItem("sothos_usuario", JSON.stringify(resposta.usuario));

      router.push("/dashboard");
    } catch (erro) {
      setErroGeral(erro instanceof Error ? "Erro ao entrar" : "Erro ao entrar");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="flex h-screen w-full items-center justify-center bg-red-50">
      <Card className="w-full max-w-4xl overflow-hidden">
        <div className="grid min-h-120 grid-cols-2">

          {/* LADO ESQUERDO - ILUSTRAÇÃO */}
          <div className="col-span-1 flex flex-col items-center justify-center">
            <Image
              src="/Marketing-amico.svg"
              alt="Capa"
              width={850}
              height={800}
              className="h-115 w-auto object-contain"
            />
            <a
              href="https://storyset.com/communication"
              className="text-muted-foreground"
            >
              Communication illustrations by Storyset
            </a>
          </div>

          {/* LADO DIREITO - LOGIN */}
          <div className="col-span-1 flex flex-col justify-center px-10 py-8">
            <CardHeader className="text-center">
              <CardTitle>
                <div className="flex justify-center items-center">
                  <Image src="/logo.svg" alt="logo" width={36} height={36} />
                  <span className="font-bold text-primary text-3xl">othos</span>
                </div>
              </CardTitle>

              <CardDescription>Bem-vindo de volta!</CardDescription>
            </CardHeader>

            <CardContent>
              <form>
                <div className="flex flex-col gap-6 mt-3">
                  <Field>
                    <div className="grid gap-2">
                      <FieldLabel htmlFor="email">Email</FieldLabel>
                      <Input
                        id="email"
                        className="p-4"
                        placeholder="m@email.com"
                        value={form.email}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
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

                  <Field>
                    <div className="grid gap-2">
                      <FieldLabel htmlFor="password">Senha</FieldLabel>
                      <div className="relative">
                        <Input
                          id="password"
                          className="p-4"
                          type={mostrarSenha ? "text" : "password"}
                          placeholder="•••••••"
                          value={form.senha}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              senha: e.target.value,
                            }))
                          }
                          aria-invalid={!!errors.senha}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setMostrarSenha(!mostrarSenha)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary cursor-pointer"
                        >
                          {mostrarSenha ? (
                            <EyeOff size={20} />
                          ) : (
                            <Eye size={20} />
                          )}
                        </Button>
                        {errors.senha && (
                          <FieldDescription className="text-destructive">
                            {errors.senha}
                          </FieldDescription>
                        )}
                      </div>
                      <div className="flex items-center mt-2">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            className="cursor-pointer"
                            id="toggle-checkbox"
                            name="toggle-checkbox"
                          />
                          <span className="text-sm">Permanecer conectado</span>
                        </div>

                        <a
                          href="/recuperar-senha"
                          className="ml-auto text-sm text-primary underline-offset-4 hover:underline"
                        >
                          Esqueceu sua senha?
                        </a>
                      </div>
                    </div>
                  </Field>
                </div>
              </form>
            </CardContent>

            <Button
              className="self-center w-80 text-lg p-6 mt-4 cursor-pointer"
              onClick={() => validaUsuario(form)}
              disabled={carregando}
            >
              {carregando ? "Entrando..." : "Entrar"}
            </Button>

            {erroGeral && (
              <p className="text-sm text-destructive text-center">
                {erroGeral}
              </p>
            )}

            <div className="flex justify-center items-center gap-2 py-3 text-center">
              <span className="text-sm">Não tem uma conta?</span>
              <a
                href="/cadastro"
                className="text-sm text-primary underline-offset-4 hover:underline"
              >
                Cadastre-se
              </a>
            </div>
          </div>
        </div>
      </Card>
    </main>
  );
};

export default Login;
