import { PageHeader } from "@/components/page-header";
import { TasksBoard } from "@/components/tasks-board";

export default function TasksPage() {
  return <main className="main-content"><PageHeader eyebrow="EXECUÇÃO" title="Tarefas" subtitle="Veja o que está aberto e transforme intenção em progresso." /><TasksBoard /></main>;
}
