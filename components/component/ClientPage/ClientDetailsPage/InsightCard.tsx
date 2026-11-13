import { LucideIcon } from "lucide-react";

type InsightCardProps = {
  title: string;
  icon: LucideIcon;
  color: string;
  value?: number;
  valueType?: "currency" | "number";
  date?: Date;
  empty?: string;
};

const InsightCard = ({
  title,
  icon: Icon,
  color,
  value,
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
      <div className="flex justify-between">
        <h1 className="font-semibold">{title}</h1>
        <span
          className={`rounded-full border border-primary/10 p-2 ${color}`}
        >
          <Icon size={24}/>
        </span>
      </div>
      {value !== undefined && <span>{formattedValue}</span>}
      {date && (<span>{date.toLocaleDateString()}</span>)}
    </div>
  );
};

export default InsightCard;
