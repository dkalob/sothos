
import { CalendarDays, Megaphone } from "lucide-react";
import HistoricoCard from "./HistoricoCard";

interface Campanha {
  criadoEm: string;
  status: string;
  campanha: {
    id: string;
    nome: string;
  };
}

interface CampanhaListProps {
  campanhas: Campanha[];
}

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDENTE: {
    label: "Pendente",
    className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  ENVIADO: {
    label: "Enviado",
    className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  FALHA: {
    label: "Falha",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
};

const CampanhaList = ({ campanhas }: CampanhaListProps) => {
  const formatarData = (data: string) =>
    new Date(data).toLocaleDateString("pt-BR");

  return (
    <HistoricoCard title="Campanhas que o cliente participou">
      {campanhas.length > 0 ? (
        <div className="space-y-1">
          {campanhas.map((item) => {
            const status = statusConfig[item.status] ?? {
              label: item.status,
              className: "bg-muted text-muted-foreground",
            };

            return (
              <div
                key={item.campanha.id}
                className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
                  <Megaphone size={19} />
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <p className="truncate text-sm font-semibold">
                    {item.campanha.nome}
                  </p>

                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarDays size={13} />
                    <span>
                      Participação em {formatarData(item.criadoEm)}
                    </span>
                  </div>
                </div>

                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}
                >
                  {status.label}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
          <Megaphone className="h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">
            Nenhuma campanha encontrada
          </p>
          <p className="text-xs text-muted-foreground">
            Este cliente ainda não participou de campanhas.
          </p>
        </div>
      )}
    </HistoricoCard>
  );
};

export default CampanhaList;
