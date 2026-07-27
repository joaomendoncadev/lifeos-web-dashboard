"use client";

import { Download, FileJson, Save, Settings2, Upload } from "lucide-react";
import { ChangeEvent, useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { useToast } from "@/components/toast-provider";
import { lifeosApi } from "@/lib/api";
import type { Goal, Habit, Project, Task, Trip } from "@/lib/types";

type Preferences = { displayName: string; weekStartsOn: "monday" | "sunday"; compactMode: boolean };
type PortableData = { version: 1; exportedAt: string; tasks: Task[]; projects: Project[]; habits: Habit[]; goals: Goal[]; trips: Trip[] };
const defaultPreferences: Preferences = { displayName: "João", weekStartsOn: "monday", compactMode: false };

export function SettingsView() {
  const [prefs, setPrefs] = useState(defaultPreferences);
  const [busy, setBusy] = useState(false);
  const { notify } = useToast();

  useEffect(() => {
    const stored = window.localStorage.getItem("lifeos-preferences");
    if (stored) try { setPrefs({ ...defaultPreferences, ...JSON.parse(stored) }); } catch { /* ignore invalid old value */ }
  }, []);

  function savePreferences() {
    window.localStorage.setItem("lifeos-preferences", JSON.stringify(prefs));
    document.documentElement.dataset.compact = prefs.compactMode ? "true" : "false";
    notify("Preferências salvas.");
  }

  async function exportData() {
    setBusy(true);
    try {
      const [tasks, projects, habits, goals, trips] = await Promise.all([
        lifeosApi.tasks(), lifeosApi.projects(), lifeosApi.habits(), lifeosApi.goals(), lifeosApi.trips(),
      ]);
      const payload: PortableData = { version: 1, exportedAt: new Date().toISOString(), tasks: tasks.data, projects: projects.data, habits: habits.data, goals: goals.data, trips: trips.data };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `lifeos-export-${new Date().toISOString().slice(0, 10)}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      notify("Exportação concluída.");
    } catch (error) { notify(error instanceof Error ? error.message : "Falha ao exportar.", "error"); }
    finally { setBusy(false); }
  }

  async function importData(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      const data = JSON.parse(await file.text()) as Partial<PortableData>;
      if (data.version !== 1) throw new Error("Arquivo de exportação incompatível.");
      const projectMap = new Map<string, string>();
      for (const project of data.projects ?? []) {
        const created = await lifeosApi.createProject({ name: project.name, area: project.area, description: project.description, deadline: project.deadlineDate, icon: project.icon });
        projectMap.set(project.id, created.data.id);
      }
      for (const task of data.tasks ?? []) await lifeosApi.createTask({ title: task.title, status: task.status, projectId: task.projectId ? projectMap.get(task.projectId) ?? null : null, context: task.context, durationMinutes: task.durationMinutes, priority: task.priority, dueDate: task.dueDate });
      for (const habit of data.habits ?? []) await lifeosApi.createHabit({ name: habit.name, description: habit.description, frequency: habit.frequency, icon: habit.icon });
      for (const goal of data.goals ?? []) await lifeosApi.createGoal({ title: goal.title, area: goal.area, description: goal.description, progress: goal.progress, deadline: goal.deadline });
      for (const trip of data.trips ?? []) await lifeosApi.createTrip({ name: trip.name, destination: trip.destination, startDate: trip.startDate, endDate: trip.endDate, status: trip.status, currency: trip.currency, budget: trip.budget, notes: trip.notes, coverEmoji: trip.coverEmoji });
      notify("Importação concluída. Itens existentes não foram removidos.");
    } catch (error) { notify(error instanceof Error ? error.message : "Falha ao importar.", "error"); }
    finally { setBusy(false); }
  }

  return <div className="main-content settings-page">
    <PageHeader eyebrow="Sistema" title="Configurações" subtitle="Preferências locais, portabilidade e proteção dos seus dados." />
    <div className="settings-grid">
      <section className="panel settings-card">
        <header><Settings2 size={20}/><div><h2>Preferências</h2><p>Aplicadas somente neste navegador.</p></div></header>
        <div className="entity-form">
          <label className="field"><span>Nome exibido</span><input value={prefs.displayName} maxLength={60} onChange={e=>setPrefs(v=>({...v,displayName:e.target.value}))}/></label>
          <label className="field"><span>Primeiro dia da semana</span><select value={prefs.weekStartsOn} onChange={e=>setPrefs(v=>({...v,weekStartsOn:e.target.value as Preferences["weekStartsOn"]}))}><option value="monday">Segunda-feira</option><option value="sunday">Domingo</option></select></label>
          <label className="settings-check"><input type="checkbox" checked={prefs.compactMode} onChange={e=>setPrefs(v=>({...v,compactMode:e.target.checked}))}/><span><strong>Modo compacto</strong><small>Reduz espaços em listas e painéis.</small></span></label>
          <button className="primary-button" onClick={savePreferences}><Save size={16}/>Salvar preferências</button>
        </div>
      </section>
      <section className="panel settings-card">
        <header><FileJson size={20}/><div><h2>Importar e exportar</h2><p>Arquivo JSON portátil para migração manual.</p></div></header>
        <div className="data-actions">
          <button className="secondary-button" disabled={busy} onClick={exportData}><Download size={17}/>Exportar dados</button>
          <label className={`secondary-button ${busy ? "disabled" : ""}`}><Upload size={17}/>Importar JSON<input type="file" accept="application/json,.json" hidden disabled={busy} onChange={importData}/></label>
        </div>
        <div className="drawer-tip"><strong>Importação segura</strong><span>A importação acrescenta itens e não apaga os dados atuais. Para uma cópia integral do PostgreSQL, use os scripts de backup.</span></div>
      </section>
      <section className="panel settings-card full-width">
        <header><Save size={20}/><div><h2>Backup integral</h2><p>Preserva todos os módulos, relações e históricos.</p></div></header>
        <div className="code-steps"><code>./scripts/backup.sh</code><code>./scripts/restore.sh backups/lifeos-AAAA....sql.gz</code></div>
      </section>
    </div>
  </div>;
}
