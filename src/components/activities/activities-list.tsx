"use client";

import React, { useMemo } from 'react';
import type { DevProject, DevProjectStatus } from '@/types';
import { parseISO, startOfWeek, endOfWeek, differenceInDays, isWithinInterval, startOfDay, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useDevProjects } from '@/contexts/dev-projects-context';

interface Activity {
    id: string;
    subItemId: string;
    subItemTitle: string;
    projectId: string;
    projectName: string;
    itemId: string;
    itemTitle: string;
    responsible: string;
    deadline: Date;
    status: DevProjectStatus;
    priority: 'high' | 'medium' | 'low';
    daysUntilDeadline: number;
    isAtRisk: boolean;
}

interface ActivitiesListProps {
    projects: DevProject[];
    projectFilter: string;
    responsibleFilter: string;
    priorityFilter: 'all' | 'high' | 'medium' | 'low';
    statusFilter: DevProjectStatus | 'all';
}

function calculatePriority(deadline: Date, itemDeadline: Date): 'high' | 'medium' | 'low' {
    const today = startOfDay(new Date());
    const daysUntilDeadline = differenceInDays(deadline, today);
    const daysUntilItemDeadline = differenceInDays(itemDeadline, today);
    
    // Alta: deadline hoje ou amanhã
    if (daysUntilDeadline <= 1) return 'high';
    
    // Média: deadline esta semana OU impacto direto no item pai
    if (daysUntilDeadline <= 7 || daysUntilDeadline >= daysUntilItemDeadline - 3) {
        return 'medium';
    }
    
    return 'low';
}

export function ActivitiesList({ projects, projectFilter, responsibleFilter, priorityFilter, statusFilter }: ActivitiesListProps) {
    const { updateItemStatus } = useDevProjects();

    const activities = useMemo(() => {
        const today = new Date();
        const weekStart = startOfWeek(today, { locale: ptBR });
        const weekEnd = endOfWeek(today, { locale: ptBR });

        const allActivities: Activity[] = [];

        projects
            .filter(p => projectFilter === 'all' || p.id === projectFilter)
            .forEach(project => {
                project.items.forEach(item => {
                    const itemDeadline = parseISO(item.deadline);
                    
                    item.subItems
                        .filter(subItem => {
                            // Apenas subitens não concluídos
                            if (subItem.status === 'Concluído') return false;
                            
                            // Filtro por responsável
                            if (responsibleFilter !== 'all' && subItem.responsible !== responsibleFilter) return false;
                            
                            // Filtro por status
                            if (statusFilter !== 'all' && subItem.status !== statusFilter) return false;
                            
                            const subItemDeadline = parseISO(subItem.deadline);
                            
                            // Deadline na semana vigente OU nos próximos 7 dias
                            const isInCurrentWeek = isWithinInterval(subItemDeadline, { start: weekStart, end: weekEnd });
                            const isInNext7Days = differenceInDays(subItemDeadline, today) >= 0 && differenceInDays(subItemDeadline, today) <= 7;
                            
                            return isInCurrentWeek || isInNext7Days;
                        })
                        .forEach(subItem => {
                            const subItemDeadline = parseISO(subItem.deadline);
                            const itemDeadline = parseISO(item.deadline);
                            const daysUntilDeadline = differenceInDays(subItemDeadline, today);
                            const priority = calculatePriority(subItemDeadline, itemDeadline);
                            
                            // Verificar se o atraso impacta o item pai
                            const isAtRisk = daysUntilDeadline >= differenceInDays(itemDeadline, today) - 3;
                            
                            allActivities.push({
                                id: `${project.id}-${item.id}-${subItem.id}`,
                                subItemId: subItem.id,
                                subItemTitle: subItem.title,
                                projectId: project.id,
                                projectName: project.name,
                                itemId: item.id,
                                itemTitle: item.title,
                                responsible: subItem.responsible,
                                deadline: subItemDeadline,
                                status: subItem.status,
                                priority,
                                daysUntilDeadline,
                                isAtRisk,
                            });
                        });
                });
            });

        // Ordenar por prioridade e depois por deadline
        return allActivities.sort((a, b) => {
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
            if (priorityDiff !== 0) return priorityDiff;
            return a.daysUntilDeadline - b.daysUntilDeadline;
        });
    }, [projects, projectFilter, responsibleFilter, statusFilter]);

    const filteredActivities = useMemo(() => {
        return activities.filter(activity => {
            if (priorityFilter !== 'all' && activity.priority !== priorityFilter) return false;
            return true;
        });
    }, [activities, priorityFilter]);

    const handleStatusChange = async (projectId: string, subItemId: string, newStatus: DevProjectStatus) => {
        // Atualizar o status do subitem (o método updateItemStatus verifica se é item ou subitem)
        await updateItemStatus(projectId, subItemId, newStatus);
    };

    if (filteredActivities.length === 0) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center h-48">
                    <p className="text-muted-foreground">Nenhuma atividade encontrada para a semana vigente.</p>
                </CardContent>
            </Card>
        );
    }

    const priorityBadgeVariant = (priority: 'high' | 'medium' | 'low') => {
        switch (priority) {
            case 'high': return 'destructive';
            case 'medium': return 'default';
            case 'low': return 'secondary';
        }
    };

    const priorityLabel = (priority: 'high' | 'medium' | 'low') => {
        switch (priority) {
            case 'high': return 'Alta';
            case 'medium': return 'Média';
            case 'low': return 'Baixa';
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Atividades da Semana Vigente</CardTitle>
                <CardDescription>
                    {filteredActivities.length} {filteredActivities.length === 1 ? 'atividade encontrada' : 'atividades encontradas'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Projeto / Item / Subitem</TableHead>
                            <TableHead>Responsável</TableHead>
                            <TableHead>Prioridade</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Prazo</TableHead>
                            <TableHead>Dias Restantes</TableHead>
                            <TableHead>Risco</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredActivities.map(activity => (
                            <TableRow key={activity.id} className={cn(activity.isAtRisk && "bg-yellow-50 dark:bg-yellow-950/20")}>
                                <TableCell>
                                    <div className="space-y-1">
                                        <div className="font-semibold text-sm">{activity.projectName}</div>
                                        <div className="text-xs text-muted-foreground">{activity.itemTitle}</div>
                                        <div className="text-xs font-medium">{activity.subItemTitle}</div>
                                    </div>
                                </TableCell>
                                <TableCell>{activity.responsible}</TableCell>
                                <TableCell>
                                    <Badge variant={priorityBadgeVariant(activity.priority)}>
                                        {priorityLabel(activity.priority)}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Select 
                                        value={activity.status} 
                                        onValueChange={(newStatus: DevProjectStatus) => 
                                            handleStatusChange(activity.projectId, activity.subItemId, newStatus)
                                        }
                                    >
                                        <SelectTrigger className="w-[140px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Pendente">Pendente</SelectItem>
                                            <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                                            <SelectItem value="Concluído">Concluído</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell>{format(activity.deadline, 'dd/MM/yyyy')}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {activity.daysUntilDeadline < 0 ? (
                                            <>
                                                <AlertCircle className="h-4 w-4 text-destructive" />
                                                <span className="text-destructive font-semibold">
                                                    {Math.abs(activity.daysUntilDeadline)} {Math.abs(activity.daysUntilDeadline) === 1 ? 'dia atrasado' : 'dias atrasados'}
                                                </span>
                                            </>
                                        ) : activity.daysUntilDeadline === 0 ? (
                                            <>
                                                <Clock className="h-4 w-4 text-orange-500" />
                                                <span className="text-orange-500 font-semibold">Hoje</span>
                                            </>
                                        ) : activity.daysUntilDeadline === 1 ? (
                                            <>
                                                <Clock className="h-4 w-4 text-orange-500" />
                                                <span className="text-orange-500">Amanhã</span>
                                            </>
                                        ) : (
                                            <>
                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                                <span>{activity.daysUntilDeadline} dias</span>
                                            </>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {activity.isAtRisk ? (
                                        <Badge variant="outline" className="border-yellow-500 text-yellow-700 dark:text-yellow-400">
                                            <AlertCircle className="h-3 w-3 mr-1" />
                                            Em Risco
                                        </Badge>
                                    ) : (
                                        <span className="text-muted-foreground text-sm">-</span>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

