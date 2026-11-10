"use client";

import PageHeader from "@/components/component/PageHeader";
import ProdutoCombobox from "@/components/component/ProdutoComboBox";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, WandSparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import MoldeCelular from "@/components/component/MoldeCelular";
import BotaoReprocessarImagem from "@/components/component/BotaoReprocessarImagem";
import DicasEngajaento from "@/components/component/DicasEngajamento";
import GrupoClienteCombobox from "@/components/component/GrupoClienteComboBox";
import { apiGet, apiPost, apiPut } from "@/lib/api";
import { useToken } from "@/hooks/use-token";
import { toast } from "@/components/ui/toast";
import { WhatsappFormErrors, whatsappSchema } from "@/components/component/Whatsapp/WhatsappSchema";
import { Input } from "@/components/ui/input";


const Tom = [
  { value: "FORMAL", label: "Formal" },
  { value: "DESCONTRAIDO", label: "Descontraído" },
  { value: "PERSUASIVO", label: "Persuasivo" },
  { value: "DIVERTIDO", label: "Divertido" },
  { value: "PESSOAL", label: "Pessoal" },
];

const Objetivo = [
  { value: "LANCAMENTO", label: "Lançamento" },
  { value: "PROMOCAO", label: "Promoção" },
  { value: "DIVULGACAO", label: "Divulgação" },
  { value: "INDICACAO", label: "Indicação" },
  { value: "ULTIMAS_UNIDADES", label: "Últimas unidades" },
];

type MensagemGerada = {
  id: string;
  titulo: string;
  conteudo: string;
  imagemUrl: string | null;
};

type MensagemCompleta = {
  id: string;
  titulo: string;
  tipo: "EMAIL" | "WHATSAPP";
  tom: string;
  objetivo: string;
  observacoes: string | null;
  assunto: string | null;
  conteudo: string;
  textoBotao: string | null;
  imagemUrl: string | null;
  produtoId: string | null;
};

const Whatsapp = () => {
  const [produtoSelecionado, setProdutoSelecionado] = useState("");
  const [grupoSelecionado, setGrupoSelecionado] = useState("");
  const [nomeGrupoSelecionado, setNomeGrupoSelecionado] = useState("");
  const [tomSelecionado, setTomSelecionado] = useState<string | null>(null);
  const [objetivoSelecionado, setObjetivoSelecionado] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [descricao, setDescricao] = useState("");
  const [titulo, setTitulo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [imagemUrl, setImagemUrl] = useState<string | null>(null);
  const [gerando, setGerando] = useState(false);
  const [mensagemId, setMensagemId] = useState<string | null>(null);
  const [errors, setErrors] = useState<WhatsappFormErrors>({});
  const [mensagemGerada, setMensagemGerada] = useState(false);

  const token = useToken();

  // Carrega a mensagem do editar mensagem na tabela
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("mensagem");
    console.log("efeito de carregar mensagem", { id, temToken: !!token });

    if (!id || !token) return;

    let cancelado = false;

    apiGet<MensagemCompleta>(`/mensagens/${id}`, token)
      .then((m) => {
        if (cancelado) return;

        if (m.tipo !== "WHATSAPP") {
          toast.add({ title: "Esta mensagem é de outro tipo", type: "error" });
          return;
        }

        setMensagemId(m.id);
        setTitulo(m.titulo);                 // o nome do seu state de título
        setProdutoSelecionado(m.produtoId ?? "");
        setTomSelecionado(m.tom);
        setObjetivoSelecionado(m.objetivo);
        setDescricao(m.observacoes ?? "");
        setMensagem(m.conteudo);
        setImagemUrl(m.imagemUrl);
        setMensagemGerada(true);
      })
      .catch((erro) => {
        console.error(erro);
        toast.add({ title: "Não foi possível carregar a mensagem", type: "error" });
      });

    return () => {
      cancelado = true;
    };
  }, [token]);
  

  async function gerarMensagem() {
    
    const result = whatsappSchema.safeParse({
      produto: produtoSelecionado,
      tom: tomSelecionado,
      objetivo: objetivoSelecionado,
    });

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        produto: fieldErrors.produto?.[0],
        tom: fieldErrors.tom?.[0],
        objetivo: fieldErrors.objetivo?.[0],
      });
      return;
    }

    setErrors({});

    setGerando(true);

    try {
      const gerada = await apiPost<MensagemGerada>(
        "/mensagens/gerar",
        {
          produtoId: produtoSelecionado,
          tipo: "WHATSAPP",
          tom: tomSelecionado,
          objetivo: objetivoSelecionado,
          observacoes: descricao.trim() || undefined,
        },
        token ?? undefined,
      );

      setMensagem(gerada.conteudo);
      setImagemUrl(gerada.imagemUrl);
      setMensagemId(gerada.id);
      setMensagemGerada(true);
    } catch (erro) {
      toast.add({
        title:
          erro instanceof Error
            ? erro.message
            : "Não foi possível gerar a mensagem",
        type: "error",
      });
    } finally {
      setGerando(false);
    }
  }

  async function salvarMensagem() {
    if (!mensagemId) return;

    setSalvando(true);

    try {
      await apiPut(`/mensagens/${mensagemId}`,
        { titulo: titulo, conteudo: mensagem },
        token ?? undefined,
      );
      
      toast.add({ title: "Mensagem salva com sucesso!", type: "success" })

    } catch (erro) {

      toast.add({
        title: "Não foi possível salvar a mensagem",
        type: "error",
      });

    } finally {
      setSalvando(false);
    }
  }

  return (
    <main>
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/ia">IA</Link>} />
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Whatsapp</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PageHeader
        title="Criar Whatsapp"
        subtitle="Utilize inteligência artificial para criar uma mensagem de Whatsapp personalizada para seus clientes."
      />

      <section className="mt-6 flex flex-col gap-4 lg:flex-row">
        {/* DEFINIÇÕES */}
        <div className="flex w-full flex-col gap-4 lg:w-1/3">
          {/* CONFIGURAÇÕES */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-semibold">Definições</h2>
              <p className="text-sm text-muted-foreground">
                Configure os parâmetros da sua mensagem.
              </p>
            </div>

            {/* SELEÇÕES */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field className="min-w-0">
                <div className="flex gap-0.5">
                  <FieldLabel>Produto</FieldLabel>
                  <span className="text-destructive">*</span>
                </div>
                <ProdutoCombobox
                  value={produtoSelecionado}
                  onSelect={() => {}}
                  onChange={setProdutoSelecionado}
                />
                <FieldDescription
                  className={errors.produto ? "text-destructive" : undefined}
                >
                  {errors.produto ?? "Este campo deve ser preenchido."}
                </FieldDescription>
              </Field>

              <Field className="min-w-0">
                <FieldLabel>Grupo de clientes</FieldLabel>
                <div className="mt-1.25">
                  <GrupoClienteCombobox
                  value={grupoSelecionado}
                  onChange={setGrupoSelecionado}
                  onNomeChange={setNomeGrupoSelecionado}
                />
                </div>
                
              </Field>

              <Field className="min-w-0">
                <div className="flex gap-0.5">
                  <FieldLabel>Tom da mensagem</FieldLabel>
                  <span className="text-destructive">*</span>
                </div>
                <Select
                  items={Tom}
                  value={tomSelecionado}
                  onValueChange={setTomSelecionado}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o tom" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {Tom.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldDescription
                  className={errors.tom ? "text-destructive" : undefined}
                >
                  {errors.tom ?? "Este campo deve ser preenchido."}
                </FieldDescription>
              </Field>

              <Field className="min-w-0">
                <div className="flex gap-0.5">
                  <FieldLabel>Objetivo da mensagem</FieldLabel>
                  <span className="text-destructive">*</span>
                </div>
                <Select
                  items={Objetivo}
                  value={objetivoSelecionado}
                  onValueChange={setObjetivoSelecionado}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o objetivo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {Objetivo.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldDescription
                  className={errors.objetivo ? "text-destructive" : undefined}
                >
                  {errors.objetivo ?? "Este campo deve ser preenchido."}
                </FieldDescription>
              </Field>
            </div>

            {/* DESCRIÇÃO */}
            <div className="mt-6 border-t pt-5">
              <Field>
                <FieldLabel>Descrição adicional</FieldLabel>
                <FieldDescription>
                  Adicione informações para orientar a inteligência artificial
                  na criação da mensagem.
                </FieldDescription>
                <Textarea
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Ex: Oferecer 20% de desconto na compra de uma segunda unidade. Destacar os benefícios do produto e dar ênfase à oferta."
                  className="min-h-32 resize-y"
                />
              </Field>
            </div>

            {/* BOTÃO */}
            <Button
              variant="default"
              className="mt-5 w-full"
              onClick={gerarMensagem}
              disabled={gerando}
            >
              {gerando ? "Gerando mensagem..." : "Gerar mensagem com IA"}
              {gerando ? (
                <Loader2 className="ml-2 size-4 animate-spin" />
              ) : (
                <WandSparkles className="ml-2 size-4" />
              )}
            </Button>
          </div>

          {/* DICAS */}
          <DicasEngajaento />
        </div>

        {/* VISUALIZAÇÃO */}
        <div className="w-full lg:w-2/3">
          <div className="min-h-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Visualização</h2>
            <p className="text-sm text-muted-foreground">
              Confira como sua mensagem será apresentada.
            </p>
            <div className="flex mt-6 min-h-full gap-4">
              {/* CONVERSA */}
              <div className="w-1/2">
                <MoldeCelular
                  mensagem={mensagem}
                  imagemUrl={imagemUrl}
                  nome={nomeGrupoSelecionado}
                />
              </div>

              {/* EDIÇÃO */}
              <div className="w-1/2">
              {mensagemGerada && (
                <>
                {/* Titulo */}
                <div>
                  <Field>
                    <FieldLabel>Título da mensagem </FieldLabel>
                      <FieldDescription>
                        Este campo é para controle interno e não aparecerá para o cliente.
                      </FieldDescription>
                    <Input
                      placeholder="Digite o título da mensagem"
                      value={titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                    />
                  </Field>
                </div>
              
                {/* IMAGEM */}
                <Field className="min-w-0 mt-4">
                  <FieldLabel>Editar Imagem</FieldLabel>
                </Field>

                {imagemUrl ? (
                  <img
                    src={imagemUrl}
                    alt="Imagem da campanha"
                    className="mt-2 w-full rounded-lg border object-cover"
                  />
                ) : (
                  <div className="mt-2 flex h-40 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
                    A imagem gerada aparecerá aqui
                  </div>
                )}

                <div className="mt-2 flex justify-end">
                  <BotaoReprocessarImagem
                    onConfirmar={(instrucao) => console.log(instrucao)}
                  />
                </div>

                {/* MENSAGEM */}
                <Field className="mt-4 min-w-0">
                  <FieldLabel>Editar Mensagem</FieldLabel>
                  <FieldDescription>
                    Utilize este campo para editar a mensagem gerada pela IA
                  </FieldDescription>
                  <Textarea
                    className="h-40"
                    value={mensagem}
                    onChange={(e) => setMensagem(e.target.value)}
                  />
                </Field>

                {/* ENVIAR DE: combobox entra aqui depois */}

                <div className="mt-4 flex justify-end">
                  <Button 
                    onClick={salvarMensagem}
                    disabled={!mensagemId || salvando}
                    >
                      {salvando ? "Salvando..." : "Salvar mensagem"}
                    </Button>
                </div>
              </>
              )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Whatsapp;
