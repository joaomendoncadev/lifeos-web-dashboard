import { PageHeader } from "@/components/page-header";
import { TaskView, TasksBoard } from "@/components/tasks-board";

type Props = { view: TaskView; eyebrow: string; title: string; subtitle: string };

export function ActionView({ view, eyebrow, title, subtitle }: Props) {
  return <main className="main-content action-view"><PageHeader eyebrow={eyebrow} title={title} subtitle={subtitle}/><TasksBoard view={view}/></main>;
}
