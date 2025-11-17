
"use client";

import React, { useMemo } from 'react';
import type { Task, TaskStatus } from '@/types';
import { TasksKanbanColumn } from './tasks-kanban-column';
import { useTasks } from '@/contexts/tasks-context';

const KANBAN_TASK_COLUMNS: TaskStatus[] = ['Pendente', 'Prioridade', 'Concluído'];

interface TasksKanbanProps {}

interface Column {
  id: TaskStatus;
  title: string;
  tasks: Task[];
}

export function TasksKanban({}: TasksKanbanProps) {
    const { tasks, updateTaskStatus } = useTasks();

    const handleDropTask = (taskId: string, newStatus: TaskStatus) => {
        updateTaskStatus(taskId, newStatus);
    };
    
    const activeTasks = useMemo(() => tasks.filter(task => !task.archived), [tasks]);

    const columns: Column[] = useMemo(() => {
        const groupedTasks = KANBAN_TASK_COLUMNS.reduce((acc, status) => {
            acc[status] = [];
            return acc;
        }, {} as Record<TaskStatus, Task[]>);
        
        activeTasks.forEach(task => {
            if (task.completed) {
                groupedTasks['Concluído'].push(task);
            } else if (task.priority) {
                groupedTasks['Prioridade'].push(task);
            } else {
                groupedTasks['Pendente'].push(task);
            }
        });

        return KANBAN_TASK_COLUMNS.map(status => ({
            id: status,
            title: status,
            tasks: groupedTasks[status] || [],
        }));

    }, [activeTasks]);


    return (
        <div className="flex-grow overflow-x-auto pb-4">
            <div className="flex gap-4 h-full">
                {columns.map((column) => (
                    <TasksKanbanColumn 
                      key={column.id} 
                      column={column} 
                      onDropTask={handleDropTask} 
                    />
                ))}
            </div>
        </div>
    );
}
