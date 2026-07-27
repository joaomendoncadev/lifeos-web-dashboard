import { GoalsView } from "@/components/goals-view";
import { PageHeader } from "@/components/page-header";

export default function GoalsPage() {
  return <main className="main-content"><PageHeader eyebrow="DIREÇÃO" title="Metas" subtitle="Transforme objetivos maiores em progresso visível." /><GoalsView /></main>;
}
