import { PageHeader } from "@/components/page-header";
import { TripsView } from "@/components/trips-view";

export default function TripsPage() {
  return <main className="main-content"><PageHeader eyebrow="EXPLORAR" title="Viagens" subtitle="Planeje roteiros, reservas, documentos, checklists e orçamento em um só lugar." action="Nova viagem" /><TripsView /></main>;
}
