"use client"

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const chartData = [
  { month: "Janeiro", metaAtingida: 186, metaEsperada: 80 },
  { month: "Fevereiro", metaAtingida: 305, metaEsperada: 200 },
  { month: "Março", metaAtingida: 237, metaEsperada: 120 },
  { month: "Abril", metaAtingida: 73, metaEsperada: 190 },
  { month: "Maio", metaAtingida: 209, metaEsperada: 130 },
  { month: "Junho", metaAtingida: 214, metaEsperada: 140 },
]

const chartConfig = {
  metaAtingida: {
    label: "Meta Atingida",
    color: "var(--chart-1)",
  },
  metaEsperada: {
    label: "Meta Esperada",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

const DashboardChart = () => {
  return (
    <div className="grid mt-8 w-full p-3 rounded-lg bg-gray-100">
        <Card>
            <CardHeader>
                <CardTitle>Meta Atingida vs Meta Esperada</CardTitle>
                <CardDescription>Comparativo das metas do período</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-125 w-full">
                <LineChart
                    accessibilityLayer
                    data={chartData}
                    margin={{
                    left: 12,
                    right: 12,
                    }}
                >
                    <CartesianGrid vertical={false} />
                    <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 3)}
                    />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
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
  )
}

export default DashboardChart