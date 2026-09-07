"use client";

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
import { recoverySchema, RecoveryFormErrors } from "../schemas/RecoverySchema";
import { apiPost } from "@/lib/api";

const RecuperarSenha = () => {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<RecoveryFormErrors>({});
  const [carregando, setCarregando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erroGeral, setErroGeral] = useState("");

  async function solicitarRecuperacao() {
    setErroGeral("");
    setErrors({});

    const resultado = recoverySchema.safeParse({ email });

    if (!resultado.success) {
      const novosErros: RecoveryFormErrors = {};
      resultado.error.issues.forEach((issue) => {
        const campo = issue.path[0] as "email";
        if (!novosErros[campo]) novosErros[campo] = issue.message;
      });
      setErrors(novosErros);
      return;
    }

    setCarregando(true);

    try {
      await apiPost("/auth/recuperar-senha", { email });
      setEnviado(true);
    } catch (erro) {
      setErroGeral(
        erro instanceof Error ? erro.message : "Erro ao solicitar recuperação"
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
          <CardDescription>
            {enviado
              ? "Verifique seu email"
              : "Informe seu email para recuperar a senha"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {enviado ? (
            <p className="text-center text-sm text-muted-foreground">
              Se este email estiver cadastrado, você receberá as instruções para
              redefinir sua senha. O link expira em 1 hora.
            </p>
          ) : (
            <div className="flex flex-col gap-6 mt-3">
              <Field>
                <div className="grid gap-2">
                  <FieldLabel className="text-md" htmlFor="email">
                    Email
                  </FieldLabel>
                  <Input
                    id="email"
                    className="p-4"
                    placeholder="m@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={!!errors.email}
                  />
                  {errors.email && (
                    <FieldDescription className="text-destructive">
                      {errors.email}
                    </FieldDescription>
                  )}
                </div>
              </Field>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex-col gap-2">
          {!enviado && (
            <>
              <Button
                className="w-full text-lg p-6 cursor-pointer"
                onClick={solicitarRecuperacao}
                disabled={carregando}
              >
                {carregando ? "Enviando..." : "Enviar link"}
              </Button>
              {erroGeral && (
                <p className="text-sm text-destructive text-center">
                  {erroGeral}
                </p>
              )}
            </>
          )}
          <div className="flex items-center gap-4 py-3 text-center">
            <span>Lembrou a senha? </span>
            <a
              href="/login"
              className="text-sm text-primary underline-offset-4 hover:underline"
            >
              Entrar
            </a>
          </div>
        </CardFooter>
      </Card>
    </main>
  );
};

export default RecuperarSenha;