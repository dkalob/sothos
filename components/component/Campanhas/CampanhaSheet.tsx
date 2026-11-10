"use client";

import { useEffect, useState } from "react";
import { Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { apiGet, apiPost, apiPut } from "@/lib/api";
import { useToken } from "@/hooks/use-token";
import GrupoClienteCombobox from "@/components/component/GrupoClienteComboBox";
import { CampanhaFormErrors, campanhaSchema } from "./CampanhaSchema";
import MensagemCombobox from "../MensagensComboBox";

interface CampanhaSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campanhaId?: string | null;          
  onCampanhaSalva: () => void | Promise<void>;   
}

export type CampanhaDetalhe = {
  id: string;
  titulo: string;
  tipo: "EMAIL" | "WHATSAPP";
  status: string;
  agendadaPara: string | null;
  criadoEm: string;
  grupoId: string | null;
  mensagemId: string | null;
  grupo: { id: string; nome: string } | null;
  mensagem: {
    id: string;
    titulo: string;
    tom: string;
    objetivo: string;
    assunto: string | null;
    conteudo: string;
    textoBotao: string | null;
    imagemUrl: string | null;
    produto: { nome: string } | null;
  } | null;
  _count: { clientes: number };
};

type CampanhaForm = {
  titulo: string;
  tipo: "" | "EMAIL" | "WHATSAPP";
  mensagem: string;
  grupo: string;
  agendadoPara: string;
};

const initialForm: CampanhaForm = {
  titulo: "",
  tipo: "",
  mensagem: "",
  grupo: "",
  agendadoPara: "",
};

const TIPOS = [
  { value: "EMAIL", label: "E-mail", icon: Mail },
  { value: "WHATSAPP", label: "WhatsApp", icon: MessageCircle },
] as const;

// valor mínimo do input de data: agora, no fuso do usuário
function agoraLocal() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

// converte a data do banco (UTC) para o formato do input datetime-local
function paraInputLocal(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

const Rotulo = ({ children }: { children: React.ReactNode }) => (
  <div className="flex gap-0.5">
    <FieldLabel>{children}</FieldLabel>
    <span className="text-destructive">*</span>
  </div>
);


const CampanhaSheet = ({
  open,
  onOpenChange,
  campanhaId,
  onCampanhaSalva,
}: CampanhaSheetProps) => {
  const [form, setForm] = useState<CampanhaForm>(initialForm);
  const [errors, setErrors] = useState<CampanhaFormErrors>({});
  const [salvando, setSalvando] = useState(false);
  const [nomeGrupoSelecionado, setNomeGrupoSelecionado] = useState("");
  const [carregando, setCarregando] = useState(false);
  const editando = !!campanhaId;

  const token = useToken();

  // Trocar o tipo muda a lista de mensagens, então a escolhida anterior sai
  function selecionarTipo(tipo: "EMAIL" | "WHATSAPP") {
    setForm((prev) => ({ ...prev, tipo, mensagem: "" }));
  }

  async function cadastrarCampanha() {
    const result = campanhaSchema.safeParse(form);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        titulo: fieldErrors.titulo?.[0],
        tipo: fieldErrors.tipo?.[0],
        mensagem: fieldErrors.mensagem?.[0],
        grupo: fieldErrors.grupo?.[0],
        agendadoPara: fieldErrors.agendadoPara?.[0],
      });
      return;
    }

    setErrors({});
    setSalvando(true);

    try {
      const corpo = {
        titulo: form.titulo.trim(),
        tipo: form.tipo,
        mensagemId: form.mensagem,
        grupoId: form.grupo,
        agendadaPara: new Date(form.agendadoPara).toISOString(),
      };

      if (editando) {
        await apiPut(`/campanhas/${campanhaId}`, corpo, token ?? undefined);
      } else {
        await apiPost("/campanhas", corpo, token ?? undefined);
      }

      toast.add({
        title: editando ? "Campanha atualizada com sucesso!" : "Campanha cadastrada com sucesso!",
        type: "success",
      });
      onOpenChange(false);
      setForm(initialForm);
      await onCampanhaSalva();
    } catch (erro) {
      toast.add({
        title:
          erro instanceof Error
            ? erro.message
            : "Não foi possível cadastrar a campanha",
        type: "error",
      });
    } finally {
      setSalvando(false);
    }
  }

  // Ao abrir: limpa o formulário (nova) ou carrega os dados (edição)
  useEffect(() => {
    if (!open) return;

    setErrors({});

    if (!campanhaId) {
      setForm(initialForm);
      return;
    }

    if (!token) return;

    let cancelado = false;
    setCarregando(true);

    apiGet<CampanhaDetalhe>(`/campanhas/${campanhaId}`, token)
      .then((c) => {
        if (cancelado) return;
        setForm({
          titulo: c.titulo,
          tipo: c.tipo,
          mensagem: c.mensagemId ?? "",
          grupo: c.grupoId ?? "",
          agendadoPara: paraInputLocal(c.agendadaPara),
        });
      })
      .catch(() =>
        toast.add({ title: "Não foi possível carregar a campanha", type: "error" }),
      )
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [open, campanhaId, token]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{editando ? "Editar Campanha" : "Adicionar Campanha"}</SheetTitle>
          <SheetDescription>
            {editando ? "Altere os campos e salve." : "Preencha os campos para cadastrar uma campanha."}
          </SheetDescription>
        </SheetHeader>

        <div className={`grid flex-1 auto-rows-min gap-6 overflow-y-auto px-4 ${carregando ? "pointer-events-none opacity-50" : ""}`}>
          {/* TÍTULO */}
          <Field>
            <Rotulo>Título</Rotulo>
            <Input
              placeholder="Dia das mães"
              value={form.titulo}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, titulo: e.target.value }))
              }
              aria-invalid={!!errors.titulo}
            />
            <FieldDescription
              className={errors.titulo ? "text-destructive" : undefined}
            >
              {errors.titulo ?? "Esse campo deve ser preenchido"}
            </FieldDescription>
          </Field>

          {/* TIPO */}
          <Field>
            <Rotulo>Tipo da campanha</Rotulo>
            <div className="grid grid-cols-2 gap-3">
              {TIPOS.map(({ value, label, icon: Icon }) => (
                <Button
                  key={value}
                  type="button"
                  variant={form.tipo === value ? "default" : "outline"}
                  onClick={() => selecionarTipo(value)}
                >
                  <Icon className="size-4" />
                  {label}
                </Button>
              ))}
            </div>
            <FieldDescription
              className={errors.tipo ? "text-destructive" : undefined}
            >
              {errors.tipo ?? "Escolha por onde a mensagem será enviada"}
            </FieldDescription>
          </Field>

          {/* MENSAGEM (depende do tipo) */}
          <Field>
            <Rotulo>Mensagem</Rotulo>
            <MensagemCombobox
              key={form.tipo}
              tipo={form.tipo}
              value={form.mensagem}
              onChange={(id) => setForm((prev) => ({ ...prev, mensagem: id }))}
            />
            <FieldDescription
              className={errors.mensagem ? "text-destructive" : undefined}
            >
              {errors.mensagem ?? ""}
            </FieldDescription>
          </Field>

          {/* GRUPO */}
          <Field>
            <Rotulo>Grupo de clientes</Rotulo>
            <GrupoClienteCombobox
              value={form.grupo}
              onChange={(id) => setForm((prev) => ({ ...prev, grupo: id }))}
              onNomeChange={setNomeGrupoSelecionado}
            />
            <FieldDescription
              className={errors.grupo ? "text-destructive" : undefined}
            >
              {errors.grupo ?? "Quem receberá a campanha"}
            </FieldDescription>
          </Field>

          {/* DATA E HORA */}
          <Field>
            <Rotulo>Data e hora do disparo</Rotulo>
            <Input
              type="datetime-local"
              min={agoraLocal()}
              value={form.agendadoPara}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, agendadoPara: e.target.value }))
              }
              aria-invalid={!!errors.agendadoPara}
            />
            <FieldDescription
              className={errors.agendadoPara ? "text-destructive" : undefined}
            >
              {errors.agendadoPara ?? "Quando a campanha deve ser enviada"}
            </FieldDescription>
          </Field>
        </div>

        <SheetFooter>
          <Button onClick={cadastrarCampanha} disabled={salvando || carregando}>
            {salvando ? "Salvando..." : editando ? "Salvar alterações" : "Salvar campanha"}
          </Button>
          <SheetClose render={<Button variant="outline">Fechar</Button>} />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default CampanhaSheet;