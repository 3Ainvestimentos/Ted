"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import type { Initiative } from "@/types"

const chartData = [
  { status: "Em Dia", count: 0, fill: "var(--color-onTrack)" },
  { status: "Em Risco", count: 0, fill: "var(--color-atRisk)" },
  { status: "Atrasado", count: 0, fill: "var(--color-delayed)" },
  { status: "Concluído", count: 0, fill: "var(--color-completed)" },
]

const chartConfig = {
  count: {
    label: "Iniciativas",
  },
  onTrack: {
    label: "Em Dia",
    color: "hsl(var(--chart-2))",
  },
  atRisk: {
    label: "Em Risco",
    color: "hsl(var(--chart-4))",
  },
  delayed: {
    label: "Atrasado",
    color: "hsl(var(--chart-5))",
  },
  completed: {
    label: "Concluído",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

interface ProjectStatusChartProps {
  initiatives: Initiative[];
}

export function ProjectStatusChart({ initiatives }: ProjectStatusChartProps) {
  const processedData = chartData.map(item => ({ ...item, count: 0 })); 

  initiatives.forEach(initiative => {
    const item = processedData.find(d => d.status === initiative.status);
    if (item) {
      item.count++;
    }
  });
  
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Visão Geral do Status das Iniciativas</CardTitle>
        <CardDescription>Distribuição das iniciativas estratégicas por status atual.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={processedData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="status" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="count" radius={8} />
               <ChartLegend content={<ChartLegendContent />} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
