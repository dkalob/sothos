"use client";

import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { useEffect, useState } from "react";
import { useLocalidades } from "@/hooks/use-localidades";
import { ClienteFormErrors } from "../ClienteSchema";
import { Button } from "@/components/ui/button";
import { PencilIcon, CheckIcon, XIcon } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

// TIPAGEM DOS FORMS PARA O BANCO
type ClienteForm = {
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  estado: string;
  cidade: string;
  aceita_marketing: boolean;
};

const initialForm: ClienteForm = {
  nome: "",
  email: "",
  telefone: "",
  cpf: "",
  estado: "",
  cidade: "",
  aceita_marketing: true,
};

const inputStyle = `
  h-10
  rounded-lg
  border-0
  border-b
  border-border/60
  bg-muted/30
  px-3
  shadow-none
  outline-none
  ring-0
  transition-colors
  placeholder:text-muted-foreground/50
  focus:border-primary
  focus:bg-muted/50
  focus-visible:ring-0
  focus-visible:ring-offset-0
`;

// PROPS PARA CADA UM DOS INPUTS
interface FormFieldProps {
  label: string;
  value: string;
  edit: boolean;
  error?: string;
  placeholder?: string;
  type?: string;
  onChange?: (value: string) => void;
}

const FormField = ({
  label,
  value,
  edit,
  error,
  placeholder,
  type = "text",
  onChange,
}: FormFieldProps) => {
  return (
    <Field>
      <FieldLabel className="text-sm font-medium">{label}</FieldLabel>

      {edit ? (
        <>
          <Input
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            type={type}
            aria-invalid={!!error}
            className={inputStyle}
          />
          <FieldDescription
            className={error ? "mt-1 text-destructive" : "mt-1"}
          >
            {error}
          </FieldDescription>
        </>
      ) : (
        <p className="text-sm text-foreground py-2">
          {value || (
            <span className="text-muted-foreground">Não informado</span>
          )}
        </p>
      )}
    </Field>
  );
};

const FormCard = () => {
  const [form, setForm] = useState<ClienteForm>(initialForm);
  const [errors, setErrors] = useState<ClienteFormErrors>({});
  const [edit, setEdit] = useState(false);

  // Guarda os dados antes de entrar em modo edição,
  // pra dar pra restaurar caso o usuário cancele
  const [snapshot, setSnapshot] = useState<ClienteForm>(initialForm);

  const { estados, cidades, carregarEstados, carregarCidades, setCidades } =
    useLocalidades();

  useEffect(() => {
    carregarEstados();
  }, []);

  useEffect(() => {
    setCidades([]);
    setForm((prev) => ({ ...prev, cidade: "" }));

    if (!form.estado) return;

    carregarCidades(form.estado);
  }, [form.estado]);

  function iniciarEdicao() {
    setSnapshot(form); // guarda o estado atual antes de editar
    setEdit(true);
  }

  function cancelarEdicao() {
    setForm(snapshot); // restaura o estado salvo
    setErrors({});
    setEdit(false);
  }

  function salvarEdicao() {
    // TODO: validar campos aqui antes de salvar (setErrors se inválido)
    editarCliente();
    
    setEdit(false);
  }

  function editarCliente() {}

  return (
    <div className="bg-primary-foreground p-4 rounded-lg shadow-sm">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Dados</h1>

        {edit ? (
          <div className="flex gap-2">
            <Button variant="ghost" onClick={cancelarEdicao}>
              <XIcon />
              Cancelar
            </Button>
            <Button variant="default" onClick={salvarEdicao}>
              <CheckIcon />
              Salvar
            </Button>
          </div>
        ) : (
          <HoverCard>
            <HoverCardTrigger
              delay={10}
              closeDelay={100}
              render={
                <Button variant="ghost" onClick={iniciarEdicao}>
                  <PencilIcon />
                </Button>
              }
            />
            <HoverCardContent className="w-fit px-2 py-1 text-xs">Editar</HoverCardContent>
          </HoverCard>
        )}
      </div>

      <div className="flex flex-col gap-8 px-4 py-2 mt-2">
        {/* SEÇÃO: DADOS PESSOAIS */}
        <div className="flex flex-col gap-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Dados Pessoais
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Nome"
              value={form.nome}
              edit={edit}
              error={errors.nome}
              placeholder="Ana"
              onChange={(value) =>
                setForm((prev) => ({ ...prev, nome: value }))
              }
            />
            <FormField
              label="Email"
              value={form.email}
              edit={edit}
              error={errors.email}
              placeholder="ana@email.com"
              type="email"
              onChange={(value) =>
                setForm((prev) => ({ ...prev, email: value }))
              }
            />
            <FormField
              label="Telefone"
              value={form.telefone}
              edit={edit}
              error={errors.telefone}
              placeholder="(11) 99999-9999"
              type="tel"
              onChange={(value) =>
                setForm((prev) => ({ ...prev, telefone: value }))
              }
            />
            <FormField
              label="CPF"
              value={form.cpf}
              edit={edit}
              error={errors.cpf}
              placeholder="123.456.789-00"
              onChange={(value) => setForm((prev) => ({ ...prev, cpf: value }))}
            />
          </div>
        </div>

        {/* SEÇÃO: LOCALIZAÇÃO */}
        <div className="flex flex-col gap-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Localização
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {edit ? (
              <>
                <Field>
                  <FieldLabel className="text-sm font-medium">
                    Estado
                  </FieldLabel>
                  <Combobox
                    items={estados}
                    value={form.estado}
                    onValueChange={(value) =>
                      setForm((prev) => ({ ...prev, estado: value as string }))
                    }
                  >
                    <ComboboxInput
                      placeholder="Selecione um estado"
                      className={inputStyle}
                    />
                    <ComboboxContent>
                      <ComboboxEmpty>Nenhum estado encontrado</ComboboxEmpty>
                      <ComboboxList>
                        {(estado) => (
                          <ComboboxItem key={estado.id} value={estado.sigla}>
                            {estado.nome}
                          </ComboboxItem>
                        )}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                </Field>

                <Field>
                  <FieldLabel className="text-sm font-medium">
                    Cidade
                  </FieldLabel>
                  <Combobox
                    items={cidades}
                    value={form.cidade}
                    onValueChange={(value) =>
                      setForm((prev) => ({ ...prev, cidade: value as string }))
                    }
                    disabled={!form.estado}
                  >
                    <ComboboxInput
                      placeholder="Selecione uma cidade"
                      className={inputStyle}
                    />
                    <ComboboxContent>
                      <ComboboxEmpty>Nenhuma cidade encontrada</ComboboxEmpty>
                      <ComboboxList>
                        {(cidade) => (
                          <ComboboxItem key={cidade.id} value={cidade.nome}>
                            {cidade.nome}
                          </ComboboxItem>
                        )}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                </Field>
              </>
            ) : (
              <>
                <Field>
                  <FieldLabel className="text-sm font-medium">
                    Estado
                  </FieldLabel>
                  <p className="text-sm text-foreground py-2">
                    {form.estado || (
                      <span className="text-muted-foreground">
                        Não informado
                      </span>
                    )}
                  </p>
                </Field>
                <Field>
                  <FieldLabel className="text-sm font-medium">
                    Cidade
                  </FieldLabel>
                  <p className="text-sm text-foreground py-2">
                    {form.cidade || (
                      <span className="text-muted-foreground">
                        Não informado
                      </span>
                    )}
                  </p>
                </Field>
              </>
            )}
          </div>
        </div>

        {/* SEÇÃO: PREFERÊNCIAS */}
        <div className="flex flex-col gap-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Preferências
          </p>

          <div className="flex items-center justify-between rounded-lg bg-muted/30 px-4 py-3">
            <div className="flex flex-col">
              <Label
                htmlFor="aceita-marketing"
                className="cursor-pointer text-sm font-medium"
              >
                Aceita receber campanhas
              </Label>
              <span className="text-xs text-muted-foreground">
                Promoções e novidades por email
              </span>
            </div>
            <Switch
              id="aceita-marketing"
              checked={form.aceita_marketing}
              disabled={!edit}
              onCheckedChange={(checked) =>
                setForm((prev) => ({ ...prev, aceita_marketing: checked }))
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormCard;
