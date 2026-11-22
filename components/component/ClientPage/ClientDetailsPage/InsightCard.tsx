import { LucideIcon } from "lucide-react";

type InsightCardProps = {
  title: string;
  icon: LucideIcon;
  color: string;
  value?: number;
  text?: string;
  valueType?: "currency" | "number";
  date?: Date;
  empty?: string;
};

const InsightCard = ({
  title,
  icon: Icon,
  color,
  value,
  text,
  valueType,
  date,
  empty,
}: InsightCardProps) => {
  const formattedValue =
    valueType === "currency"
      ? value?.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })
      : value?.toLocaleString("pt-BR");

  return (
    <div className="w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <h2 className="min-w-0 text-sm font-semibold sm:text-base">{title}</h2>
        <span
          className={`shrink-0 rounded-full border border-primary/10 p-2 ${color}`}
        >
          <Icon size={24} />
        </span>
      </div>
      {value !== undefined && <span>{formattedValue}</span>}

      {text !== undefined && <span>{text}</span>}

      {date && <span>{date.toLocaleDateString("pt-BR")}</span>}
    </div>
  );
};

export default InsightCard;
