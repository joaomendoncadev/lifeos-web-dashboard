import { HabitsView } from "@/components/habits-view";
import { PageHeader } from "@/components/page-header";

export default function HabitsPage() {
  return <main className="main-content"><PageHeader eyebrow="CONSISTÊNCIA" title="Hábitos" subtitle="Construa resultados sustentáveis por meio de pequenas repetições." action="Novo hábito" /><HabitsView /></main>;
}
