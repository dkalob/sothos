
import { CalendarDays, ShoppingBag } from "lucide-react";
import HistoricoCard from "./HistoricoCard";

interface Pedido {
  id: string;
  valorTotal: number;
  realizadoEm: string;
  status: string;
}

interface PedidoListProps {
  pedidos: Pedido[];
}

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDENTE: {
    label: "Pendente",
    className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  PAGO: {
    label: "Pago",
    className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  ENVIADO: {
    label: "Enviado",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  ENTREGUE: {
    label: "Entregue",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  CANCELADO: {
    label: "Cancelado",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
  DEVOLVIDO: {
    label: "Devolvido",
    className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  },
};

const PedidoList = ({ pedidos }: PedidoListProps) => {
  const formatarData = (data: string) =>
    new Date(data).toLocaleDateString("pt-BR");

  const formatarValor = (valor: number) =>
    valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  return (
    <HistoricoCard title="Pedidos do cliente">
      {pedidos.length > 0 ? (
        <div className="space-y-1">
          {pedidos.map((pedido) => {
            const status = statusConfig[pedido.status] ?? {
              label: pedido.status,
              className: "bg-muted text-muted-foreground",
            };

            return (
              <div
                key={pedido.id}
                className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  <ShoppingBag size={19} />
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-sm font-semibold">
                    Pedido #{pedido.id}
                  </p>

                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarDays size={13} />
                    <span>{formatarData(pedido.realizadoEm)}</span>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <span className="text-sm font-bold tabular-nums">
                    {formatarValor(pedido.valorTotal)}
                  </span>

                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}
                  >
                    {status.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
          <ShoppingBag className="h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">
            Nenhum pedido encontrado
          </p>
          <p className="text-xs text-muted-foreground">
            Os pedidos realizados aparecerão aqui.
          </p>
        </div>
      )}
    </HistoricoCard>
  );
};

export default PedidoList;
