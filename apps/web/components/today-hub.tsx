"use client";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Brain, CalendarDays, CheckCircle2, Clock3, Flame, FolderKanban, RefreshCw, Sparkles, Target } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { lifeosApi } from "@/lib/api";
import { TodayHub as TodayHubType } from "@/lib/types";
import { PageHeader } from "./page-header";
import { ProjectIcon } from "./project-icon";
import { useToast } from "./toast-provider";

export function TodayHub(){
 const [data,setData]=useState<TodayHubType>(); const [loading,setLoading]=useState(true); const [error,setError]=useState<string>(); const {notify}=useToast();
 const load=useCallback(async()=>{setLoading(true);setError(undefined);try{setData((await lifeosApi.todayHub()).data);}catch(e){setError(e instanceof Error?e.message:"Falha ao montar o seu dia.");}finally{setLoading(false);}},[]);
 useEffect(()=>{void load();},[load]);
 async function complete(id:string){try{await lifeosApi.updateTaskStatus(id,"Concluída");notify("Tarefa concluída.");await load();}catch(e){notify(e instanceof Error?e.message:"Falha ao concluir.","error");}}
 const greeting=new Intl.DateTimeFormat("pt-BR",{weekday:"long",day:"2-digit",month:"long"}).format(new Date());
 return <main className="main-content today-hub"><PageHeader eyebrow="SEU DIA" title="Hoje" subtitle={`${greeting}. Um painel único para decidir, executar e continuar.`}/>
  {loading?<div className="panel hub-loading"><RefreshCw className="spin"/> Preparando seu dia…</div>:error?<div className="panel hub-error">{error}<button className="secondary-button" onClick={()=>void load()}>Tentar novamente</button></div>:data?<>
  <section className="hub-summary-grid">
   <article className="panel hub-metric"><Target/><div><strong>{data.dueTodayCount}</strong><span>tarefas para hoje</span></div></article>
   <article className={`panel hub-metric ${data.overdueCount?"warning":""}`}><AlertTriangle/><div><strong>{data.overdueCount}</strong><span>atrasadas</span></div></article>
   <article className="panel hub-metric"><Clock3/><div><strong>{data.focusMinutes} min</strong><span>de foco hoje</span></div></article>
   <article className="panel hub-metric"><Flame/><div><strong>{data.habits.length}</strong><span>hábitos ativos</span></div></article>
  </section>
  <section className="hub-layout">
   <div className="hub-primary">
    {data.overdue.length?<section className="panel hub-section"><header><div><AlertTriangle/><span><b>Recuperar</b><small>Comece removendo o que ficou para trás.</small></span></div><Link href="/upcoming">Ver próximos <ArrowRight size={15}/></Link></header><div className="hub-task-list">{data.overdue.map(t=><article key={t.id} className="hub-task overdue"><button onClick={()=>void complete(t.id)} aria-label="Concluir"><CheckCircle2/></button><div><strong>{t.title}</strong><span>{t.workspace} · venceu {t.dueDate?new Date(`${t.dueDate}T12:00:00`).toLocaleDateString("pt-BR"):""}</span></div><em>{t.priority}</em></article>)}</div></section>:null}
    <section className="panel hub-section"><header><div><Sparkles/><span><b>Prioridades de hoje</b><small>O que merece sua atenção agora.</small></span></div><Link href="/inbox">Capturar <ArrowRight size={15}/></Link></header><div className="hub-task-list">{data.tasks.map(t=><article key={t.id} className="hub-task"><button onClick={()=>void complete(t.id)} aria-label="Concluir"><CheckCircle2/></button><div><strong>{t.title}</strong><span>{t.workspace} · {t.priority}</span></div></article>)}{!data.tasks.length?<div className="hub-empty">Nenhuma tarefa marcada para hoje. Use a captura rápida para planejar.</div>:null}</div></section>
    <section className="panel hub-section"><header><div><FolderKanban/><span><b>Continuar trabalhando</b><small>Workspaces com contexto para retomar rapidamente.</small></span></div><Link href="/workspaces">Todos <ArrowRight size={15}/></Link></header><div className="hub-workspaces">{data.workspaces.map(w=><Link href={`/workspaces?workspace=${w.id}`} key={w.id}><ProjectIcon name={w.icon} size={18}/><div><strong>{w.name}</strong><span>{w.openTasks} abertas{w.overdueTasks?` · ${w.overdueTasks} atrasadas`:""}</span><i><span style={{width:`${w.progress}%`}}/></i></div><b>{w.progress}%</b></Link>)}</div></section>
   </div>
   <aside className="hub-secondary">
    <section className="panel hub-section compact"><header><div><CalendarDays/><span><b>Agenda</b><small>Blocos do seu dia.</small></span></div><Link href="/agenda"><ArrowRight size={15}/></Link></header><div className="hub-agenda">{data.agenda.map(e=><div key={e.id}><time>{new Date(e.startAt).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}</time><span><strong>{e.title}</strong><small>{e.type}</small></span></div>)}{!data.agenda.length?<p>Nenhum bloco agendado.</p>:null}</div></section>
    <section className="panel hub-section compact"><header><div><Flame/><span><b>Hábitos</b><small>Consistência antes de intensidade.</small></span></div><Link href="/habits"><ArrowRight size={15}/></Link></header><div className="hub-habits">{data.habits.slice(0,6).map(h=><div key={h.id}><span>{h.icon||"○"}</span><strong>{h.name}</strong><small>{h.frequency}</small></div>)}</div></section>
    <section className="panel hub-section compact"><header><div><Brain/><span><b>Notas recentes</b><small>Continue de onde parou.</small></span></div><Link href="/brain"><ArrowRight size={15}/></Link></header><div className="hub-notes">{data.notes.map(n=><Link href={`/brain?note=${n.id}`} key={n.id}><strong>{n.title}</strong><span>{n.workspace}</span><p>{n.excerpt||"Nota sem conteúdo"}</p></Link>)}</div></section>
   </aside>
  </section></>:null}
 </main>
}
