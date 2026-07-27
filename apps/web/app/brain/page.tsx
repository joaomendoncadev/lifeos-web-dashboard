import { BrainView } from "@/components/brain-view";
import { PageHeader } from "@/components/page-header";

export default function BrainPage() {
  return <main className="main-content"><PageHeader eyebrow="Conhecimento" title="Second Brain" subtitle="Capture ideias, conecte aprendizados e encontre tudo rapidamente." /><BrainView /></main>;
}
