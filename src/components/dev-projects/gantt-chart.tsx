
"use client";

import React, { useMemo } from 'react';
import { useDevProjects } from '@/contexts/dev-projects-context';
import type { DevProject, DevProjectItem, DevProjectSubItem } from '@/types';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { startOfDay, differenceInDays, parseISO } from 'date-fns';

interface GanttTask {
    id: string;
    name: string;
    responsible: string;
    range: [number, number];
    status: string;
}

export function GanttChart() {
    const { projects } = useDevProjects();

    const { tasks, startDate, endDate, totalDays } = useMemo(() => {
        const allTasks: (DevProjectItem | DevProjectSubItem)[] = [];
        projects.forEach(p => p.items.forEach(i => {
            allTasks.push({ ...i, name: `${p.name} / ${i.title}` });
            if (i.subItems) {
                allTasks.push(...i.subItems.map(si => ({ ...si, name: `  - ${si.title}` })));
            }
        }));

        if (allTasks.length === 0) {
            return { tasks: [], startDate: new Date(), endDate: new Date(), totalDays: 0 };
        }

        const dates = allTasks.map(t => parseISO(t.deadline));
        const earliestDate = startOfDay(new Date(Math.min(...dates.map(d => d.getTime()))));
        const latestDate = startOfDay(new Date(Math.max(...dates.map(d => d.getTime()))));
        
        const chartStartDate = earliestDate;
        const totalDuration = differenceInDays(latestDate, chartStartDate) + 1;

        const ganttTasks: GanttTask[] = allTasks.map(task => {
            const taskStartDate = startOfDay(parseISO(task.deadline)); // For simplicity, we treat deadline as end date
            const startDay = differenceInDays(taskStartDate, chartStartDate);
            // Let's assume a fixed duration for visualization, e.g., 5 days ending at the deadline
            const DURATION = 5;
            const endDay = startDay + 1; // Show as a milestone on the deadline
            const clampedStartDay = Math.max(0, startDay - DURATION + 1);

            return {
                id: task.id,
                name: task.name,
                responsible: task.responsible,
                range: [clampedStartDay, endDay],
                status: task.status,
            };
        }).reverse(); // Reverse to draw from top to bottom in chart

        return { tasks: ganttTasks, startDate: chartStartDate, endDate: latestDate, totalDays: totalDuration };
    }, [projects]);
    
    const statusColors: Record<string, string> = {
        'Pendente': 'hsl(var(--muted-foreground))',
        'Em Andamento': 'hsl(var(--primary))',
        'Concluído': 'hsl(var(--chart-2))',
        'Em Espera': 'hsl(var(--chart-3))',
        'Cancelado': 'hsl(var(--destructive))',
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Linha do Tempo dos Projetos (Gantt)</CardTitle>
                <CardDescription>Visualização das entregas e prazos.</CardDescription>
            </CardHeader>
            <CardContent className="h-[600px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        layout="vertical"
                        data={tasks}
                        margin={{ top: 5, right: 20, left: 100, bottom: 5 }}
                        barCategoryGap="35%"
                    >
                        <XAxis type="number" domain={[0, totalDays]} hide />
                        <YAxis 
                           type="category" 
                           dataKey="name" 
                           tickLine={false} 
                           axisLine={false}
                           tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
                           width={250}
                           style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}
                        />
                        <Tooltip
                            cursor={{ fill: 'hsl(var(--muted) / 0.5)' }}
                            content={({ payload }) => {
                                if (payload && payload.length > 0 && payload[0].payload) {
                                    const { name, responsible, status } = payload[0].payload;
                                    return (
                                        <div className="bg-background p-2 border rounded-lg shadow-lg">
                                            <p className="font-bold">{name}</p>
                                            <p>Responsável: {responsible}</p>
                                            <p>Status: {status}</p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Bar dataKey="range" radius={4}>
                            {tasks.map((task) => (
                                 <rect key={task.id} fill={statusColors[task.status] || '#ccc'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

