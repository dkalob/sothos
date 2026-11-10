"use client";

// Essa página formata a tabela

import { ColumnDef } from "@tanstack/react-table";
import { BookUser, Eye, MoreVertical, Pen, Trash2, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { apiDelete } from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";
import { useToken } from "@/hooks/use-token";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export type CampanhaTableColumns = {
  id: string;
  tipo: string;
  titulo: string;
  status: string;
  grupo: string | null;
  clientes: number;
  mensagem: string | null;
  agendadaPara: string | null;
  criadoEm: string;
  mensagemId: string | null;
};

export type MensagemTableColumns = {
  id: string;
  tipo: string;
  titulo: string;
  produto: string | null;
  tom: string;
  objetivo: string;
  campanhas: number;
  criadoEm: string;
};

export const STATUS: Record<string, string> = {
  RASCUNHO: "Rascunho",
  AGENDADA: "Agendada",
  EM_EXECUCAO: "Em execução",
  CONCLUIDA: "Concluída",
  CANCELADA: "Cancelada",
};

export const COR_STATUS: Record<string, string> = {
  RASCUNHO: "bg-gray-100 text-gray-700",
  AGENDADA: "bg-yellow-100 text-yellow-700",
  EM_EXECUCAO: "bg-purple-100 text-purple-700",
  CONCLUIDA: "bg-green-100 text-green-700",
  CANCELADA: "bg-red-100 text-red-700",
};

export const TIPO: Record<string, string> = { 
  EMAIL: "E-mail", 
  WHATSAPP: "WhatsApp" 
};

export const COR_TIPO: Record<string, string> = {
  EMAIL: "bg-blue-100 text-blue-700",
  WHATSAPP: "bg-green-100 text-green-700",
};

export const TOM: Record<string, string> = {
  FORMAL: "Formal",
  DESCONTRAIDO: "Descontraído",
  PERSUASIVO: "Persuasivo",
  DIVERTIDO: "Divertido",
  PESSOAL: "Pessoal",
};

export const OBJETIVO: Record<string, string> = {
  LANCAMENTO: "Lançamento",
  PROMOCAO: "Promoção",
  DIVULGACAO: "Divulgação",
  INDICACAO: "Indicação",
  ULTIMAS_UNIDADES: "Últimas unidades",
};

function CelulaData({ valor }: { valor: string | null }) {
  if (!valor) return <span className="text-muted-foreground">—</span>;

  const data = new Date(valor);

  return (
    <div className="flex flex-col">
      <span>
        {new Intl.DateTimeFormat("pt-BR", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }).format(data)}
      </span>
      <span className="text-sm text-muted-foreground">
        {new Intl.DateTimeFormat("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }).format(data)}
      </span>
    </div>
  );
}

// Menu "⋮" com confirmação de exclusão, usado nas duas tabelas
function MenuExcluir({
  entidade,
  nome,
  caminho,
  aoExcluir,
  extras,
}: {
  entidade: string; // "campanha" ou "mensagem"
  nome: string;
  caminho: string;
  aoExcluir: () => Promise<void>;
  extras?: React.ReactNode
}) {
  const [open, setOpen] = useState(false);
  const token = useToken();

  async function excluir() {
    try {
      await apiDelete(caminho, token ?? undefined);
      toast.add({
        title: `${entidade} excluída com sucesso!`,
        type: "success",
      });
      setOpen(false);
      await aoExcluir();
    } catch {
      toast.add({
        title: `Não foi possível excluir a ${entidade}`,
        type: "error",
      });
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost">
              <span className="sr-only">Abrir menu</span>
              <MoreVertical className="h-4 w-4" />
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuGroup>
            {extras}
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setOpen(true)}
            >
              <Trash2 />
              Excluir {entidade}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20">
              <Trash2Icon />
            </AlertDialogMedia>
            <AlertDialogTitle>Excluir {entidade}?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação irá excluir permanentemente a {entidade}{" "}
              <strong>{nome}</strong>. Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="outline">Cancelar</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={excluir}>
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export const columnsCampanha = (
  atualizarCampanhas: () => Promise<void>,
  editarCampanha: (id: string) => void, 
): ColumnDef<CampanhaTableColumns>[] => [
  {
    accessorKey: "titulo",
    header: "Campanha",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-semibold">{row.original.titulo}</span>
        <span className="text-sm text-muted-foreground">
          {row.original.mensagem ?? "Sem mensagem"}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "tipo",
    header: "Tipo",
    cell: ({ row }) => {
      const tipo = row.original.tipo;

      return (
        <Badge variant="outline">
          {TIPO[tipo] ?? tipo}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;

      return (
        <Badge className={COR_STATUS[status] ?? ""}>
          {STATUS[status] ?? status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "grupo",
    header: "Grupo",
    cell: ({ row }) => row.original.grupo ?? "—",
  },
  { accessorKey: "clientes", header: "Clientes" },
  {
    accessorKey: "agendadaPara",
    header: "Disparo",
    cell: ({ row }) => <CelulaData valor={row.original.agendadaPara} />,
  },
  {
    header: "Gerenciar",
    cell: ({ row }) => {
      const c = row.original;
      const paginaIa = c.tipo === "EMAIL" ? "/ia/email" : "/ia/whatsapp";

      return (
        <MenuExcluir
          entidade="campanha"
          nome={c.titulo}
          caminho={`/campanhas/${c.id}`}
          aoExcluir={atualizarCampanhas}
          extras={
            <>
              <DropdownMenuItem render={<Link href={`/campanhas/${c.id}`} />}>
                <Eye />
                Ver campanha
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editarCampanha(c.id)}>
                <Pen />
                Editar campanha
              </DropdownMenuItem>
            </>
          }
        />
      );
    },
  },
];

export const columnsMensagens = (
  atualizarMensagens: () => Promise<void>,
): ColumnDef<MensagemTableColumns>[] => [
  {
    accessorKey: "titulo",
    header: "Mensagem",
    cell: ({ row }) => (
      <span className="font-semibold">{row.original.titulo}</span>
    ),
  },
  {
    accessorKey: "tipo",
    header: "Tipo",
    cell: ({ row }) => {
      const tipo = row.original.tipo;

      return (
        <Badge className={COR_TIPO[tipo] ?? ""}>
          {TIPO[tipo] ?? tipo}
        </Badge>
      );
    },
  },
  {
    accessorKey: "produto",
    header: "Produto",
    cell: ({ row }) => row.original.produto ?? "—",
  },
  {
    accessorKey: "tom",
    header: "Tom",
    cell: ({ row }) => TOM[row.original.tom] ?? row.original.tom,
  },
  {
    accessorKey: "objetivo",
    header: "Objetivo",
    cell: ({ row }) => OBJETIVO[row.original.objetivo] ?? row.original.objetivo,
  },
  { accessorKey: "campanhas", header: "Campanhas" },
  {
    accessorKey: "criadoEm",
    header: "Criada em",
    cell: ({ row }) => <CelulaData valor={row.original.criadoEm} />,
  },
  {
    header: "Gerenciar",
    cell: ({ row }) => {
      const m = row.original;
      const paginaIa = m.tipo === "EMAIL" ? "/email" : "/whatsapp";

      return (
        <MenuExcluir
          entidade="mensagem"
          nome={m.titulo}
          caminho={`/mensagens/${m.id}`}
          aoExcluir={atualizarMensagens}
          extras={
            <DropdownMenuItem
              render={<Link href={`${paginaIa}?mensagem=${m.id}`} />}
            >
              <Pen />
              Editar mensagem
            </DropdownMenuItem>
          }
        />
      );
    },
  },
];
