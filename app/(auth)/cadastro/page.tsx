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
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { RegisterFormErrors } from "../schemas/RegisterSchema";

type RegisterForm = {
  nomeLoja: string;
  ramoLoja: string;
  email: string;
  senha: string;
};

type Ramo = {
  id: number;
  nome: string;
};

const ramos: Ramo[] = [
  { id: 1, nome: "Alimentos e Bebidas" },
  { id: 2, nome: "Automotivo" },
  { id: 3, nome: "Beleza e Cosméticos" },
  { id: 4, nome: "Brinquedos e Jogos" },
  { id: 5, nome: "Casa e Decoração" },
  { id: 6, nome: "Calçados e Acessórios" },
  { id: 7, nome: "Eletrônicos e Tecnologia" },
  { id: 8, nome: "Esportes e Fitness" },
  { id: 9, nome: "Informática" },
  { id: 10, nome: "Livros e Papelaria" },
  { id: 11, nome: "Moda e Vestuário" },
  { id: 12, nome: "Móveis" },
  { id: 13, nome: "Pet Shop" },
  { id: 14, nome: "Saúde e Bem-estar" },
  { id: 15, nome: "Outros" },
];


const Cadastro = () => {
  const [form, setForm] = useState<RegisterForm>({
    nomeLoja: "",
    ramoLoja: "",
    email: "",
    senha: "",
  });
  const [errors, setErrors] = useState<RegisterFormErrors>({});

  async function validaUsuario({
    nomeLoja,
    ramoLoja,
    email,
    senha,
  }: RegisterForm) {
    // implementar validação do usuário
  }

  return (
    <main className="flex h-screen w-full items-center justify-center bg-red-50">
      <Card className="w-full max-w-sm justify-center">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Sothos</CardTitle>
          <CardDescription>Realize o seu cadastro!</CardDescription>
        </CardHeader>

        <CardContent>
          <form>
            <div className="flex flex-col gap-6 mt-3">
              <Field>
                <div className="grid gap-2">
                  <FieldLabel className="text-md">Nome da Loja</FieldLabel>
                  <Input
                    className="p-4"
                    value={form.nomeLoja}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, nomeLoja: e.target.value }))
                    }
                    aria-invalid={!!errors.nomeLoja}
                  />
                  {errors.nomeLoja && (
                    <FieldDescription className="text-destructive">
                      {errors.nomeLoja}
                    </FieldDescription>
                  )}
                </div>
              </Field>

              <Field>
                <div className="grid gap-2">
                  <FieldLabel className="text-md">Ramo da Loja</FieldLabel>
                  <Combobox
                    items={ramos}
                    value={form.ramoLoja}
                    onValueChange={(value) =>
                      setForm((prev) => ({
                        ...prev,
                        ramoLoja: value as string,
                      }))
                    }
                  >
                    <ComboboxInput placeholder="Selecione o ramo de sua loja" />
                    <ComboboxContent>
                      <ComboboxEmpty>Nenhum ramo disponível</ComboboxEmpty>
                      <ComboboxList>
                        {(ramo) => (
                          <ComboboxItem key={ramo.id} value={ramo.nome}>
                            {ramo.nome}
                          </ComboboxItem>
                        )}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                  {errors.ramoLoja && (
                    <FieldDescription className="text-destructive">
                      {errors.ramoLoja}
                    </FieldDescription>
                  )}
                </div>
              </Field>

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
                    <FieldLabel className="text-md" htmlFor="password">
                      Senha
                    </FieldLabel>
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
            <div className="flex items-center mt-4 gap-3"></div>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button
            className="w-full text-lg p-6 cursor-pointer"
            onClick={() => validaUsuario(form)}
          >
            Criar Conta
          </Button>
          <div className="flex items-center gap-4 py-3 text-center">
            <span>Já tem uma conta? </span>
            <a
              href="/login"
              className="text-sm text-primary underline-offset-4 hover:underline"
            >
              Clique aqui
            </a>
          </div>
        </CardFooter>
      </Card>
    </main>
  );
};

export default Cadastro;
