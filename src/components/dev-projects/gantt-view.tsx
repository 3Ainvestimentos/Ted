

"use client";

import React, { useMemo } from 'react';
import type { DevProject, DevProjectStatus, DevProjectItem, DevProjectSubItem } from '@/types';
import { startOfDay, endOfDay, parseISO, eachDayOfInterval, isWithinInterval, getMonth, getYear, format, isToday, isBefore, startOfMonth, endOfMonth, eachMonthOfInterval, isSameMonth, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from '@/lib/utils';
import { ChevronDown, CornerDownRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { useProjectComments } from '@/contexts/project-comments-context';

const OVERDUE_STATUS_OPTIONS: DevProjectStatus[] = ['Em atraso', 'Concluído'];
const BASE_STATUS_OPTIONS: DevProjectStatus[] = ['Pendente', 'Em Andamento', 'Concluído'];

interface GanttTask {
    id: string;
    name: string;
    level: number;
    responsible: string;
    status: DevProjectStatus;
    startDate: Date;
    endDate: Date;
    isParent: boolean;
    originalProject: DevProject;
    isOverdue: boolean;
    itemId?: string;
    subItemId?: string;
}

interface GanttViewProps {
    projects: DevProject[];
    onProjectClick: (project: DevProject) => void;
    onItemClick?: (projectId: string, itemId: string, itemTitle: string) => void;
    onSubItemClick?: (projectId: string, itemId: string, subItemId: string, subItemTitle: string) => void;
    onStatusChange: (projectId: string, itemId: string, newStatus: DevProjectStatus) => void;
}

export function GanttView({ projects, onProjectClick, onItemClick, onSubItemClick, onStatusChange }: GanttViewProps) {
    const { getUnreadCount } = useProjectComments();
    
    const { tasks, dateHeaders, monthHeaders } = useMemo(() => {
        if (!projects || projects.length === 0) {
            return { tasks: [], dateHeaders: [], monthHeaders: [] };
        }

        const allItems: (DevProject | DevProjectItem | DevProjectSubItem)[] = [];
        projects.forEach(p => {
            allItems.push(p);
            p.items.forEach(i => {
                allItems.push(i);
                i.subItems.forEach(si => allItems.push(si));
            });
        });

        // Calendário fixo: mês atual + próximos 5 meses (6 meses total)
        const today = new Date();
        const chartStartDate = startOfMonth(today);
        const chartEndDate = endOfMonth(addMonths(today, 5)); // 5 meses à frente = 6 meses total

        const dateHeaders = eachDayOfInterval({ start: chartStartDate, end: chartEndDate });

        const ganttTasks: GanttTask[] = projects.map(p => {
             const itemsWithDates = p.items.filter(i => i.startDate && i.deadline);
             const projectStartDate = itemsWithDates.length > 0 ? itemsWithDates.reduce((min, i) => parseISO(i.startDate) < min ? parseISO(i.startDate) : min, parseISO(itemsWithDates[0].startDate)) : new Date();
             const projectEndDate = itemsWithDates.length > 0 ? itemsWithDates.reduce((max, i) => parseISO(i.deadline) > max ? parseISO(i.deadline) : max, parseISO(itemsWithDates[0].deadline)) : new Date();

            return [{
                id: p.id,
                name: p.name,
                level: 0,
                responsible: '',
                status: 'Pendente' as DevProjectStatus,
                startDate: projectStartDate,
                endDate: projectEndDate,
                isParent: true,
                originalProject: p,
                isOverdue: false,
            }, ...p.items.flatMap(i => [
                {
                    id: i.id, name: i.title, level: 1, responsible: i.responsible, status: i.status, startDate: parseISO(i.startDate), endDate: parseISO(i.deadline), isParent: i.subItems.length > 0, originalProject: p, isOverdue: isBefore(parseISO(i.deadline), startOfDay(new Date())) && i.status !== 'Concluído', itemId: i.id
                },
                ...i.subItems.map(si => ({
                    id: si.id, name: si.title, level: 2, responsible: si.responsible, status: si.status, startDate: parseISO(si.startDate), endDate: parseISO(si.deadline), isParent: false, originalProject: p, isOverdue: isBefore(parseISO(si.deadline), startOfDay(new Date())) && si.status !== 'Concluído', itemId: i.id, subItemId: si.id
                }))
            ])]
        }).flat();
        
        const monthHeaders: { name: string; colSpan: number }[] = [];
        if (dateHeaders.length > 0) {
            let currentMonth = -1;
            dateHeaders.forEach(date => {
                const month = getMonth(date);
                const year = getYear(date);

                if (month !== currentMonth) {
                    currentMonth = month;
                    monthHeaders.push({ name: format(date, 'MMM yyyy', { locale: ptBR }), colSpan: 1 });
                } else {
                    monthHeaders[monthHeaders.length - 1].colSpan++;
                }
            });
        }
        
        return { tasks: ganttTasks, dateHeaders, monthHeaders };
    }, [projects]);


    if (projects.length === 0) {
        return (
            <Card className="flex items-center justify-center h-full">
                <CardContent>
                    <p className="text-muted-foreground">Nenhum projeto encontrado com os filtros aplicados.</p>
                </CardContent>
            </Card>
        );
    }
    
    return (
        <div className="border-y w-full">
             <Table className="w-full table-fixed">
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        <TableHead className="w-64 sticky left-0 bg-muted/50 z-10 text-[10px]">Projeto / Item</TableHead>
                        <TableHead className="w-32 text-[10px]">Responsável</TableHead>
                        <TableHead className="w-40 text-[10px]">Status</TableHead>
                        <TableHead className="w-28 text-[10px]">Prazo</TableHead>
                        {monthHeaders.map((month, index) => (
                            <TableHead 
                                key={index} 
                                colSpan={month.colSpan} 
                                className="text-center text-[10px] font-semibold whitespace-nowrap"
                                style={{ padding: '0 1px' }}
                            >
                                {month.name}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                 <TableBody>
                    {tasks.map(task => {
                        const statusToUse = task.isOverdue ? 'Em atraso' : task.status;
                        const statusOptions = task.isOverdue ? OVERDUE_STATUS_OPTIONS : BASE_STATUS_OPTIONS;
                        
                        return (
                             <TableRow key={task.id} className={cn("h-8", task.isOverdue && "bg-destructive/10")}>
                                <TableCell className="sticky left-0 bg-background z-10 text-[10px]">
                                     <div className={cn("flex items-center gap-1 truncate",
                                        task.level === 0 && "font-bold",
                                        task.level === 1 && "pl-4",
                                        task.level === 2 && "pl-8"
                                    )}>
                                     {task.level === 0 ? <ChevronDown className="h-4 w-4" /> : task.level === 1 && task.isParent ? <ChevronDown className="h-4 w-4" /> : task.level === 2 ? <CornerDownRight className="h-4 w-4 text-muted-foreground"/> : <span className="w-4 h-4"></span>}

                                    {task.level === 0 ? (
                                        <Button variant="link" className="p-0 h-auto text-current font-bold truncate text-[10px]" onClick={() => onProjectClick(task.originalProject)}>
                                            {task.name}
                                        </Button>
                                    ) : (
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                            <Button
                                                variant="ghost"
                                                className="p-0 h-auto text-current truncate flex-1 text-left justify-start hover:underline text-[10px]"
                                                onClick={() => {
                                                    if (task.level === 2 && task.subItemId && task.itemId && onSubItemClick) {
                                                        onSubItemClick(task.originalProject.id, task.itemId, task.subItemId, task.name);
                                                    } else if (task.level === 1 && task.itemId && onItemClick) {
                                                        onItemClick(task.originalProject.id, task.itemId, task.name);
                                                    }
                                                }}
                                            >
                                                {task.name}
                                            </Button>
                                            {task.level > 0 && (() => {
                                                const unreadCount = getUnreadCount(
                                                    task.originalProject.id,
                                                    task.itemId,
                                                    task.subItemId
                                                );
                                                return unreadCount > 0 ? (
                                                    <Badge
                                                        variant="destructive"
                                                        className="h-5 min-w-5 px-1.5 text-[10px] flex-shrink-0"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (task.level === 2 && task.subItemId && task.itemId && onSubItemClick) {
                                                                onSubItemClick(task.originalProject.id, task.itemId, task.subItemId, task.name);
                                                            } else if (task.level === 1 && task.itemId && onItemClick) {
                                                                onItemClick(task.originalProject.id, task.itemId, task.name);
                                                            }
                                                        }}
                                                    >
                                                        {unreadCount}
                                                    </Badge>
                                                ) : null;
                                            })()}
                                        </div>
                                    )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-[10px]">{task.responsible}</TableCell>
                                <TableCell>
                                    {task.level > 0 && (
                                        <Select 
                                            value={statusToUse} 
                                            onValueChange={(newStatus: DevProjectStatus) => onStatusChange(task.originalProject.id, task.id, newStatus)}
                                        >
                                            <SelectTrigger className="h-8 text-[10px] px-2 w-[130px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="text-[10px]">
                                                {statusOptions.map(s => <SelectItem key={s} value={s} className="text-[10px]">{s}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </TableCell>
                                <TableCell className="text-[10px]">{task.level > 0 ? format(task.endDate, 'dd/MM/yy') : ''}</TableCell>
                                {dateHeaders.map((day, dayIndex) => {
                                    const isInRange = task.level > 0 && isWithinInterval(day, { start: task.startDate, end: task.endDate });
                                    const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                                    const isTodayMarker = isToday(day);

                                    let barColor = '';
                                    if (isInRange) {
                                        if (task.level === 1) {
                                            barColor = 'bg-green-800'; // Dark green for items
                                        } else if (task.level === 2) {
                                            barColor = 'bg-green-400'; // Light green for sub-items
                                        }
                                    }

                                    return (
                                        <TableCell 
                                            key={dayIndex} 
                                            className={cn("relative", isWeekend && "bg-muted/50", isTodayMarker && "bg-red-100/50 dark:bg-red-900/20")}
                                            style={{ 
                                                width: '1px', 
                                                minWidth: '1px', 
                                                maxWidth: '1px',
                                                padding: '0',
                                                margin: '0',
                                                border: 'none'
                                            }}
                                        >
                                            {isTodayMarker && <div className="absolute inset-y-0 left-0 w-px bg-red-500"></div>}
                                            {isInRange && (
                                                <div className={cn("h-full w-full opacity-70", barColor)} title={`${task.name}: ${format(task.startDate, 'dd/MM')} - ${format(task.endDate, 'dd/MM')}`}>&nbsp;</div>
                                            )}
                                        </TableCell>
                                    )
                                })}
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
