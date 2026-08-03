"use client";

import { Check, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { DashboardSummary } from "@/lib/types";

const STORAGE_KEY = "lifeos:onboarding-dismissed";

export function OnboardingChecklist({ data }: { data: DashboardSummary }) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(window.localStorage.getItem(STORAGE_KEY) === "true");
  }, []);

  const steps = [
    { label: "Criar um workspace", hint: "Organize seus projetos em um só lugar.", href: "/workspaces", done: data.activeProjects > 0 },
    { label: "Capturar uma tarefa", hint: "Tire a próxima ação da sua cabeça.", href: "/inbox", done: data.openTasks + data.completedTasks > 0 },
    { label: "Criar um hábito", hint: "Acompanhe uma rotina que quer manter.", href: "/habits", done: data.habitsTotal > 0 },
    { label: "Rodar uma sessão de foco", hint: "Experimente o modo foco por um ciclo.", href: "/focus", done: data.focusMinutesToday > 0 },
  ];
  const doneCount = steps.filter(step => step.done).length;
  const allDone = doneCount === steps.length;

  if (dismissed || allDone) return null;

  function dismiss() {
    window.localStorage.setItem(STORAGE_KEY, "true");
    setDismissed(true);
  }

  return <section className="panel onboarding-checklist">
    <header>
      <div><span className="eyebrow small">Comece por aqui</span><h3>Configure seu LifeOS</h3><p>Quatro passos rápidos para deixar o sistema útil no seu dia a dia.</p></div>
      <button onClick={dismiss} aria-label="Dispensar checklist" title="Dispensar"><X size={18}/></button>
    </header>
    <div className="onboarding-progress"><div className="progress-track"><span style={{ width: `${(doneCount / steps.length) * 100}%` }}/></div><span>{doneCount}/{steps.length}</span></div>
    <div className="onboarding-steps">{steps.map(step => <Link key={step.label} href={step.href} className={`onboarding-step ${step.done ? "done" : ""}`}>
      <span>{step.done ? <Check size={14}/> : null}</span>
      <div><strong>{step.label}</strong><small>{step.hint}</small></div>
    </Link>)}</div>
  </section>;
}
