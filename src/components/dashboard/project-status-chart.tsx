"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import type { Initiative } from "@/types"

const chartData = [
  { status: "On Track", count: 0, fill: "var(--color-onTrack)" },
  { status: "At Risk", count: 0, fill: "var(--color-atRisk)" },
  { status: "Delayed", count: 0, fill: "var(--color-delayed)" },
  { status: "Completed", count: 0, fill: "var(--color-completed)" },
]

const chartConfig = {
  count: {
    label: "Initiatives",
  },
  onTrack: {
    label: "On Track",
    color: "hsl(var(--chart-2))",
  },
  atRisk: {
    label: "At Risk",
    color: "hsl(var(--chart-4))",
  },
  delayed: {
    label: "Delayed",
    color: "hsl(var(--chart-5))",
  },
  completed: {
    label: "Completed",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

interface ProjectStatusChartProps {
  initiatives: Initiative[];
}

export function ProjectStatusChart({ initiatives }: ProjectStatusChartProps) {
  const processedData = chartData.map(item => ({ ...item, count: 0 })); // Reset counts

  initiatives.forEach(initiative => {
    const item = processedData.find(d => d.status === initiative.status);
    if (item) {
      item.count++;
    }
  });
  
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline">Initiatives Status Overview</CardTitle>
        <CardDescription>Distribution of strategic initiatives by current status.</CardDescription>
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
