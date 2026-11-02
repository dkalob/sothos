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
import { Info, WandSparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import MoldeCelular from "@/components/component/MoldeCelular";
import BotaoReprocessarImagem from "@/components/component/BotaoReprocessarImagem";
import DicasEngajaento from "@/components/component/DicasEngajamento";

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

const Whatsapp = () => {
  const [produtoSelecionado, setProdutoSelecionado] = useState("");
  const [grupoSelecionado, setGrupoSelecionado] = useState("");
  const [tomSelecionado, setTomSelecionado] = useState<string | null>(null);
  const [objetivoSelecionado, setObjetivoSelecionado] = useState<string | null>(
    null,
  );
  const [descricao, setDescricao] = useState("");
  const [mensagem, setMensagem] = useState("");
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
                <FieldLabel>Produto</FieldLabel>
                <ProdutoCombobox
                  value={produtoSelecionado}
                  onSelect={() => {}}
                  onChange={setProdutoSelecionado}
                />
              </Field>

              <Field className="min-w-0">
                <FieldLabel>Grupo de clientes</FieldLabel>
                <ProdutoCombobox
                  value={grupoSelecionado}
                  onSelect={() => {}}
                  onChange={setGrupoSelecionado}
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
            <Button variant="default" className="mt-5 w-full">
              Gerar mensagem com IA
              <WandSparkles className="ml-2 size-4" />
            </Button>
          </div>

          {/* DICAS */}
          <DicasEngajaento/>
          
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
                <MoldeCelular mensagem={mensagem} imagemUrl={imagemUrl} nome={grupoSelecionado} />
              </div>
              
              {/* EDIÇÃO */}
              <div className="w-1/2">
                {/* IMAGEM */}
                <Field className="min-w-0">
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

                <div className="mt-2 flex justify-end">
                  <Button variant="outline">Salvar Mensagem</Button>
                </div>

                {/* ENVIAR DE: combobox entra aqui depois */}

                <div className="mt-4 flex justify-end gap-4">
                  <Button variant="outline">Salvar Rascunho</Button>
                  <Button>Agendar Campanha</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Whatsapp;
