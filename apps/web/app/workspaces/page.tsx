import { PageHeader } from "@/components/page-header";
import { ProjectsGrid } from "@/components/projects-grid";
import { WorkspaceTemplatePicker } from "@/components/workspace-template-picker";
export default function WorkspacesPage(){return <main className="main-content"><PageHeader eyebrow="SISTEMA PESSOAL" title="Workspaces" subtitle="Projetos, viagens, saúde, finanças e estudos compartilham uma única fundação."/><WorkspaceTemplatePicker/><ProjectsGrid/></main>}
