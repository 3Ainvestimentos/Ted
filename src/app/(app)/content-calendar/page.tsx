
"use client";

import React, { useMemo, useCallback } from "react";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ContentKanbanColumn } from "@/components/content-calendar/kanban-column";
import { CONTENT_COLUMN_DISPLAY_ORDER, CONTENT_COLUMN_NAMES } from "@/lib/constants";
import type { ContentItem, ContentStatus } from "@/types";
import { Plus, MoreHorizontal, Search, Filter as FilterIcon, ChevronDown, GripVertical, Calendar, List } from "lucide-react";
import { useContentCalendar } from "@/contexts/content-calendar-context";

interface Column {
  id: ContentStatus;
  title: string;
  items: ContentItem[];
}

export default function ContentCalendarPage() {
  const { contentItems, updateContentItemStatus } = useContentCalendar();

  const handleDropItem = useCallback((itemId: string, newStatus: ContentStatus) => {
    updateContentItemStatus(itemId, newStatus);
  }, [updateContentItemStatus]);

  const columns: Column[] = useMemo(() => {
    const groupedItems: Record<ContentStatus, ContentItem[]> = {
      'Idea': [],
      'Draft': [],
      'In Review': [],
      'Ready to Publish': [],
      'Published': [],
    };

    contentItems.forEach(item => {
        if (groupedItems[item.status]) {
            groupedItems[item.status].push(item);
        }
    });
    
    return CONTENT_COLUMN_DISPLAY_ORDER.map(statusKey => ({
      id: statusKey,
      title: CONTENT_COLUMN_NAMES[statusKey],
      items: groupedItems[statusKey] || [],
    }));

  }, [contentItems]);

  return (
    <DndProvider backend={HTML5Backend}>
        <div className="flex flex-col h-[calc(100vh-var(--header-height,4rem)-2rem)]">
            <div className="mb-4">
                <div className="flex items-center gap-2">
                    <Calendar className="h-6 w-6 text-muted-foreground" />
                    <h1 className="text-2xl font-semibold text-foreground">Calendário de Conteúdo</h1>
                </div>
                 <p className="text-muted-foreground">Use este modelo para planejar e organizar seu conteúdo editorial.</p>
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
                <Select defaultValue="status">
                <SelectTrigger className="w-auto h-8 text-xs px-2 py-1">
                    <SelectValue placeholder="Visualizar por" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="status">Por Status</SelectItem>
                    <SelectItem value="author">Por Autor</SelectItem>
                    <SelectItem value="channel">Por Canal</SelectItem>
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
                    <Input placeholder="Buscar cards" className="pl-7 h-8 text-xs w-40" />
                </div>
                <div className="ml-auto flex gap-2">
                    <Button variant="default" size="sm" className="h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90">
                        Novo <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                </div>
            </div>
            
            <div className="flex-grow overflow-x-auto pb-4">
                <div className="flex gap-4 h-full">
                    {columns.map((column) => (
                        <ContentKanbanColumn key={column.id} column={column} onDropItem={handleDropItem} />
                    ))}
                </div>
            </div>
        </div>
    </DndProvider>
  );
}
