
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, PlusCircle } from 'lucide-react';

export default function MeetingAgendaPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <PageHeader
            title="Agenda de Reuniões"
            description="Gerencie suas reuniões, comitês e outros compromissos."
        />
        <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Criar Novo Evento
        </Button>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Próximos Eventos</CardTitle>
            <CardDescription>Visão geral das suas reuniões agendadas.</CardDescription>
        </CardHeader>
        <CardContent className="min-h-[400px] flex flex-col items-center justify-center text-center">
            <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground">Nenhum evento agendado</h3>
            <p className="text-muted-foreground mt-2">Crie um novo evento ou integre com seu calendário para começar.</p>
            <Button variant="outline" className="mt-4">
                Integrar com Google Calendar
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
