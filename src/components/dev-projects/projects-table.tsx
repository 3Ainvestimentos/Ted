
"use client";

import React, { useState, useMemo } from 'react';
import { useDevProjects } from '@/contexts/dev-projects-context';
import type { DevProject, DevProjectItem, DevProjectSubItem, DevProjectStatus } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { ChevronDown, ChevronRight, CornerDownRight, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { format } from 'date-fns';

const STATUS_OPTIONS: DevProjectStatus[] = ['Pendente', 'Em Andamento', 'Concluído', 'Em Espera', 'Cancelado'];

const StatusBadge = ({ status }: { status: DevProjectStatus }) => {
    const colorClasses: Record<DevProjectStatus, string> = {
        'Pendente': 'bg-gray-200 text-gray-800',
        'Em Andamento': 'bg-blue-200 text-blue-800',
        'Concluído': 'bg-green-200 text-green-800',
        'Em Espera': 'bg-yellow-200 text-yellow-800',
        'Cancelado': 'bg-red-200 text-red-800',
    };
    return <span className={cn('px-2 py-0.5 text-xs rounded-full font-medium', colorClasses[status])}>{status}</span>;
}

export function ProjectsTable() {
    const { projects, allResponsibles } = useDevProjects();
    const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set(projects.map(p => p.id)));
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

    // Filters
    const [projectFilter, setProjectFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState<DevProjectStatus | 'all'>('all');
    const [responsibleFilter, setResponsibleFilter] = useState('all');
    const [deadlineFilter, setDeadlineFilter] = useState<Date | null>(null);

    const filteredProjects = useMemo(() => {
        return projects
            .filter(p => projectFilter === 'all' || p.id === projectFilter)
            .map(project => {
                const filteredItems = project.items.map(item => {
                    const filteredSubItems = item.subItems.filter(subItem =>
                        (statusFilter === 'all' || subItem.status === statusFilter) &&
                        (responsibleFilter === 'all' || subItem.responsible === responsibleFilter) &&
                        (!deadlineFilter || new Date(subItem.deadline) <= deadlineFilter)
                    );

                    // If sub-items are filtered, should the parent item be shown?
                    // Logic: show parent if it matches or if any of its children match
                    const itemMatches = (statusFilter === 'all' || item.status === statusFilter) &&
                                        (responsibleFilter === 'all' || item.responsible === responsibleFilter) &&
                                        (!deadlineFilter || new Date(item.deadline) <= deadlineFilter);

                    if (itemMatches || filteredSubItems.length > 0) {
                        return { ...item, subItems: filteredSubItems };
                    }
                    return null;
                }).filter((item): item is DevProjectItem => item !== null);

                if (filteredItems.length > 0) {
                    return { ...project, items: filteredItems };
                }
                return null;
            }).filter((p): p is DevProject => p !== null);
    }, [projects, projectFilter, statusFilter, responsibleFilter, deadlineFilter]);


    const toggleProject = (projectId: string) => {
        setExpandedProjects(prev => {
            const newSet = new Set(prev);
            if (newSet.has(projectId)) newSet.delete(projectId);
            else newSet.add(projectId);
            return newSet;
        });
    };

    const toggleItem = (itemId: string) => {
        setExpandedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(itemId)) newSet.delete(itemId);
            else newSet.add(itemId);
            return newSet;
        });
    };
    
    return (
        <div className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg bg-card shadow-sm">
                <Select value={projectFilter} onValueChange={setProjectFilter}>
                    <SelectTrigger><SelectValue placeholder="Filtrar por projeto..." /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos os Projetos</SelectItem>
                        {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                    <SelectTrigger><SelectValue placeholder="Filtrar por status..." /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos os Status</SelectItem>
                        {STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={responsibleFilter} onValueChange={setResponsibleFilter}>
                    <SelectTrigger><SelectValue placeholder="Filtrar por responsável..." /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos os Responsáveis</SelectItem>
                        {allResponsibles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                </Select>
                 <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                            {deadlineFilter ? `Prazo até ${format(deadlineFilter, "dd/MM/yyyy")}`: "Filtrar por prazo..."}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={deadlineFilter || undefined} onSelect={setDeadlineFilter} />
                    </PopoverContent>
                </Popover>
            </div>

            <div className="border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[45%]">Projeto / Item</TableHead>
                            <TableHead>Responsável</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Prazo</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredProjects.length === 0 ? (
                             <TableRow><TableCell colSpan={4} className="h-24 text-center">Nenhum projeto encontrado com os filtros aplicados.</TableCell></TableRow>
                        ) : filteredProjects.map(project => (
                            <React.Fragment key={project.id}>
                                <TableRow className="bg-muted/30 hover:bg-muted/50">
                                    <TableCell>
                                        <Button variant="ghost" size="sm" onClick={() => toggleProject(project.id)} className="flex items-center gap-2">
                                            {expandedProjects.has(project.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                            <span className="font-bold text-base">{project.name}</span>
                                        </Button>
                                    </TableCell>
                                    <TableCell colSpan={3}></TableCell>
                                </TableRow>
                                {expandedProjects.has(project.id) && project.items.map(item => (
                                    <React.Fragment key={item.id}>
                                        <TableRow>
                                            <TableCell className="pl-8">
                                                 <Button variant="ghost" size="sm" onClick={() => toggleItem(item.id)} className="flex items-center gap-2">
                                                    {item.subItems.length > 0 ? (expandedItems.has(item.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />) : <ChevronsRight className="h-4 w-4 opacity-0"/>}
                                                    <span>{item.title}</span>
                                                </Button>
                                            </TableCell>
                                            <TableCell>{item.responsible}</TableCell>
                                            <TableCell><StatusBadge status={item.status} /></TableCell>
                                            <TableCell>{format(new Date(item.deadline), 'dd/MM/yyyy')}</TableCell>
                                        </TableRow>
                                        {expandedItems.has(item.id) && item.subItems.map(subItem => (
                                            <TableRow key={subItem.id} className="bg-background hover:bg-secondary/30">
                                                <TableCell className="pl-16">
                                                     <div className="flex items-center gap-2">
                                                        <CornerDownRight className="h-4 w-4 text-muted-foreground" />
                                                        <span>{subItem.title}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{subItem.responsible}</TableCell>
                                                <TableCell><StatusBadge status={subItem.status} /></TableCell>
                                                <TableCell>{format(new Date(subItem.deadline), 'dd/MM/yyyy')}</TableCell>
                                            </TableRow>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </React.Fragment>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
