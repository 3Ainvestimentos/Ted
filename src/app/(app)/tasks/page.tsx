
import { PageHeader } from "@/components/layout/page-header";
import { TodoList } from "@/components/tasks/todo-list";

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Tarefas"
        description="Gerencie sua lista de tarefas diárias."
      />
      <TodoList />
    </div>
  );
}
