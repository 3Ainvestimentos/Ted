
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle, LayoutGrid, List } from "lucide-react";
import { useInitiatives } from "@/contexts/initiatives-context";
import { InitiativesTable } from "@/components/initiatives/initiatives-table";
import { InitiativesKanban } from "@/components/initiatives/initiatives-kanban";
import { PageHeader } from "@/components/layout/page-header";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

type ViewMode = "table" | "kanban";

export default function InitiativesPage() {
  const { initiatives } = useInitiatives();
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <PageHeader
            title="Iniciativas Estratégicas"
            description="Acompanhe, gerencie e organize todas as suas iniciativas em um só lugar."
          />
          <div className="flex items-center gap-2 self-end sm:self-center">
            <div className="p-1 bg-muted rounded-lg flex items-center">
              <Button 
                variant={viewMode === 'table' ? 'secondary' : 'ghost'} 
                size="sm" 
                onClick={() => setViewMode('table')}
                className="h-8 px-3"
              >
                <List className="h-4 w-4" />
                <span className="ml-2 hidden sm:inline">Tabela</span>
              </Button>
              <Button 
                variant={viewMode === 'kanban' ? 'secondary' : 'ghost'} 
                size="sm" 
                onClick={() => setViewMode('kanban')}
                className="h-8 px-3"
              >
                <LayoutGrid className="h-4 w-4" />
                <span className="ml-2 hidden sm:inline">Kanban</span>
              </Button>
            </div>
             <Button asChild>
              <Link href="/strategic-initiatives/new"> 
                <PlusCircle className="mr-2 h-4 w-4" /> Criar
              </Link>
            </Button>
          </div>
        </div>
        
        {viewMode === 'table' ? (
          <InitiativesTable initiatives={initiatives} />
        ) : (
          <InitiativesKanban initiatives={initiatives} />
        )}
      </div>
    </DndProvider>
  );
}
