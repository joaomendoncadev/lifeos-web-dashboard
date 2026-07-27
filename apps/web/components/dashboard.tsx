"use client";

import { ArrowUpRight, CalendarClock, Check, Circle, Clock3, Plus, Sparkles } from "lucide-react";
import Link from "next/link";
import { useCallback } from "react";
import { lifeosApi } from "@/lib/api";
import { DashboardSummary } from "@/lib/types";
import { useResource } from "@/lib/use-resource";
import { SyncState } from "./sync-state";

const fallback: DashboardSummary = { openTasks: 0, completedTasks: 0, activeProjects: 0, habitsDone: 0, habitsTotal: 0, plannedMinutes: 0, overdueTasks: 0, dueToday: 0, focusMinutesToday: 0, priorities: [] };

function formatMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return hours ? `${hours}h${rest ? ` ${rest}min` : ""}` : `${rest}min`;
}

export function Dashboard() {
  const loader = useCallback(() => lifeosApi.dashboard(), []);
  const { data, loading, source, warning, error, reload } = useResource(loader, fallback);
  const date = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "long" }).format(new Date()).toUpperCase();
  const habitPercent = data.habitsTotal ? Math.round(data.habitsDone * 100 / data.habitsTotal) : 0;

  return <main className="main-content">
    <header className="topbar"><div><p className="eyebrow">{date}</p><h1>Olá, João.</h1><p className="subtitle">Seu dia, seus projetos e seu conhecimento em um só lugar.</p></div><Link className="quick-add" href="/tasks"><Plus size={18}/> Capturar tarefa</Link></header>
    <div className="resource-header"><SyncState loading={loading} source={source} warning={warning} error={error} onRetry={reload}/></div>
    <section className="hero-card"><div><span className="pill"><Sparkles size={14}/> Foco do dia</span><h2>{data.priorities[0]?.title ?? "Escolha a próxima ação importante"}</h2><p>{data.priorities[0] ? `${data.priorities[0].context} · ${data.priorities[0].duration}` : "Capture uma tarefa para começar."}</p></div><Link href="/focus">Entrar no modo foco <ArrowUpRight size={17}/></Link></section>
    <section className="stats-grid stats-grid-five">
      <article className="stat-card"><span>Tarefas abertas</span><strong>{data.openTasks}</strong><small>{data.completedTasks} concluídas</small></article>
      <article className="stat-card"><span>Projetos ativos</span><strong>{data.activeProjects}</strong><small>progresso calculado pelas tarefas</small></article>
      <article className="stat-card"><span>Hábitos hoje</span><strong>{data.habitsDone}/{data.habitsTotal}</strong><small>{habitPercent}% concluído</small></article>
      <article className="stat-card"><span>Tempo planejado</span><strong>{formatMinutes(data.plannedMinutes)}</strong><small>{data.dueToday} para hoje · {data.overdueTasks} atrasadas</small></article>
      <article className="stat-card"><span>Foco hoje</span><strong>{formatMinutes(data.focusMinutesToday)}</strong><small>sessões concluídas</small></article>
    </section>
    <div className="content-grid">
      <section className="panel priority-panel"><div className="panel-header"><div><span>Prioridades</span><h3>O que merece sua atenção</h3></div><Link href="/tasks">Ver tarefas</Link></div><div className="task-list">{data.priorities.length ? data.priorities.map(task => <article className="task-row" key={task.id}><button className="check-button"><Circle size={20}/></button><div className="task-copy"><strong>{task.title}</strong><span>{task.context}</span></div><div className="task-meta"><span><Clock3 size={14}/> {task.duration}</span><em>{task.priority}</em></div></article>) : <div className="empty-state compact"><Check size={28}/><strong>Nada pendente</strong><p>Seu dashboard está limpo.</p></div>}</div></section>
      <section className="panel habits-panel"><div className="panel-header"><div><span>Consistência</span><h3>Hábitos de hoje</h3></div><Link href="/habits">Abrir hábitos</Link></div><div className="progress-track"><span style={{width:`${habitPercent}%`}}/></div><p className="muted">Você concluiu {data.habitsDone} de {data.habitsTotal} hábitos.</p></section>
      <section className="panel projects-panel"><div className="panel-header"><div><span>Em movimento</span><h3>Projetos ativos</h3></div><Link href="/projects">Todos os projetos</Link></div><div className="empty-state compact"><Sparkles size={28}/><strong>{data.activeProjects} projetos cadastrados</strong><p>O progresso é atualizado conforme as tarefas são concluídas.</p></div></section>
      <section className="panel agenda-panel"><div className="panel-header"><div><span>Encerramento</span><h3>Revisão diária</h3></div><Link href="/review">Abrir revisão</Link></div><div className="empty-state"><CalendarClock size={28}/><strong>Prepare o próximo dia</strong><p>Registre vitórias, bloqueios e prioridades de amanhã.</p></div></section>
    </div>
  </main>;
}
