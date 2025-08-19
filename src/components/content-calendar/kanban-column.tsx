
"use client";

import React from 'react';
import { useDrop } from 'react-dnd';
import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal } from "lucide-react";
import { ContentKanbanCard } from "./kanban-card";
import type { ContentItem, ContentStatus } from "@/types";
import { cn } from "@/lib/utils";

interface ColumnProps {
  column: {
    id: ContentStatus;
    title: string;
    items: ContentItem[];
  };
  onDropItem: (itemId: string, newStatus: ContentStatus) => void;
}

const STATUS_COLORS: Record<ContentStatus, string> = {
    "Idea": "bg-gray-200",
    "Draft": "bg-orange-200",
    "In Review": "bg-purple-200",
    "Ready to Publish": "bg-blue-200",
    "Published": "bg-green-200",
}

export function ContentKanbanColumn({ column, onDropItem }: ColumnProps) {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'content-item',
    drop: (item: { id: string }) => {
      onDropItem(item.id, column.id);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  });

  return (
    <div
      ref={drop}
      className={cn(
        "w-72 md:w-80 flex-shrink-0 bg-secondary/30 rounded-lg p-1.5 flex flex-col transition-colors duration-200",
        isOver && canDrop ? "bg-primary/10" : "",
        isOver && !canDrop ? "bg-destructive/10" : ""
      )}
    >
      <div className="flex justify-between items-center p-2 mb-1">
        <div className="flex items-center gap-2">
           <div className={cn("w-3 h-3 rounded-full", STATUS_COLORS[column.id])}></div>
          <h2 className="text-sm font-semibold text-foreground">{column.title}</h2>
          <span className="text-xs text-muted-foreground">{column.items.length}</span>
        </div>
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground"><MoreHorizontal className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground"><Plus className="h-4 w-4" /></Button>
        </div>
      </div>
      <div className="space-y-2 overflow-y-auto flex-grow px-1.5 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent min-h-[100px]">
        {column.items.map((item) => (
          <ContentKanbanCard key={item.id} item={item} />
        ))}
        <Button variant="ghost" className="mt-1 w-full justify-start text-xs text-muted-foreground hover:text-foreground hover:bg-transparent">
            <Plus className="mr-1 h-3.5 w-3.5" /> Novo
        </Button>
      </div>
    </div>
  );
}
