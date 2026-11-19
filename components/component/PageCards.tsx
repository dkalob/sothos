import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

type PageCardsProps = {
  icon: LucideIcon;
  title: string;
  value: string | number;
  trend: {
    direction: "up" | "down";
    value: string;
  };
  footer?: {
    label: string;
    value?: string | number;
  }[];
  progress?: {
    label: string;
    value: number;
  };
  loading?: boolean;
};

const PageCards = ({
  icon: Icon,
  title,
  value,
  trend,
  footer,
  progress,
  loading = false,
}: PageCardsProps) => {
  const isUp = trend.direction === "up";
  const TrendIcon = isUp ? TrendingUp : TrendingDown;

  return (
    <div className="flex min-w-0 w-full flex-col rounded-lg bg-gray-100 p-4 shadow-md sm:p-5">
      {/* ÍCONE + PORCENTAGEM */}
      <div className="flex justify-between items-center">
        <Icon
          size={36}
          className="rounded-full bg-primary/40 border border-primary/10 p-2"
        />

        {loading ? (
          <Skeleton className="h-5 w-16 rounded-full" />
        ) : (
          <div className="flex gap-2">
            <TrendIcon size={20} />
            <span
              className={`text-sm font-medium ${isUp ? "text-green-600" : "text-red-600"}`}
            >
              {trend.value}
            </span>
          </div>
        )}
      </div>

      {/* TÍTULO + VALOR */}
      <div className="flex flex-col mt-3">
        {loading ? (
          <>
            <Skeleton className="h-5 w-36 mb-2" />
            <Skeleton className="h-12 w-28" />
          </>
        ) : (
          <>
            <span className="text-md font-medium">{title}</span>
            <span className="wrap-break-word text-3xl font-extrabold sm:text-4xl lg:text-5xl">
              {value}
            </span>
          </>
        )}
      </div>

      {/* RODAPÉ */}
      {progress && (
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
          {loading ? (
            <div className="w-full space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ) : (
            <Progress value={progress.value} className="w-full max-w-sm">
              <ProgressLabel>{progress.label}</ProgressLabel>
              <ProgressValue />
            </Progress>
          )}
        </div>
      )}

      {footer && !progress && (
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
          {footer.map((item) => (
            <div key={item.label} className="flex flex-col">
              {loading ? (
                <>
                  <Skeleton className="h-4 w-28 mb-2" />
                  <Skeleton className="h-5 w-12" />
                </>
              ) : (
                <>
                  <span className="text-xs font-normal sm:text-sm">
                    {item.label}
                  </span>
                  <span className="font-bold text-primary">{item.value}</span>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PageCards;
