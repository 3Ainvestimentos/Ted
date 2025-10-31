"use client";

import React, { useMemo } from 'react';
import type { MnaDeal, InitiativeStatus } from '@/types';
import { MnaKanbanColumn } from './mna-kanban-column';
import { useMnaDeals } from '@/contexts/m-and-as-context';
import { KANBAN_COLUMNS_ORDER } from '@/lib/constants';

interface MnaKanbanProps {
    deals: MnaDeal[];
    onDealClick: (deal: MnaDeal) => void;
}

interface Column {
  id: InitiativeStatus;
  title: string;
  tasks: MnaDeal[];
}

export function MnaKanban({ deals, onDealClick }: MnaKanbanProps) {
    const { updateDealStatus } = useMnaDeals();

    const handleDropTask = (taskId: string, newStatus: InitiativeStatus) => {
        updateDealStatus(taskId, newStatus);
    };

    const columns: Column[] = useMemo(() => {
        const groupedTasks = KANBAN_COLUMNS_ORDER.reduce((acc, status) => {
            acc[status] = [];
            return acc;
        }, {} as Record<InitiativeStatus, MnaDeal[]>);
        
        deals.forEach(task => {
            if (groupedTasks[task.status]) {
                groupedTasks[task.status].push(task);
            }
        });

        return KANBAN_COLUMNS_ORDER.map(status => ({
            id: status,
            title: status,
            tasks: groupedTasks[status] || [],
        }));

    }, [deals]);


    return (
        <div className="flex-grow overflow-x-auto pb-4">
            <div className="flex gap-4 h-full">
                {columns.map((column) => (
                    <MnaKanbanColumn key={column.id} column={column} onDropTask={handleDropTask} onDealClick={onDealClick} />
                ))}
            </div>
        </div>
    );
}
