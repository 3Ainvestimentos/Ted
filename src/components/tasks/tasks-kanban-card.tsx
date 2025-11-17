
"use client";

import type { Task } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { useDrag } from 'react-dnd';
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface TasksKanbanCardProps {
  task: Task;
}

export function TasksKanbanCard({ task }: TasksKanbanCardProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'task-card',
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));
  
  return (
    <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }} className="cursor-grab active:cursor-grabbing">
        <Card className={cn("shadow-sm hover:shadow-md transition-shadow duration-200 bg-card border-border", task.completed && "bg-muted/50")}>
            <CardContent className="p-3">
                <div className="flex items-start justify-between gap-2">
                    <p className={cn("text-sm", task.completed && "line-through text-muted-foreground")}>{task.title}</p>
                    {task.priority && !task.completed && (
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-500 shrink-0" />
                    )}
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
