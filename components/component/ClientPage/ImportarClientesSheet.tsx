"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Download,
  FileSpreadsheet,
  Loader2,
  Info,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { apiPostFormData } from "@/lib/api";
import { useToken } from "@/hooks/use-token";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface ImportarClientesSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClientesImportados: () => void | Promise<void>;
}

type CampoCliente =
  | "email"
  | "nome"
  | "telefone"
  | "cidade"
  | "estado"
  | "aceitaMarketing"
  | "dataCadastro";

type CampoPrevia = {
  campo: CampoCliente;
  rotulo: string;
  obrigatorio: boolean;
};

type PreviaClientes = {
  colunas: string[];
  linhas: Record<string, string>[];
  totalLinhas: number;
  separador: string;
  campos: CampoPrevia[];
  sugestaoMapeamento: Partial<Record<CampoCliente, string>>;
};

type Ocorrencia = {
  linha?: number;
  email?: string;
  mensagem: string;
};

type ResultadoImportacao = {
  totalLinhas: number;
  clientesNovos: number;
  clientesAtualizados: number;
  clientesIgnorados: number;
  totalErros: number;
  totalAvisos: number;
  erros: Ocorrencia[];
  avisos: Ocorrencia[];
};

const modeloCsv = [
  "E-mail;Nome;Telefone;Cidade;Estado;Aceita Marketing;Data de Cadastro",
  "ana@email.com;Ana Silva;11999999999;São Paulo;SP;Sim;15/01/2025",
].join("\n");

const ImportarClientesSheet = ({
  open,
  onOpenChange,
  onClientesImportados,
}: ImportarClientesSheetProps) => {
  const token = useToken();
  const inputRef = useRef<HTMLInputElement>(null);

  const [arquivo, setArquivo] = useState<File | null>(null);
  const [previa, setPrevia] = useState<PreviaClientes | null>(null);
  const [mapeamento, setMapeamento] = useState<
    Partial<Record<CampoCliente, string>>
  >({});
  const [aceitaMarketingGeral, setAceitaMarketingGeral] = useState(false);

  const [erros, setErros] = useState<Ocorrencia[]>([]);
  const [avisos, setAvisos] = useState<Ocorrencia[]>([]);

  const [carregandoPrevia, setCarregandoPrevia] = useState(false);
  const [importando, setImportando] = useState(false);

  const camposObrigatorios = useMemo(
    () => previa?.campos.filter((campo) => campo.obrigatorio) ?? [],
    [previa],
  );

  const camposFaltando = camposObrigatorios.filter(
    (campo) => !mapeamento[campo.campo],
  );

  function limparFormulario() {
    setArquivo(null);
    setPrevia(null);
    setMapeamento({});
    setErros([]);
    setAvisos([]);
    setAceitaMarketingGeral(false);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function alterarAberto(valor: boolean) {
    if (!valor && !importando) {
      limparFormulario();
      onOpenChange(false);
    } else if (valor) {
      onOpenChange(true);
    }
  }

  useEffect(() => {
    if (!open) {
      limparFormulario();
    }
  }, [open]);

  async function selecionarArquivo(file: File | null) {
    setArquivo(file);
    setPrevia(null);
    setMapeamento({});
    setErros([]);
    setAvisos([]);

    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setErros([{ mensagem: "Selecione um arquivo no formato CSV." }]);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErros([{ mensagem: "O arquivo deve ter no máximo 5 MB." }]);
      return;
    }

    if (file.size === 0) {
      setErros([{ mensagem: "O arquivo selecionado está vazio." }]);
      return;
    }

    setCarregandoPrevia(true);

    try {
      const formData = new FormData();
      formData.append("arquivo", file);

      const resultado = await apiPostFormData<PreviaClientes>(
        "/importacao/clientes/previa",
        formData,
        token ?? undefined,
      );

      setPrevia(resultado);
      setMapeamento(resultado.sugestaoMapeamento ?? {});
    } catch (error) {
      setErros([
        {
          mensagem:
            error instanceof Error
              ? error.message
              : "Não foi possível ler a planilha.",
        },
      ]);
    } finally {
      setCarregandoPrevia(false);
    }
  }

  function baixarModelo() {
    const blob = new Blob(["\uFEFF" + modeloCsv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "modelo-importacao-clientes.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  async function importarClientes() {
    if (!arquivo || !previa || camposFaltando.length > 0) {
      return;
    }

    setImportando(true);
    setErros([]);
    setAvisos([]);

    try {
      const formData = new FormData();

      formData.append("arquivo", arquivo);
      formData.append("mapeamento", JSON.stringify(mapeamento));
      formData.append("aceitaMarketing", String(aceitaMarketingGeral));

      const resultado = await apiPostFormData<ResultadoImportacao>(
        "/importacao/clientes/executar",
        formData,
        token ?? undefined,
      );

      setErros(resultado.erros ?? []);
      setAvisos(resultado.avisos ?? []);

      if (resultado.totalErros > 0) {
        toast.add({
          title: "Importação concluída parcialmente",
          type: "error",
        });

        await onClientesImportados();
        return;
      }

      // Com avisos, o painel continua aberto para o usuário lê-los (RN002)
      if (resultado.totalAvisos > 0) {
        toast.add({
          title: "Importação concluída com avisos",
          type: "warning",
        });

        await onClientesImportados();
        return;
      }

      toast.add({
        title: "Clientes importados com sucesso!",
        type: "success",
      });

      await onClientesImportados();
      limparFormulario();
      onOpenChange(false);
    } catch (error) {
      setErros([
        {
          mensagem:
            error instanceof Error
              ? error.message
              : "Não foi possível importar os clientes.",
        },
      ]);
    } finally {
      setImportando(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={alterarAberto}>
      <SheetContent>
        <SheetHeader>
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle>Importar clientes</SheetTitle>
              <SheetDescription>
                Importe seus clientes através de uma planilha CSV.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 py-4">
          {/* ARQUIVO */}
          <div className="grid gap-2">
            <Label>Arquivo de importação</Label>

            <label
              htmlFor="arquivo-clientes"
              className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/20 p-6 text-center transition-colors hover:border-primary/50 hover:bg-muted/40"
            >
              <FileSpreadsheet className="mb-2 size-9 text-muted-foreground" />

              {arquivo ? (
                <>
                  <p className="max-w-full truncate text-sm font-medium">
                    {arquivo.name}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {(arquivo.size / 1024).toFixed(1)} KB
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium">
                    Clique para selecionar uma planilha
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    CSV • Até 5 MB
                  </p>
                </>
              )}

              <Input
                ref={inputRef}
                id="arquivo-clientes"
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                disabled={carregandoPrevia || importando}
                onChange={(event) => {
                  selecionarArquivo(event.target.files?.[0] ?? null);
                }}
              />
            </label>

            <Button
              variant="link"
              className="flex justify-self-start text-primary"
              onClick={baixarModelo}
              disabled={importando}
            >
              <Download className="size-4" />
              Baixar modelo de importação
            </Button>

            {carregandoPrevia && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Analisando planilha...
              </div>
            )}
          </div>

          {/* ERROS */}
          {(erros.length > 0 || camposFaltando.length > 0) && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3">
              <div className="mb-2 flex items-center gap-2 text-destructive">
                <AlertTriangle className="ml-1 size-5 shrink-0" />
                <span className="text-sm font-medium">
                  Problemas encontrados
                </span>
              </div>

              <div className="space-y-2 pl-2">
                {camposFaltando.map((campo) => (
                  <p key={campo.campo} className="text-sm text-destructive">
                    Coluna obrigatória não identificada: {campo.rotulo}.
                  </p>
                ))}

                {erros.map((erro, index) => (
                  <p key={index} className="text-sm text-destructive">
                    {erro.linha ? `Linha ${erro.linha}: ` : ""}
                    {erro.mensagem}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* MAPEAMENTO MANUAL */}
          {previa && (
            <div className="space-y-3">
              <Field>
                <FieldLabel>Conferir colunas</FieldLabel>
                <FieldDescription>
                  Confira o mapeamento automático ou selecione manualmente as
                  colunas correspondentes.
                </FieldDescription>
              

              {previa.campos.map((campo) => (
                <div key={campo.campo} className="grid gap-1.5">
                  <FieldLabel>
                    {campo.rotulo}
                    {campo.obrigatorio && (
                      <span className="text-destructive">*</span>
                    )}
                  </FieldLabel>

                  <Select
                    value={mapeamento[campo.campo] ?? ""}
                    onValueChange={(value) => {
                      setMapeamento((prev) => ({
                        ...prev,
                        [campo.campo]: value === "__nenhum__" ? "" : value,
                      }));
                    }}
                    disabled={importando}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione uma coluna" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="__nenhum__">
                        Não importar este campo
                      </SelectItem>

                      {previa.colunas.map((coluna) => (
                        <SelectItem key={coluna} value={coluna}>
                          {coluna}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
              </Field>

              <div className="rounded-xl border bg-primary/10 p-3">
                <div className="flex items-start gap-2 text-primary">
                  <Info className="ml-1 mt-0.5 size-5 shrink-0" />
                  <span className="text-sm">
                    {previa.totalLinhas} registros encontrados. Os clientes são
                    identificados pelo e-mail. Clientes existentes serão
                    atualizados.
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="aceita-marketing-geral"
                  checked={aceitaMarketingGeral}
                  onCheckedChange={(checked) =>
                    setAceitaMarketingGeral(checked === true)
                  }
                  disabled={importando}
                />
                <Label
                  htmlFor="aceita-marketing-geral"
                  className="cursor-pointer text-sm"
                >
                  Autorizar recebimento de campanhas para clientes sem
                  informação de aceite na planilha
                </Label>
              </div>
            </div>
          )}

          {/* AVISOS */}
          {avisos.length > 0 && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
              <div className="mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <Info className="size-5 shrink-0" />
                <span className="text-sm font-medium">
                  Avisos da importação ({avisos.length})
                </span>
              </div>

              <div className="space-y-2">
                {avisos.map((aviso, index) => (
                  <p
                    key={index}
                    className="text-sm text-amber-700 dark:text-amber-400"
                  >
                    {aviso.linha ? `Linha ${aviso.linha}: ` : ""}
                    {aviso.mensagem}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        <SheetFooter className="flex-col">
          <Button
            className="w-full"
            onClick={importarClientes}
            disabled={
              !arquivo ||
              !previa ||
              camposFaltando.length > 0 ||
              carregandoPrevia ||
              importando
            }
          >
            {importando && <Loader2 className="mr-2 size-4 animate-spin" />}
            Importar
          </Button>
          <SheetClose render={<Button variant="outline">Fechar</Button>} />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default ImportarClientesSheet;