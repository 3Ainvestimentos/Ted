
import { NotesEditor } from "@/components/notes/notes-editor";
import { PageHeader } from "@/components/layout/page-header";

export default function NotesPage() {
  return (
    <div className="space-y-6 h-full flex flex-col">
      <PageHeader
        title="Anotações"
        description="Seu bloco de notas pessoal. As alterações são salvas automaticamente."
      />
      <NotesEditor />
    </div>
  );
}
