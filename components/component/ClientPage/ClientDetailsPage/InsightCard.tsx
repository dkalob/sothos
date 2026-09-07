type InsightCardProps = {
  title: string;
  icon: string;
  color: string;
  value?: number;
  valueType?: "currency" | "number";
  date?: Date;
};

const InsightCard = ({
  title,
  icon,
  color,
  value,
  valueType,
  date,
}: InsightCardProps) => {
  
    const formattedValue =
    valueType === "currency"
      ? value?.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })
      : value?.toLocaleString("pt-BR");

  return (
    <div className="bg-primary-foreground p-4 rounded-lg shadow-sm">
      <div className="flex justify-between">
        <h1 className="font-semibold">{title}</h1>
        <span
          className={`material-symbols-outlined rounded-full border border-primary/10 p-2 ${color}`}
        >
          {icon}
        </span>
      </div>
      {value !== undefined && <span>{formattedValue}</span>}
      {date && <span>{date.toLocaleDateString()}</span>}
    </div>
  );
};

export default InsightCard;
