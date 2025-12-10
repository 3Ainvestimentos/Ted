
"use client";

import React, { useState } from 'react';
import { PageHeader } from "@/components/layout/page-header";
import { GanttChart } from "@/components/dev-projects/gantt-chart";
import { ProjectsTable } from "@/components/dev-projects/projects-table";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List } from "lucide-react";
import { useDevProjects } from '@/contexts/dev-projects-context';
import { Skeleton } from '@/components/ui/skeleton';

type ViewMode = 'list' | 'gantt';

export default function DevelopmentProjectsPage() {
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const { isLoading } = useDevProjects();

    return (
        <div className="space-y-6">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <PageHeader
                    title="Projetos de Desenvolvimento"
                    description="Gerencie projetos de implementação de ferramentas da área de desenvolvimento."
                />
                 <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
                    <div className="p-1 bg-muted rounded-lg flex items-center">
                        <Button
                            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('list')}
                            className="h-8 px-3"
                        >
                            <List className="h-4 w-4" />
                            <span className="ml-2 hidden sm:inline">Lista</span>
                        </Button>
                        <Button
                            variant={viewMode === 'gantt' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('gantt')}
                            className="h-8 px-3"
                        >
                            <LayoutGrid className="h-4 w-4" />
                            <span className="ml-2 hidden sm:inline">Gantt</span>
                        </Button>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            ) : viewMode === 'list' ? (
                <ProjectsTable />
            ) : (
                <GanttChart />
            )}
        </div>
    );
}
