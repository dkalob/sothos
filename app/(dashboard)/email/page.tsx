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
import { WandSparkles } from "lucide-react";
import ProdutoCombobox from "@/components/component/ProdutoComboBox";
import { useState } from "react";
import GrupoClienteCombobox from "@/components/component/GrupoClienteComboBox";
import Link from "next/link";
import BotaoReprocessarImagem from "@/components/component/BotaoReprocessarImagem";
import { Input } from "@/components/ui/input";
import { MoldeEmail } from "@/components/component/MoldeEmail";

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

const Email = () => {
  const [produtoSelecionado, setProdutoSelecionado] = useState("");
  const [grupoSelecionado, setGrupoSelecionado] = useState("");
  const [nomeGrupoSelecionado, setNomeGrupoSelecionado] = useState("");
  const [tomSelecionado, setTomSelecionado] = useState<string | null>(null);
  const [objetivoSelecionado, setObjetivoSelecionado] = useState<string | null>(
    null,
  );
  const [descricao, setDescricao] = useState("");
  const [assunto, setAssunto] = useState("");
  const [header, setHeader] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [btnText, setbtnText] = useState("");
  const [imagemUrl, setImagemUrl] = useState<string | null>(null);

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
              <FieldLabel>Produto</FieldLabel>
              <ProdutoCombobox
                value={produtoSelecionado}
                onSelect={() => {}}
                onChange={setProdutoSelecionado}
              />
            </Field>

            <Field className="min-w-0">
              <FieldLabel>Grupo de clientes</FieldLabel>
              <GrupoClienteCombobox
                value={grupoSelecionado}
                onChange={setGrupoSelecionado}
                onNomeChange={setNomeGrupoSelecionado}
              />
            </Field>

            <Field className="min-w-0">
              <FieldLabel>Tom da mensagem</FieldLabel>
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
            </Field>

            <Field className="min-w-0">
              <FieldLabel>Objetivo da mensagem</FieldLabel>
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
          <Button variant="default" className="mt-5">
            Gerar mensagem com IA
            <WandSparkles className="ml-2 size-4" />
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
                preHeader={header}
                imagem="/images/campanha.jpg"
                mensagem={mensagem}
                textoBotao={btnText}
                usuario="Sothos"
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

                <Field className="mt-4">
                  <FieldLabel>Pré-header</FieldLabel>
                  <Input
                    placeholder="Digite o texto de pré-visualização"
                    value={header}
                    onChange={(e) => setHeader(e.target.value)}
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
              <div className="flex justify-end gap-4 mt-6">
                <Button variant="outline">Salvar Rascunho</Button>
                <Button>Agendar Campanha</Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Email;
