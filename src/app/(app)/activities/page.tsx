"use client";

import React, { useState, useMemo } from 'react';
import { PageHeader } from "@/components/layout/page-header";
import { useDevProjects } from '@/contexts/dev-projects-context';
import { ActivitiesList } from '@/components/activities/activities-list';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from '@/components/ui/skeleton';
import type { DevProjectStatus } from '@/types';

export default function ActivitiesPage() {
    const { projects, isLoading } = useDevProjects();
    
    // Filters
    const [projectFilter, setProjectFilter] = useState('all');
    const [responsibleFilter, setResponsibleFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
    const [statusFilter, setStatusFilter] = useState<DevProjectStatus | 'all'>('all');

    const allResponsibles = useMemo(() => {
        const responsibles = new Set<string>();
        projects.forEach(p => {
            p.items.forEach(i => {
                i.subItems.forEach(si => {
                    if (si.responsible) responsibles.add(si.responsible);
                });
            });
        });
        return Array.from(responsibles).sort();
    }, [projects]);

    return (
        <div className="space-y-6">
            <PageHeader
                title="Atividades"
                description="Subitens de projetos que devem ser concluídos na semana vigente para evitar atrasos."
            />
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg bg-card shadow-sm">
                <Select value={projectFilter} onValueChange={setProjectFilter}>
                    <SelectTrigger><SelectValue placeholder="Filtrar por projeto..." /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos os Projetos</SelectItem>
                        {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={responsibleFilter} onValueChange={setResponsibleFilter}>
                    <SelectTrigger><SelectValue placeholder="Filtrar por responsável..." /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos os Responsáveis</SelectItem>
                        {allResponsibles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as 'all' | 'high' | 'medium' | 'low')}>
                    <SelectTrigger><SelectValue placeholder="Filtrar por prioridade..." /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas as Prioridades</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="low">Baixa</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as DevProjectStatus | 'all')}>
                    <SelectTrigger><SelectValue placeholder="Filtrar por status..." /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos os Status</SelectItem>
                        <SelectItem value="Pendente">Pendente</SelectItem>
                        <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                        <SelectItem value="Concluído">Concluído</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-48 w-full" />
                </div>
            ) : (
                <ActivitiesList
                    projects={projects}
                    projectFilter={projectFilter}
                    responsibleFilter={responsibleFilter}
                    priorityFilter={priorityFilter}
                    statusFilter={statusFilter}
                />
            )}
        </div>
    );
}

