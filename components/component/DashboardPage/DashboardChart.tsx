
"use client";

import { useEffect, useState } from "react";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Pencil, Save, X } from "lucide-react";

// TIPOS

type ChartData = {
  dia: string;
  metaAtingida: number;
  metaEsperada: number;
};

type DashboardChartProps = {
  data: ChartData[];
  meta: number;
  onMetaChange: (meta: number) => void;
};

const chartConfig = {
  metaAtingida: {
    label: "Meta Atingida",
    color: "var(--chart-1)",
  },
  metaEsperada: {
    label: "Meta Esperada",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

const DashboardChart = ({
  data,
  meta,
  onMetaChange,
}: DashboardChartProps) => {
  const [editando, setEditando] = useState(false);
  const [metaTemporaria, setMetaTemporaria] = useState(String(meta));

  // Sincroniza o valor quando a meta mudar externamente
  useEffect(() => {
    setMetaTemporaria(String(meta));
  }, [meta]);

  const salvarMeta = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const valor = Number(metaTemporaria);

    if (!Number.isFinite(valor) || valor <= 0) return;

    onMetaChange(valor);
    setEditando(false);
  };

  const formatarMoeda = (valor: number) =>
    valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    });

  return (
    <div className="grid mt-8 w-full p-3 rounded-lg bg-gray-100">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <CardTitle>
                Meta Atingida vs Meta Esperada
              </CardTitle>

              <CardDescription>
                Comparativo das metas do mês atual
              </CardDescription>
            </div>

            {!editando ? (
              <Button
                variant="outline"
                onClick={() => setEditando(true)}
              >
                <Pencil className="h-4 w-4" />
                Definir meta
              </Button>
            ) : (
              <form
                onSubmit={salvarMeta}
                className="flex flex-wrap items-center gap-2"
              >
                <Input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="Digite a meta"
                  value={metaTemporaria}
                  onChange={(e) =>
                    setMetaTemporaria(e.target.value)
                  }
                  className="w-40"
                  required
                />

                <Button variant="ghost" type="submit" size="icon">
                  <Save className="h-4 w-4" />
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setMetaTemporaria(String(meta));
                    setEditando(false);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </form>
            )}
          </div>

          <div className="mt-3 text-sm text-muted-foreground">
            Meta estimada:{" "}
            <span className="font-semibold text-foreground">
              {formatarMoeda(meta)}
            </span>
          </div>
        </CardHeader>

        <CardContent>
          <ChartContainer
            config={chartConfig}
            className="h-125 w-full"
          >
            <LineChart
              accessibilityLayer
              data={data}
              margin={{
                left: 12,
                right: 12,
                top: 12,
              }}
            >
              <CartesianGrid vertical={false} />

              <XAxis
                dataKey="dia"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />

              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) =>
                  formatarMoeda(Number(value))
                }
              />

              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent />}
              />

              <Line
                dataKey="metaAtingida"
                type="monotone"
                stroke="var(--color-metaAtingida)"
                strokeWidth={2}
                dot={false}
              />

              <Line
                dataKey="metaEsperada"
                type="monotone"
                stroke="var(--color-metaEsperada)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardChart;
