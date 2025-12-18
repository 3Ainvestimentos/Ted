"use client";

import React, { useMemo, useState } from 'react';
import type { Initiative, InitiativeStatus, SubItem } from '@/types';
import { startOfDay, endOfDay, parseISO, eachDayOfInterval, isWithinInterval, getMonth, getYear, format, isToday, isBefore, startOfMonth, endOfMonth, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight, CornerDownRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const INITIATIVE_STATUS_OPTIONS: InitiativeStatus[] = ['Pendente', 'Em execução', 'Concluído', 'Suspenso', 'A Fazer', 'Em Dia', 'Em Risco', 'Atrasado'];

interface GanttTask {
    id: string;
    name: string;
    level: number;
    responsible: string;
    status: InitiativeStatus;
    startDate: Date;
    endDate: Date;
    isParent: boolean;
    originalInitiative: Initiative;
    isOverdue: boolean;
    subItemId?: string;
}

interface InitiativesGanttViewProps {
    initiatives: Initiative[];
    onInitiativeClick: (initiative: Initiative) => void;
    onStatusChange?: (initiativeId: string, newStatus: InitiativeStatus) => void;
}

export function InitiativesGanttView({ initiatives, onInitiativeClick, onStatusChange }: InitiativesGanttViewProps) {
    const [expandedInitiatives, setExpandedInitiatives] = useState<Set<string>>(new Set());

    const toggleInitiative = (initiativeId: string) => {
        setExpandedInitiatives(prev => {
            const newSet = new Set(prev);
            if (newSet.has(initiativeId)) {
                newSet.delete(initiativeId);
            } else {
                newSet.add(initiativeId);
            }
            return newSet;
        });
    };

    const { tasks, dateHeaders, monthHeaders } = useMemo(() => {
        if (!initiatives || initiatives.length === 0) {
            return { tasks: [], dateHeaders: [], monthHeaders: [] };
        }

        // Calendário fixo: mês atual + próximos 5 meses (6 meses total)
        const today = new Date();
        const chartStartDate = startOfMonth(today);
        const chartEndDate = endOfMonth(addMonths(today, 5)); // 5 meses à frente = 6 meses total

        const dateHeaders = eachDayOfInterval({ start: chartStartDate, end: chartEndDate });

        const ganttTasks: GanttTask[] = initiatives
            .filter(initiative => !initiative.archived)
            .map(initiative => {
                // Usar lastUpdate como startDate, ou data atual se não houver
                let startDate: Date;
                try {
                    startDate = initiative.lastUpdate 
                        ? (parseISO(initiative.lastUpdate).toString() !== 'Invalid Date' ? parseISO(initiative.lastUpdate) : new Date())
                        : new Date();
                } catch {
                    startDate = new Date();
                }
                
                // Usar deadline como endDate, ou 30 dias a partir de startDate se não houver
                let endDate: Date;
                try {
                    endDate = initiative.deadline 
                        ? (parseISO(initiative.deadline).toString() !== 'Invalid Date' ? parseISO(initiative.deadline) : new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000))
                        : new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);
                } catch {
                    endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);
                }

                const isOverdue = initiative.deadline 
                    ? (() => {
                        try {
                            const deadlineDate = parseISO(initiative.deadline);
                            return deadlineDate.toString() !== 'Invalid Date' && isBefore(deadlineDate, startOfDay(new Date())) && initiative.status !== 'Concluído';
                        } catch {
                            return false;
                        }
                    })()
                    : false;

                const hasSubItems = initiative.subItems && initiative.subItems.length > 0;

                return [{
                    id: initiative.id,
                    name: initiative.title,
                    level: 0,
                    responsible: initiative.owner,
                    status: initiative.status,
                    startDate,
                    endDate,
                    isParent: hasSubItems,
                    originalInitiative: initiative,
                    isOverdue,
                }, ...(initiative.subItems || []).map(subItem => {
                    const subItemStartDate = startDate; // Usar a mesma data de início da iniciativa
                    let subItemEndDate: Date;
                    try {
                        subItemEndDate = subItem.deadline 
                            ? (parseISO(subItem.deadline).toString() !== 'Invalid Date' ? parseISO(subItem.deadline) : endDate)
                            : endDate; // Usar deadline da iniciativa se não houver deadline do subitem
                    } catch {
                        subItemEndDate = endDate;
                    }
                    
                    const subItemIsOverdue = subItem.deadline 
                        ? (() => {
                            try {
                                const subItemDeadlineDate = parseISO(subItem.deadline);
                                return subItemDeadlineDate.toString() !== 'Invalid Date' && isBefore(subItemDeadlineDate, startOfDay(new Date())) && !subItem.completed;
                            } catch {
                                return false;
                            }
                        })()
                        : false;

                    return {
                        id: subItem.id,
                        name: subItem.title,
                        level: 1,
                        responsible: initiative.owner,
                        status: subItem.completed ? 'Concluído' as InitiativeStatus : initiative.status,
                        startDate: subItemStartDate,
                        endDate: subItemEndDate,
                        isParent: false,
                        originalInitiative: initiative,
                        isOverdue: subItemIsOverdue,
                        subItemId: subItem.id,
                    };
                })]
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
    }, [initiatives]);

    // Filtrar tasks para mostrar apenas subitens de iniciativas expandidas
    const visibleTasks = useMemo(() => {
        return tasks.filter(task => {
            if (task.level === 0) {
                // Sempre mostrar iniciativas principais
                return true;
            } else if (task.level === 1) {
                // Mostrar subitens apenas se a iniciativa pai estiver expandida
                return expandedInitiatives.has(task.originalInitiative.id);
            }
            return true;
        });
    }, [tasks, expandedInitiatives]);

    if (initiatives.length === 0) {
        return (
            <Card className="flex items-center justify-center h-full">
                <CardContent>
                    <p className="text-muted-foreground">Nenhuma iniciativa encontrada.</p>
                </CardContent>
            </Card>
        );
    }
    
    return (
        <div className="border-y w-full">
             <Table className="w-full table-fixed">
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        <TableHead className="w-64 sticky left-0 bg-muted/50 z-10 text-[10px]">Iniciativa / Subitem</TableHead>
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
                    {visibleTasks.map(task => {
                        const statusToUse = task.isOverdue ? 'Atrasado' : task.status;
                        const isExpanded = expandedInitiatives.has(task.originalInitiative.id);
                        const hasSubItems = task.isParent && task.level === 0;
                        
                        return (
                             <TableRow key={task.id} className={cn("h-8", task.isOverdue && "bg-destructive/10")}>
                                <TableCell className="sticky left-0 bg-background z-10 text-[10px]">
                                     <div className={cn("flex items-center gap-1 truncate",
                                        task.level === 0 && "font-bold",
                                        task.level === 1 && "pl-4"
                                    )}>
                                     {task.level === 0 && hasSubItems ? (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleInitiative(task.originalInitiative.id);
                                            }}
                                            className="flex-shrink-0 hover:bg-muted rounded p-0.5 transition-colors"
                                        >
                                            {isExpanded ? (
                                                <ChevronDown className="h-4 w-4" />
                                            ) : (
                                                <ChevronRight className="h-4 w-4" />
                                            )}
                                        </button>
                                     ) : task.level === 0 ? (
                                        <span className="w-4 h-4"></span>
                                     ) : task.level === 1 ? (
                                        <CornerDownRight className="h-4 w-4 text-muted-foreground"/>
                                     ) : (
                                        <span className="w-4 h-4"></span>
                                     )}

                                    {task.level === 0 ? (
                                        <Button variant="link" className="p-0 h-auto text-current font-bold truncate text-[10px]" onClick={() => onInitiativeClick(task.originalInitiative)}>
                                            {task.name}
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="ghost"
                                            className="p-0 h-auto text-current truncate flex-1 text-left justify-start hover:underline text-[10px]"
                                            onClick={() => onInitiativeClick(task.originalInitiative)}
                                        >
                                            {task.name}
                                        </Button>
                                    )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-[10px]">{task.responsible}</TableCell>
                                <TableCell>
                                    {onStatusChange && (
                                        <Select 
                                            value={statusToUse} 
                                            onValueChange={(newStatus: InitiativeStatus) => onStatusChange(task.originalInitiative.id, newStatus)}
                                        >
                                            <SelectTrigger className="h-8 text-[10px] px-2 w-[130px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="text-[10px]">
                                                {INITIATIVE_STATUS_OPTIONS.map(s => <SelectItem key={s} value={s} className="text-[10px]">{s}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    )}
                                    {!onStatusChange && (
                                        <span className="text-[10px]">{statusToUse}</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-[10px]">{format(task.endDate, 'dd/MM/yy')}</TableCell>
                                {dateHeaders.map((day, dayIndex) => {
                                    const isInRange = isWithinInterval(day, { start: task.startDate, end: task.endDate });
                                    const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                                    const isTodayMarker = isToday(day);

                                    let barColor = '';
                                    if (isInRange) {
                                        if (task.level === 0) {
                                            barColor = 'bg-blue-800'; // Dark blue for initiatives
                                        } else if (task.level === 1) {
                                            barColor = 'bg-blue-400'; // Light blue for sub-items
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

