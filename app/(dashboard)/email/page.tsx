"use client";

import DicasEngajaento from "@/components/component/DicasEngajamento";
import PageHeader from "@/components/component/PageHeader";
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
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, WandSparkles } from "lucide-react";
import ProdutoCombobox from "@/components/component/ProdutoComboBox";
import { useState } from "react";
import GrupoClienteCombobox from "@/components/component/GrupoClienteComboBox";
import Link from "next/link";
import BotaoReprocessarImagem from "@/components/component/BotaoReprocessarImagem";
import { Input } from "@/components/ui/input";
import { MoldeEmail } from "@/components/component/MoldeEmail";
import { EmailFormErrors, emailSchema } from "@/components/component/Email/EmailSchema";
import { useToken } from "@/hooks/use-token";
import { apiPost, apiPut } from "@/lib/api";
import { toast } from "@/components/ui/toast";
import { useUsuario } from "@/hooks/use-usuario";

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
  assunto: string | null;
  conteudo: string;
  imagemUrl: string | null;
  textoBotao: string | null;
};

const Email = () => {
  const [produtoSelecionado, setProdutoSelecionado] = useState("");
  const [grupoSelecionado, setGrupoSelecionado] = useState("");
  const [nomeGrupoSelecionado, setNomeGrupoSelecionado] = useState("");
  const [tomSelecionado, setTomSelecionado] = useState<string | null>(null);
  const [objetivoSelecionado, setObjetivoSelecionado] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [descricao, setDescricao] = useState("");
  const [assunto, setAssunto] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [btnText, setbtnText] = useState("");
  const [imagemUrl, setImagemUrl] = useState<string | null>(null);
  const [mensagemId, setMensagemId] = useState<string | null>(null);
  const [gerando, setGerando] = useState(false);
  const [errors, setErrors] = useState<EmailFormErrors>({});

  const token = useToken();
  const usuarioLogado = useUsuario();
  
    async function gerarMensagem() {
      
      const result = emailSchema.safeParse({
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
            tipo: "EMAIL",
            tom: tomSelecionado,
            objetivo: objetivoSelecionado,
            observacoes: descricao.trim() || undefined,
          },
          token ?? undefined,
        );
        
        setAssunto(gerada.assunto ?? "");
        setMensagem(gerada.conteudo);
        setImagemUrl(gerada.imagemUrl);
        setMensagemId(gerada.id);
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
          { 
            assunto,
            conteudo: mensagem,
            textoBotao: btnText,
          },
          token ?? undefined,
        );
        
        toast.add({ title: "Mensagem salva com sucesso!", type: "success" })
  
      } catch (erro) {
        console.log(erro)
  
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
            <BreadcrumbPage>Email</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PageHeader
        title="Criar Email"
        subtitle="Utilize inteligência artificial para criar um email personalizado para seus clientes."
      />

      {/* DEFINIÇÕES */}
      <section className="mt-6 flex gap-4 lg:flex-row">
        {/* CONFIGURAÇÕES */}
        <div className="w-2/3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
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
                Adicione informações para orientar a inteligência artificial na
                criação da mensagem.
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
            className="mt-5"
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
        <div className="w-1/3">
          <DicasEngajaento />
        </div>
      </section>

      {/* VISUALIZAÇÃO */}
      <section className="mt-6 flex gap-4 lg:flex-row">
        <div className="w-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Visualização</h2>
          <p className="text-sm text-muted-foreground">
            Confira como sua mensagem será apresentada.
          </p>

          <div className="flex gap-6 mt-6">
            {/* EMAIL */}
            <div className="w-1/2 mt-0.5">
              <MoldeEmail
                assunto={assunto}
                nome={nomeGrupoSelecionado}
                imagem={imagemUrl}
                mensagem={mensagem}
                textoBotao={btnText}
                usuario={usuarioLogado?.usuario?.nome ?? "Sothos"}
              />
            </div>

            {/* EDIÇÃO */}
            <div className="w-1/2">
              {/* ASSUNTO */}
              <div>
                <Field>
                  <FieldLabel>Assunto</FieldLabel>
                  <Input
                    placeholder="Digite o assunto do email"
                    value={assunto}
                    onChange={(e) => setAssunto(e.target.value)}
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

              <div className="flex justify-end mt-2">
                <BotaoReprocessarImagem
                  onConfirmar={(instrucao) => console.log(instrucao)}
                />
              </div>

              {/* MENSAGEM */}
              <Field className="min-w-0">
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

              {/* BOTÃO */}
              <Field className="mt-4">
                  <FieldLabel>Texto do Botão</FieldLabel>
                  <Input
                    placeholder="Digite o texto do botão"
                    value={btnText}
                    onChange={(e) => setbtnText(e.target.value)}
                  />
              </Field>

              {/* AÇÕES */}
              <div className="mt-4 flex justify-end">
                  <Button 
                    onClick={salvarMensagem}
                    disabled={!mensagemId || salvando}
                    >
                    {salvando ? "Salvando..." : "Salvar mensagem"}
                  </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Email;
