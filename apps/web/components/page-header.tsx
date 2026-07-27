import { Plus } from "lucide-react";

export function PageHeader({ eyebrow, title, subtitle, action = "Capturar tarefa" }: { eyebrow: string; title: string; subtitle: string; action?: string }) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="subtitle">{subtitle}</p>
      </div>
      <button className="quick-add"><Plus size={18} /> {action}</button>
    </header>
  );
}
