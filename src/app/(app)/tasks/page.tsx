
"use client";

import { useState } from 'react';
import { PageHeader } from "@/components/layout/page-header";
import { TasksKanban } from '@/components/tasks/tasks-kanban';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useTasks } from '@/contexts/tasks-context';
import { Skeleton } from '@/components/ui/skeleton';
import { AddTaskModal } from '@/components/tasks/add-task-modal';

export default function TasksPage() {
  const { isLoading } = useTasks();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <DndProvider backend={HTML5Backend}>
      <AddTaskModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} />
      <div className="space-y-6 h-full flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <PageHeader
            title="Tarefas"
            description="Gerencie sua lista de tarefas diárias."
          />
          <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
              <Button onClick={() => setIsModalOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Tarefa
              </Button>
            </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-48 w-full" />
          </div>
        ) : (
          <TasksKanban />
        )}
      </div>
    </DndProvider>
  );
}
