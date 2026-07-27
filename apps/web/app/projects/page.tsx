import { PageHeader } from "@/components/page-header";
import { ProjectsGrid } from "@/components/projects-grid";

export default function ProjectsPage() {
  return <main className="main-content"><PageHeader eyebrow="RESULTADOS" title="Projetos" subtitle="Acompanhe entregas importantes e mantenha sempre uma próxima ação clara." action="Novo projeto" /><ProjectsGrid /></main>;
}
