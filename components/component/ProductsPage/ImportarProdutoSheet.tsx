"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Download,
  FileSpreadsheet,
  Info,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
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
import { toast } from "@/components/ui/toast";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { apiGet, apiPostFormData } from "@/lib/api";
import { useToken } from "@/hooks/use-token";

interface ImportarProdutosSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProdutosImportados: () => void | Promise<void>;
}

type CampoProduto = "nome" | "categoria" | "preco" | "imagem" | "sku" | "ativo";

type CampoPrevia = {
  campo: string;
  rotulo: string;
  obrigatorio: boolean;
};

type PreviaProdutos = {
  colunas: string[];
  linhas: Record<string, string>[];
  totalLinhas: number;
  separador: string;
  campos: CampoPrevia[];
  sugestaoMapeamento: Record<string, string>;
};

type Ocorrencia = {
  linha?: number;
  produto?: string;
  mensagem: string;
};

type ResultadoImportacao = {
  totalLinhas: number;
  produtosNovos: number;
  produtosAtualizados: number;
  produtosIgnorados: number;
  categoriasNovas: number;
  totalErros: number;
  totalAvisos: number;
  erros: Ocorrencia[];
  avisos: Ocorrencia[];
};

const modeloCsv = [
  "Nome;Categoria;Preço;Link da imagem (Cloudinary);SKU;Ativo",
  "Camiseta Básica;Roupas;79,90;https://res.cloudinary.com/sua-conta/image/upload/imagem.jpg;CAM001;Sim",
  "Calça Jeans;Calças;149,90;;CAL002;Sim",
].join("\n");

const ImportarProdutosSheet = ({
  open,
  onOpenChange,
  onProdutosImportados,
}: ImportarProdutosSheetProps) => {
  const token = useToken();
  const inputRef = useRef<HTMLInputElement>(null);

  const [arquivo, setArquivo] = useState<File | null>(null);
  const [previa, setPrevia] = useState<PreviaProdutos | null>(null);

  const [mapeamento, setMapeamento] = useState<Record<string, string>>({});

  const [erros, setErros] = useState<Ocorrencia[]>([]);
  const [avisos, setAvisos] = useState<Ocorrencia[]>([]);
  const [resultado, setResultado] = useState<ResultadoImportacao | null>(null);

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
    setResultado(null);
    setCarregandoPrevia(false);

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
    setResultado(null);

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

      const resultado = await apiPostFormData<PreviaProdutos>(
        "/importacao/produtos/previa",
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

  async function baixarModelo() {
    try {
      const colunas = await apiGet<string[]>(
        "/importacao/produtos/modelo",
        token ?? undefined,
      );

      const exemplo = [
        "Camiseta Básica",
        "Roupas",
        "79,90",
        "https://res.cloudinary.com/sua-conta/image/upload/imagem.jpg",
        "CAM001",
        "Sim",
        ...colunas.slice(6).map(() => ""),
      ];

      const escapar = (valor: string) => `"${valor.replace(/"/g, '""')}"`;

      const conteudo = [
        colunas.map(escapar).join(";"),
        exemplo.map(escapar).join(";"),
      ].join("\n");

      const blob = new Blob(["\uFEFF" + conteudo], {
        type: "text/csv;charset=utf-8;",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "modelo-importacao-produtos.csv";
      link.click();

      URL.revokeObjectURL(url);
    } catch (error) {
      toast.add({
        title:
          error instanceof Error
            ? error.message
            : "Não foi possível baixar o modelo.",
        type: "error",
      });
    }
  }

  async function importarProdutos() {
    if (!arquivo || !previa || camposFaltando.length > 0) {
      return;
    }

    setImportando(true);
    setErros([]);
    setAvisos([]);
    setResultado(null);

    try {
      const formData = new FormData();

      formData.append("arquivo", arquivo);
      formData.append("mapeamento", JSON.stringify(mapeamento));

      const resposta = await apiPostFormData<ResultadoImportacao>(
        "/importacao/produtos/executar",
        formData,
        token ?? undefined,
      );

      setResultado(resposta);
      setErros(resposta.erros ?? []);
      setAvisos(resposta.avisos ?? []);

      await onProdutosImportados();

      if (resposta.totalErros > 0) {
        toast.add({
          title: "Importação concluída parcialmente",
          type: "error",
        });

        return;
      }

      toast.add({
        title: "Produtos importados com sucesso!",
        type: "success",
      });

      limparFormulario();
      onOpenChange(false);
    } catch (error) {
      setErros([
        {
          mensagem:
            error instanceof Error
              ? error.message
              : "Não foi possível importar os produtos.",
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
          <SheetTitle>Importar produtos</SheetTitle>
          <SheetDescription>
            Importe os produtos da sua loja através de uma planilha CSV.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 py-4">
          {/* ARQUIVO */}
          <div className="grid gap-2">
            <Label>Arquivo de importação</Label>

            <label
              htmlFor="arquivo-produtos"
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

              <input
                ref={inputRef}
                id="arquivo-produtos"
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
                    {erro.produto ? `${erro.produto}: ` : ""}
                    {erro.mensagem}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* MAPEAMENTO */}
          {previa && (
            <div className="space-y-3">
              <Field>
                <FieldLabel>Conferir colunas</FieldLabel>
                <FieldDescription>
                  Confira o mapeamento automático ou selecione manualmente as
                  colunas correspondentes.
                </FieldDescription>
              </Field>

              {previa.campos.map((campo) => (
                <div key={campo.campo} className="grid gap-1.5">
                  <Label>
                    {campo.rotulo}
                    {campo.obrigatorio && (
                      <span className="text-destructive">*</span>
                    )}
                  </Label>

                  <Select
                    value={mapeamento[campo.campo] ?? "__nenhuma__"}
                    onValueChange={(valor) => {
                      setMapeamento((prev) => {
                        const novoMapeamento = { ...prev };

                        if (valor === null || valor === "__nenhuma__") {
                          delete novoMapeamento[campo.campo];
                        } else {
                          novoMapeamento[campo.campo] = valor;
                        }

                        return novoMapeamento;
                      });
                    }}
                    disabled={importando}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Não importar este campo" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="__nenhuma__">
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

              <div className="rounded-xl border bg-primary/10 p-3">
                <div className="flex items-start gap-2 text-primary">
                  <Info className="ml-1 mt-0.5 size-5 shrink-0" />
                  <span className="text-sm">
                    {previa.totalLinhas} registros encontrados. Cada linha será
                    importada como um produto, incluindo as características
                    identificadas na planilha.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* RESULTADO */}
          {resultado && (
            <div className="rounded-xl border bg-muted/30 p-3">
              <p className="mb-2 text-sm font-medium">Resumo da importação</p>

              <div className="space-y-1 text-sm text-muted-foreground">
                <p>Produtos novos: {resultado.produtosNovos}</p>
                <p>Produtos ignorados: {resultado.produtosIgnorados}</p>
                <p>Categorias criadas: {resultado.categoriasNovas}</p>
                <p>Erros: {resultado.totalErros}</p>
                <p>Avisos: {resultado.totalAvisos}</p>
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
                    {aviso.produto ? `${aviso.produto}: ` : ""}
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
            onClick={importarProdutos}
            disabled={
              !arquivo ||
              !previa ||
              camposFaltando.length > 0 ||
              carregandoPrevia ||
              importando
            }
          >
            {importando && <Loader2 className="mr-2 size-4 animate-spin" />}
            Importar produtos
          </Button>

          <SheetClose
            render={
              <Button variant="outline" disabled={importando}>
                Fechar
              </Button>
            }
          />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default ImportarProdutosSheet;
