
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useMeetings } from "@/contexts/meetings-context";
import type { RecurringMeeting } from "@/types";
import { cn } from "@/lib/utils";
import { ListChecks } from "lucide-react";

interface CurrentAgendaModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  meeting: RecurringMeeting;
}

export function CurrentAgendaModal({ isOpen, onOpenChange, meeting }: CurrentAgendaModalProps) {
  const { updateAgendaItemStatus } = useMeetings();

  if (!meeting) return null;

  const handleAgendaToggle = (agendaItemId: string, completed: boolean) => {
    updateAgendaItemStatus(meeting.id, agendaItemId, completed);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ListChecks className="h-6 w-6" /> Pauta da Reunião
          </DialogTitle>
          <DialogDescription>
            {meeting.name} - {meeting.scheduledDate ? new Date(meeting.scheduledDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : 'Não Agendada'}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4 max-h-80 overflow-y-auto">
             {meeting.currentOccurrenceAgenda && meeting.currentOccurrenceAgenda.length > 0 ? (
                meeting.currentOccurrenceAgenda.map(item => (
                    <div key={item.id} className="flex items-center gap-3 rounded-md border p-3 hover:bg-muted/50">
                        <Checkbox
                            id={`agenda-${meeting.id}-${item.id}`}
                            checked={item.completed}
                            onCheckedChange={(checked) => handleAgendaToggle(item.id, !!checked)}
                        />
                        <label
                            htmlFor={`agenda-${meeting.id}-${item.id}`}
                            className={cn("text-sm font-medium w-full cursor-pointer", item.completed && "line-through text-muted-foreground")}
                        >
                            {item.title}
                        </label>
                    </div>
                ))
            ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma pauta definida para esta reunião.
                </p>
            )}
        </div>
        <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
