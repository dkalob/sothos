import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

type DashboardCardProps = {
  icon: LucideIcon;
  title: string;
  value: string | number;
  trend: {
    direction: "up" | "down";
    value: string;
  };
  footer?: {
    label: string;
    value: string | number;
  }[];
  progress?: {
    label: string;
    value: number;
  };
};

const DashboardCard = ({
  icon: Icon,
  title,
  value,
  trend,
  footer,
  progress,
}: DashboardCardProps) => {
  const isUp = trend.direction === "up";
  const TrendIcon = isUp ? TrendingUp : TrendingDown;

  return (
    <div className="flex flex-col bg-gray-100 p-5 rounded-lg w-full max-w-sm">
      {/* ÍCONE + PORCENTAGEM */}
      <div className="flex justify-between items-center">
        <Icon
          size={36}
          className="rounded-full bg-primary/30 border border-primary/50 p-2"
        />
        <div className="flex gap-2">
          <TrendIcon size={20} />
          <span
            className={`text-sm font-medium ${isUp ? "text-green-600" : "text-red-600"}`}
          >
            {trend.value}
          </span>
        </div>
      </div>

      {/* TÍTULO + VALOR */}
      <div className="flex flex-col mt-3">
        <span className="text-md font-medium">{title}</span>
        <span className="text-5xl font-extrabold">{value}</span>
      </div>

      {/* RODAPÉ: progress bar OU dados simples, nunca os dois */}
      {progress && (
        <div className="flex gap-8 mt-4">
          <Progress value={progress.value} className="w-full max-w-sm">
            <ProgressLabel>{progress.label}</ProgressLabel>
            <ProgressValue />
          </Progress>
        </div>
      )}

      {footer && !progress && (
        <div className="flex gap-8 mt-4">
          {footer.map((item) => (
            <div key={item.label} className="flex flex-col">
              <span className="text-sm font-normal">{item.label}</span>
              <span className="font-bold">{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardCard;
