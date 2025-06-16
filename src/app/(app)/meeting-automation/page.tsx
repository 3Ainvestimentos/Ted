import { MeetingMinutesForm } from "@/components/forms/meeting-minutes-form";

export default function MeetingAutomationPage() {
  return (
    <div className="space-y-8">
       <div className="flex justify-between items-center">
         <h1 className="text-3xl font-headline font-semibold tracking-tight">Automação de Reuniões</h1>
      </div>
      <MeetingMinutesForm />
    </div>
  );
}
