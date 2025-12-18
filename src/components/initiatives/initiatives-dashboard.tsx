"use client";

import React, { useMemo } from 'react';
import type { Initiative } from '@/types';
import { parseISO, isBefore, startOfDay } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { CheckCircle2, Clock, AlertTriangle, TrendingUp, Users, Target, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InitiativesDashboardProps {
    initiatives: Initiative[];
}

export function InitiativesDashboard({ initiatives }: InitiativesDashboardProps) {
    const metrics = useMemo(() => {
        const activeInitiatives = initiatives.filter(i => !i.archived);
        const total = activeInitiatives.length;

        if (total === 0) {
            return {
                total: 0,
                concluded: 0,
                concludedPercentage: 0,
                delayed: 0,
                delayedPercentage: 0,
                onTime: 0,
                onTimePercentage: 0,
                averageProgress: 0,
                byOwner: [] as { owner: string; count: number }[],
                byPriority: {
                    Alta: 0,
                    Média: 0,
                    Baixa: 0,
                },
                byStatus: {} as Record<string, number>,
                withDeadline: 0,
                overdueCount: 0,
            };
        }

        const today = startOfDay(new Date());
        
        // Calcular métricas de status
        const concluded = activeInitiatives.filter(i => i.status === 'Concluído').length;
        const concludedPercentage = (concluded / total) * 100;

        // Calcular atrasadas (deadline passado e status não concluído)
        const delayed = activeInitiatives.filter(i => {
            if (i.status === 'Concluído') return false;
            if (!i.deadline) return false;
            const deadline = parseISO(i.deadline);
            return isBefore(deadline, today);
        }).length;
        const delayedPercentage = (delayed / total) * 100;

        // Calcular em dia (não concluídas, não atrasadas)
        const onTime = activeInitiatives.filter(i => {
            if (i.status === 'Concluído') return false;
            if (!i.deadline) return true; // Sem deadline considerado em dia
            const deadline = parseISO(i.deadline);
            return !isBefore(deadline, today);
        }).length;
        const onTimePercentage = (onTime / total) * 100;

        // Progresso médio
        const totalProgress = activeInitiatives.reduce((sum, i) => sum + (i.progress || 0), 0);
        const averageProgress = totalProgress / total;

        // Por responsável
        const ownerMap = new Map<string, number>();
        activeInitiatives.forEach(i => {
            const count = ownerMap.get(i.owner) || 0;
            ownerMap.set(i.owner, count + 1);
        });
        const byOwner = Array.from(ownerMap.entries())
            .map(([owner, count]) => ({ owner, count }))
            .sort((a, b) => b.count - a.count);

        // Por prioridade
        const byPriority = {
            Alta: activeInitiatives.filter(i => i.priority === 'Alta').length,
            Média: activeInitiatives.filter(i => i.priority === 'Média').length,
            Baixa: activeInitiatives.filter(i => i.priority === 'Baixa').length,
        };

        // Por status
        const statusMap = new Map<string, number>();
        activeInitiatives.forEach(i => {
            const count = statusMap.get(i.status) || 0;
            statusMap.set(i.status, count + 1);
        });
        const byStatus = Object.fromEntries(statusMap);

        // Com deadline
        const withDeadline = activeInitiatives.filter(i => i.deadline).length;

        // Atrasadas (deadline passado)
        const overdueCount = activeInitiatives.filter(i => {
            if (!i.deadline) return false;
            const deadline = parseISO(i.deadline);
            return isBefore(deadline, today) && i.status !== 'Concluído';
        }).length;

        return {
            total,
            concluded,
            concludedPercentage,
            delayed,
            delayedPercentage,
            onTime,
            onTimePercentage,
            averageProgress,
            byOwner,
            byPriority,
            byStatus,
            withDeadline,
            overdueCount,
        };
    }, [initiatives]);

    if (metrics.total === 0) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center h-48">
                    <p className="text-muted-foreground">Nenhuma iniciativa encontrada.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Cards de Métricas Principais */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Iniciativas</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.total}</div>
                        <p className="text-xs text-muted-foreground">Iniciativas ativas</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.concluded}</div>
                        <p className="text-xs text-muted-foreground">
                            {metrics.concludedPercentage.toFixed(1)}% do total
                        </p>
                        <Progress value={metrics.concludedPercentage} className="mt-2" />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Em Dia</CardTitle>
                        <Clock className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.onTime}</div>
                        <p className="text-xs text-muted-foreground">
                            {metrics.onTimePercentage.toFixed(1)}% do total
                        </p>
                        <Progress value={metrics.onTimePercentage} className="mt-2" />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Atrasadas</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{metrics.delayed}</div>
                        <p className="text-xs text-muted-foreground">
                            {metrics.delayedPercentage.toFixed(1)}% do total
                        </p>
                        <Progress value={metrics.delayedPercentage} className="mt-2" />
                    </CardContent>
                </Card>
            </div>

            {/* Progresso Médio e Métricas Adicionais */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Progresso Médio
                        </CardTitle>
                        <CardDescription>Progresso médio de todas as iniciativas</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-3xl font-bold">{metrics.averageProgress.toFixed(1)}%</span>
                                <Badge variant="outline">Média Geral</Badge>
                            </div>
                            <Progress value={metrics.averageProgress} className="h-3" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Distribuição por Prioridade
                        </CardTitle>
                        <CardDescription>Quantidade de iniciativas por nível de prioridade</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <span>Alta</span>
                                </div>
                                <span className="font-semibold">{metrics.byPriority.Alta}</span>
                            </div>
                            <Progress value={(metrics.byPriority.Alta / metrics.total) * 100} className="h-2" />
                            
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                    <span>Média</span>
                                </div>
                                <span className="font-semibold">{metrics.byPriority.Média}</span>
                            </div>
                            <Progress value={(metrics.byPriority.Média / metrics.total) * 100} className="h-2" />
                            
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    <span>Baixa</span>
                                </div>
                                <span className="font-semibold">{metrics.byPriority.Baixa}</span>
                            </div>
                            <Progress value={(metrics.byPriority.Baixa / metrics.total) * 100} className="h-2" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Por Responsável e Por Status */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Iniciativas por Responsável
                        </CardTitle>
                        <CardDescription>Distribuição de iniciativas entre os responsáveis</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {metrics.byOwner.length > 0 ? (
                                metrics.byOwner.map(({ owner, count }) => (
                                    <div key={owner} className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">{owner}</span>
                                            <span className="text-sm text-muted-foreground">{count} {count === 1 ? 'iniciativa' : 'iniciativas'}</span>
                                        </div>
                                        <Progress value={(count / metrics.total) * 100} className="h-2" />
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground">Nenhum responsável encontrado</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5" />
                            Distribuição por Status
                        </CardTitle>
                        <CardDescription>Quantidade de iniciativas por status atual</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {Object.entries(metrics.byStatus).length > 0 ? (
                                Object.entries(metrics.byStatus)
                                    .sort(([, a], [, b]) => b - a)
                                    .map(([status, count]) => (
                                        <div key={status} className="space-y-1">
                                            <div className="flex items-center justify-between">
                                                <Badge variant="outline">{status}</Badge>
                                                <span className="text-sm font-semibold">{count}</span>
                                            </div>
                                            <Progress value={(count / metrics.total) * 100} className="h-2" />
                                        </div>
                                    ))
                            ) : (
                                <p className="text-sm text-muted-foreground">Nenhum status encontrado</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Métricas Adicionais */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Com Prazo Definido</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.withDeadline}</div>
                        <p className="text-xs text-muted-foreground">
                            de {metrics.total} iniciativas
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={cn("text-2xl font-bold", metrics.overdueCount > 0 && "text-red-600")}>
                            {metrics.overdueCount}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            iniciativas com prazo vencido
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.concludedPercentage.toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground">
                            {metrics.concluded} de {metrics.total} concluídas
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

