
"use client";

import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useState } from 'react';
import { RecurringMeetingsTable } from '@/components/meetings/recurring-meetings-table';
import { Skeleton } from '@/components/ui/skeleton';
import { useMeetings } from '@/contexts/meetings-context';
import { UpsertMeetingModal } from '@/components/meetings/upsert-meeting-modal';

export default function MeetingAgendaPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isLoading } = useMeetings();

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader
            title="Agenda de Reuniões"
            description="Visualize e gerencie seus compromissos e comitês."
        />
        <div className="flex items-center gap-2">
            <Button onClick={() => setIsModalOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" /> Nova Reunião Recorrente
            </Button>
        </div>
      </div>

      <UpsertMeetingModal 
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
      
      {isLoading ? (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-32 w-full" />
            </CardContent>
        </Card>
      ) : (
        <RecurringMeetingsTable />
      )}
    </div>
  );
}
