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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { apiPostFormData } from "@/lib/api";
import { useToken } from "@/hooks/use-token";

interface ImportarPedidosSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPedidosImportados: () => void | Promise<void>;
}

type CampoPedido =
  | "numeroPedido"
  | "email"
  | "cpf"
  | "nome"
  | "telefone"
  | "cidade"
  | "estado"
  | "data"
  | "total"
  | "subtotal"
  | "desconto"
  | "frete"
  | "nomeProduto"
  | "valorProduto"
  | "quantidade"
  | "sku"
  | "statusPedido"
  | "statusPagamento"
  | "statusEnvio";

type CampoPrevia = {
  campo: CampoPedido;
  rotulo: string;
  obrigatorio: boolean;
};

type PreviaPedidos = {
  colunas: string[];
  linhas: Record<string, string>[];
  totalLinhas: number;
  separador: string;
  campos: CampoPrevia[];
  sugestaoMapeamento: Partial<Record<CampoPedido, string>>;
};

type Ocorrencia = {
  linha?: number;
  pedido?: string;
  mensagem: string;
};

type ResultadoImportacao = {
  totalLinhas: number;
  pedidosNovos: number;
  pedidosAtualizados: number;
  pedidosIgnorados: number;
  clientesNovos: number;
  clientesAtualizados: number;
  produtosNovos: number;
  totalErros: number;
  totalAvisos: number;
  erros: Ocorrencia[];
  avisos: Ocorrencia[];
};

const modeloCsv = [
  "ID no e-commerce / ERP;E-mail;CPF;Nome do Cliente;Telefone;Cidade;Estado;Data;Status Pedido;Subtotal;Frete;Desconto;Total do Pedido;Produto;SKU;Quantidade;Valor Unitário",
  "PED001;ana@email.com;529.982.247-25;Ana Silva;11999999999;São Paulo;SP;15/01/2025;PAGO;309,70;15,00;10,00;314,70;Camiseta Básica;CAM001;2;79,90",
  "PED001;ana@email.com;529.982.247-25;Ana Silva;11999999999;São Paulo;SP;15/01/2025;PAGO;309,70;15,00;10,00;314,70;Calça Jeans;CAL001;1;149,90",
  "PED002;joao@email.com;111.444.777-35;João Souza;11988888888;Campinas;SP;16/01/2025;PENDENTE;79,90;0,00;0,00;79,90;Camiseta Básica;CAM001;1;79,90",
].join("\n");

const ImportarPedidosSheet = ({
  open,
  onOpenChange,
  onPedidosImportados,
}: ImportarPedidosSheetProps) => {
  const token = useToken();
  const inputRef = useRef<HTMLInputElement>(null);

  const [arquivo, setArquivo] = useState<File | null>(null);
  const [previa, setPrevia] = useState<PreviaPedidos | null>(null);

  const [mapeamento, setMapeamento] = useState<
    Partial<Record<CampoPedido, string>>
  >({});

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

      const resposta = await apiPostFormData<PreviaPedidos>(
        "/importacao/previa",
        formData,
        token ?? undefined,
      );

      setPrevia(resposta);
      setMapeamento(resposta.sugestaoMapeamento ?? {});
    } catch (error) {
      setErros([
        {
          mensagem:
            error instanceof Error
              ? error.message
              : "Não foi possível analisar a planilha.",
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
    link.download = "modelo-importacao-pedidos.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  async function importarPedidos() {
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
      formData.append("aceitaMarketing", "false");

      const resposta = await apiPostFormData<ResultadoImportacao>(
        "/importacao/executar",
        formData,
        token ?? undefined,
      );

      setResultado(resposta);
      setErros(resposta.erros ?? []);
      setAvisos(resposta.avisos ?? []);

      await onPedidosImportados();

      if (resposta.totalErros > 0) {
        toast.add({
          title: "Importação concluída parcialmente",
          type: "error",
        });

        return;
      }

      toast.add({
        title: "Pedidos importados com sucesso!",
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
              : "Não foi possível importar os pedidos.",
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
          <SheetTitle>Importar pedidos</SheetTitle>
          <SheetDescription>
            Importe seus pedidos através de uma planilha CSV.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 py-4">
          {/* ARQUIVO */}
          <div className="grid gap-2">
            <Label>Arquivo de importação</Label>

            <label
              htmlFor="arquivo-pedidos"
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
                id="arquivo-pedidos"
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
                    {erro.pedido ? `${erro.pedido}: ` : ""}
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
                      <span className="text-destructive"> *</span>
                    )}
                  </Label>

                  <Select
                    value={mapeamento[campo.campo] ?? "__nenhuma__"}
                    onValueChange={(valor) => {
                      setMapeamento((prev) => {
                        const novo = { ...prev };

                        if (!valor || valor === "__nenhuma__") {
                          delete novo[campo.campo];
                        } else {
                          novo[campo.campo] = valor;
                        }

                        return novo;
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
                    <span className="text-sm">
  {previa.totalLinhas} itens encontrados. As linhas com o mesmo ID de pedido
  serão agrupadas em um único pedido. Os clientes serão identificados pelo CPF
  e os pedidos existentes serão atualizados automaticamente.
</span>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* RESULTADO */}
          {resultado && (
            <div className="rounded-xl border bg-muted/30 p-3">
              <p className="mb-2 text-sm font-medium">
                Resumo da importação
              </p>

              <div className="space-y-1 text-sm text-muted-foreground">
                <p>Linhas analisadas: {resultado.totalLinhas}</p>
                <p>Pedidos novos: {resultado.pedidosNovos}</p>
                <p>Pedidos atualizados: {resultado.pedidosAtualizados}</p>
                <p>Pedidos ignorados: {resultado.pedidosIgnorados}</p>
                <p>Clientes novos: {resultado.clientesNovos}</p>
                <p>Clientes atualizados: {resultado.clientesAtualizados}</p>
                <p>Produtos novos: {resultado.produtosNovos}</p>
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
                    {aviso.pedido ? `${aviso.pedido}: ` : ""}
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
            onClick={importarPedidos}
            disabled={
              !arquivo ||
              !previa ||
              camposFaltando.length > 0 ||
              carregandoPrevia ||
              importando
            }
          >
            {importando && (
              <Loader2 className="mr-2 size-4 animate-spin" />
            )}
            Importar pedidos
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

export default ImportarPedidosSheet;