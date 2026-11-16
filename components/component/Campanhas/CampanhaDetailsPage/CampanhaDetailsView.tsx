"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarClock,
  Mail,
  MessageCircle,
  Users,
  Flag,
  Pause,
  Play,
} from "lucide-react";
import PageHeader from "@/components/component/PageHeader";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MoldeEmail } from "@/components/component/MoldeEmail";
import MoldeCelular from "@/components/component/MoldeCelular";
import { apiGet, apiPost } from "@/lib/api";
import { useToken } from "@/hooks/use-token";
import { COR_STATUS, OBJETIVO, STATUS, TIPO, TOM } from "../columns";
import { useUsuario } from "@/hooks/use-usuario";
import { CampanhaDetalhe } from "../CampanhaSheet";

const formatar = (iso: string | null) =>
  iso
    ? new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "long",
        timeStyle: "short",
      }).format(new Date(iso))
    : "—";

const Resumo = ({
  icone: Icone,
  titulo,
  children,
}: {
  icone: React.ElementType;
  titulo: string;
  children: React.ReactNode;
}) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
      <Icone className="size-4" />
      {titulo}
    </div>
    <div className="font-semibold">{children}</div>
  </div>
);

const Linha = ({
  rotulo,
  valor,
}: {
  rotulo: string;
  valor: React.ReactNode;
}) => (
  <div className="flex justify-between gap-4 border-b py-3 text-sm last:border-b-0">
    <span className="text-muted-foreground">{rotulo}</span>
    <span className="text-right font-medium">{valor}</span>
  </div>
);

const CampanhaDetailsView = ({ id }: { id: string }) => {
  const [campanha, setCampanha] = useState<CampanhaDetalhe | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const token = useToken();
  const usuario = useUsuario();

  const [executando, setExecutando] = useState(false);
  const [pausando, setPausando] = useState(false);

  const atualizarCampanha = async () => {
  const dados = await apiGet<CampanhaDetalhe>(`/campanhas/${id}`, token!);
  setCampanha(dados);
  return dados;
};

const controlarCampanha = async (acao: "executar" | "pausar") => {
  if (!token) return;

  if (acao === "executar") {
    if (executando) return;

    setExecutando(true);
    setErro(null);

    // A execução continua em segundo plano para permitir a pausa.
    void apiPost(`/campanhas/${id}/executar`, {}, token)
      .then(() => atualizarCampanha())
      .catch(async (e) => {
        setErro(
          e instanceof Error ? e.message : "Erro ao executar campanha",
        );
        await atualizarCampanha().catch(() => {});
      })
      .finally(() => setExecutando(false));

    // Aguarda o backend confirmar que a campanha começou.
    for (let tentativa = 0; tentativa < 20; tentativa++) {
      await new Promise((resolve) => setTimeout(resolve, 250));

      const dados = await atualizarCampanha();

      if (dados.status === "EM_EXECUCAO") break;

      if (
        dados.status !== "AGENDADA" &&
        dados.status !== "PAUSADA"
      ) {
        break;
      }
    }

    return;
  }

  if (pausando) return;

  try {
    setPausando(true);
    setErro(null);

    await apiPost(`/campanhas/${id}/pausar`, {}, token);
    await atualizarCampanha();
  } catch (e) {
    setErro(
      e instanceof Error ? e.message : "Erro ao pausar campanha",
    );
  } finally {
    setPausando(false);
  }
};

  useEffect(() => {
    if (!token) return;

    let cancelado = false;

    apiGet<CampanhaDetalhe>(`/campanhas/${id}`, token)
      .then((dados) => {
        if (!cancelado) setCampanha(dados);
      })
      .catch((e) => {
        if (!cancelado)
          setErro(
            e instanceof Error ? e.message : "Erro ao carregar a campanha",
          );
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [id, token]);

  if (carregando) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (erro || !campanha) {
    return (
      <div className="flex flex-col items-start gap-4">
        <p className="text-muted-foreground">
          {erro ?? "Campanha não encontrada."}
        </p>
        <Link
          href="/campanhas"
          className={buttonVariants({ variant: "outline" })}
        >
          Voltar para campanhas
        </Link>
      </div>
    );
  }

  const m = campanha.mensagem;
  const paginaIa = campanha.tipo === "EMAIL" ? "/ia/email" : "/ia/whatsapp";
  const IconeTipo = campanha.tipo === "EMAIL" ? Mail : MessageCircle;

  return (
    <main>
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/campanhas">Campanhas</Link>} />
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{campanha.titulo}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex justify-between items-center">
        <PageHeader title={campanha.titulo} subtitle="Detalhes da campanha." />
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="w-40 hover:bg-primary/10"
            onClick={() => controlarCampanha("executar")}
            disabled={
              executando ||
              campanha.status === "EM_EXECUCAO" ||
              campanha.status === "CONCLUIDA" ||
              campanha.status === "CANCELADA"
            }
          >
            <Play />
            {executando ? "Aguarde..." : "Ativar Campanha"}
          </Button>

          <Button
            variant="outline"
            className="w-40 hover:bg-primary/10"
            onClick={() => controlarCampanha("pausar")}
            disabled={
              pausando ||
              (campanha.status !== "EM_EXECUCAO" &&
                campanha.status !== "AGENDADA")
            }
          >
            <Pause />
            Pausar Campanha
          </Button>
        </div>
      </div>

      {/* RESUMO */}
      <section className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Resumo icone={Flag} titulo="Status">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs ${COR_STATUS[campanha.status] ?? ""}`}
          >
            {STATUS[campanha.status] ?? campanha.status}
          </span>
        </Resumo>
        <Resumo icone={IconeTipo} titulo="Tipo">
          {TIPO[campanha.tipo]}
        </Resumo>
        <Resumo icone={CalendarClock} titulo="Disparo">
          {formatar(campanha.agendadaPara)}
        </Resumo>
        <Resumo icone={Users} titulo="Destinatários">
          {campanha._count.clientes} clientes
        </Resumo>
      </section>

      <section className="mt-6 flex flex-col gap-4 lg:flex-row">
        {/* INFORMAÇÕES */}
        <div className="w-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:w-1/3">
          <h2 className="text-lg font-semibold">Informações</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Dados desta campanha.
          </p>

          <Linha
            rotulo="Grupo de clientes"
            valor={campanha.grupo?.nome ?? "—"}
          />
          <Linha rotulo="Mensagem" valor={m?.titulo ?? "—"} />
          <Linha rotulo="Produto" valor={m?.produto?.nome ?? "—"} />
          <Linha rotulo="Tom" valor={m ? (TOM[m.tom] ?? m.tom) : "—"} />
          <Linha
            rotulo="Objetivo"
            valor={m ? (OBJETIVO[m.objetivo] ?? m.objetivo) : "—"}
          />
          <Linha rotulo="Criada em" valor={formatar(campanha.criadoEm)} />

          <div className="mt-6 flex flex-col gap-2">
            <div>
              <Link
                href="/campanhas"
                className={buttonVariants({ variant: "outline" })}
              >
                Voltar
              </Link>
              {m && (
                <Link
                  href={`${paginaIa}?mensagem=${m.id}`}
                  className={buttonVariants({ variant: "outline" })}
                >
                  Editar mensagem
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* PRÉ-VISUALIZAÇÃO */}
        <div className="w-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:w-2/3">
          <h2 className="text-lg font-semibold">Pré-visualização</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Como a mensagem será apresentada aos clientes.
          </p>

          {!m ? (
            <p className="text-sm text-muted-foreground">
              A mensagem desta campanha não está mais disponível.
            </p>
          ) : campanha.tipo === "WHATSAPP" ? (
            <MoldeCelular mensagem={m.conteudo} imagemUrl={m.imagemUrl} />
          ) : (
            <MoldeEmail
              assunto={m.assunto ?? ""}
              nome={campanha.grupo?.nome ?? ""}
              imagem={m.imagemUrl}
              mensagem={m.conteudo}
              textoBotao={m.textoBotao ?? ""}
              usuario={usuario?.usuario?.nome ?? ""}
            />
          )}
        </div>
      </section>
    </main>
  );
};

export default CampanhaDetailsView;
