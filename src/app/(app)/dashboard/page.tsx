
"use client";

import React, { useState, useMemo, useCallback } from "react";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { KanbanColumn } from "@/components/dashboard/kanban-column";
import { MOCK_INITIATIVES, KANBAN_COLUMN_DISPLAY_ORDER, KANBAN_COLUMN_NAMES, STATUS_TO_COLUMN_MAP } from "@/lib/constants";
import type { Initiative, InitiativeStatus } from "@/types";
import { Plus, MoreHorizontal, Search, Filter as FilterIcon, ChevronDown, GripVertical, List } from "lucide-react";

interface Column {
  id: InitiativeStatus;
  title: string;
  tasks: Initiative[];
}

export default function DashboardPage() {
  const [initiatives, setInitiatives] = useState<Initiative[]>(MOCK_INITIATIVES);

  const handleDropTask = useCallback((taskId: string, newColumnId: InitiativeStatus) => {
    // In a real app, this would also involve finding the correct status string
    // based on the column ID if they differ (e.g., 'Em Dia' column can have 'Em Risco' status)
    // For this implementation, we'll map the column ID directly to a status.
    const newStatus = newColumnId; // Simplified for this example

    setInitiatives(prevInitiatives => {
        return prevInitiatives.map(task => 
            task.id === taskId ? { ...task, status: newStatus } : task
        );
    });
  }, []);

  const columns: Column[] = useMemo(() => {
    const groupedTasks: Record<InitiativeStatus, Initiative[]> = {
      'A Fazer': [],
      'Em Dia': [],
      'Em Risco': [], 
      'Atrasado': [], 
      'Concluído': [],
    };

    initiatives.forEach(task => {
      const targetColumnKey = STATUS_TO_COLUMN_MAP[task.status];
      if (groupedTasks[targetColumnKey]) {
        groupedTasks[targetColumnKey].push(task);
      }
    });
    
    const displayableStatuses = KANBAN_COLUMN_DISPLAY_ORDER.filter(status => KANBAN_COLUMN_NAMES[status]);

    return displayableStatuses.map(statusKey => ({
      id: statusKey,
      title: KANBAN_COLUMN_NAMES[statusKey],
      tasks: groupedTasks[statusKey] || [],
    }));

  }, [initiatives]);

  return (
    <DndProvider backend={HTML5Backend}>
        <div className="flex flex-col h-[calc(100vh-var(--header-height,4rem)-2rem)]">
            <div className="mb-4">
                <div className="flex items-center gap-2">
                    <GripVertical className="h-6 w-6 text-muted-foreground" />
                    <h1 className="text-2xl font-semibold text-foreground">Quadro de Status do Projeto</h1>
                </div>
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
                <Select defaultValue="status">
                <SelectTrigger className="w-auto h-8 text-xs px-2 py-1">
                    <SelectValue placeholder="Visualizar por" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="status">Por Status</SelectItem>
                    <SelectItem value="owner">Por Responsável</SelectItem>
                    <SelectItem value="priority">Por Prioridade</SelectItem>
                </SelectContent>
                </Select>
                <Button variant="ghost" size="sm" className="h-8 text-xs px-2 py-1 text-muted-foreground hover:text-foreground">Propriedades</Button>
                <Button variant="ghost" size="sm" className="h-8 text-xs px-2 py-1 text-muted-foreground hover:text-foreground">Agrupar por: Status</Button>
                <Button variant="ghost" size="sm" className="h-8 text-xs px-2 py-1 text-muted-foreground hover:text-foreground">
                <FilterIcon className="h-3 w-3 mr-1" /> Filtro
                </Button>
                <Button variant="ghost" size="sm" className="h-8 text-xs px-2 py-1 text-muted-foreground hover:text-foreground">Ordenar</Button>
                <div className="relative">
                <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Buscar" className="pl-7 h-8 text-xs w-40" />
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground"><MoreHorizontal className="h-4 w-4" /></Button>
                <div className="ml-auto flex gap-2">
                <Button variant="default" size="sm" className="h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90">
                    Novo <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
                </div>
            </div>
            
            <div className="flex-grow overflow-x-auto pb-4">
                <div className="flex gap-4 h-full">
                {columns.map((column) => (
                    <KanbanColumn key={column.id} column={column} onDropTask={handleDropTask} />
                ))}
                
                <div className="w-auto flex-shrink-0 p-2 flex flex-col gap-2 text-sm">
                    <Button variant="ghost" size="sm" className="h-8 text-xs px-2 py-1 text-muted-foreground hover:text-foreground">
                        <List className="mr-1 h-3.5 w-3.5" /> Colunas Ocultas
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 text-xs px-2 py-1 text-muted-foreground hover:text-foreground">
                        <Plus className="mr-1 h-3.5 w-3.5" /> Adicionar um grupo
                    </Button>
                </div>
                </div>
            </div>
        </div>
    </DndProvider>
  );
}
