"use client";

import { AlertTriangle, ArrowRight, BrainCircuit, CalendarPlus, CheckCircle2, Clock3, Gauge, HeartPulse, Lightbulb, RefreshCw, Sparkles, Target, TimerReset, TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useCallback } from "react";
import { lifeosApi } from "@/lib/api";
import { IntelligenceOverview } from "@/lib/types";
import { useResource } from "@/lib/use-resource";
import { SyncState } from "./sync-state";
import { CardGridSkeleton, Skeleton } from "./skeleton";

const fallback: IntelligenceOverview = { generatedAt:"", completedLast7Days:0, completedPrevious7Days:0, focusMinutesLast7Days:0, productiveDays:0, activeWorkspaces:0, workspacesAtRisk:0, habitCompletionRate:0, trend:[], workspaceHealth:[], recommendations:[], agendaSuggestions:[], goalSignals:[], habitSignals:[] };

function minutes(value:number){const h=Math.floor(value/60),m=value%60;return h?`${h}h${m?` ${m}min`:""}`:`${m}min`;}
function day(value:string){return new Intl.DateTimeFormat("pt-BR",{weekday:"short"}).format(new Date(`${value}T12:00:00`)).replace(".","");}
function healthLabel(value:string){return value==="HEALTHY"?"Saudável":value==="AT_RISK"?"Em risco":"Parado";}

export function IntelligenceView(){
 const loader=useCallback(()=>lifeosApi.intelligenceOverview(),[]);
 const {data,loading,source,warning,error,reload}=useResource(loader,fallback);
 const max=Math.max(1,...data.trend.map(point=>point.completedTasks));
 const velocity=data.completedPrevious7Days?Math.round((data.completedLast7Days-data.completedPrevious7Days)*100/data.completedPrevious7Days):data.completedLast7Days?100:0;
 return <div className="intelligence-view">
  <div className="resource-header intelligence-resource"><SyncState loading={loading} source={source} warning={warning} error={error} onRetry={reload}/><button className="secondary-button" onClick={reload}><RefreshCw size={15}/> Atualizar leitura</button></div>
  <section className="intelligence-hero panel">
   <div><span className="pill"><BrainCircuit size={14}/> Camada de inteligência</span><h2>Seu LifeOS está transformando atividade em direção.</h2><p>Os sinais abaixo são calculados a partir das suas tarefas, sessões de foco, hábitos, metas e workspaces. Não usam IA externa.</p></div>
   <div className="intelligence-score"><Gauge size={28}/><strong>{Math.max(0,100-data.workspacesAtRisk*12)}%</strong><span>saúde do sistema</span></div>
  </section>
  <section className="intelligence-metrics">
   {loading ? <CardGridSkeleton count={4} className="panel"/> : <>
   <article className="panel"><CheckCircle2/><span>Tarefas concluídas</span><strong>{data.completedLast7Days}</strong><small className={velocity>=0?"positive":"negative"}>{velocity>=0?<TrendingUp/>:<TrendingDown/>}{velocity>=0?"+":""}{velocity}% vs. semana anterior</small></article>
   <article className="panel"><Clock3/><span>Foco nos últimos 7 dias</span><strong>{minutes(data.focusMinutesLast7Days)}</strong><small>{data.productiveDays} dias produtivos</small></article>
   <article className="panel"><HeartPulse/><span>Consistência de hábitos</span><strong>{data.habitCompletionRate}%</strong><small>estimativa semanal</small></article>
   <article className="panel"><AlertTriangle/><span>Workspaces em atenção</span><strong>{data.workspacesAtRisk}</strong><small>de {data.activeWorkspaces} ativos</small></article>
   </>}
  </section>
  <div className="intelligence-grid">
   <section className="panel intelligence-section trend-panel"><header><div><Sparkles/><span><b>Ritmo semanal</b><small>Tarefas concluídas e foco diário</small></span></div></header><div className="trend-chart">{loading?Array.from({length:7}).map((_,index)=><div className="trend-day" key={index} aria-hidden="true"><Skeleton height="70%" style={{alignSelf:"end"}}/><Skeleton width={18} height={10} style={{margin:"6px auto 0"}}/></div>):data.trend.map(point=><div className="trend-day" key={point.date}><div className="trend-bars"><span style={{height:`${Math.max(5,point.completedTasks/max*100)}%`}} title={`${point.completedTasks} tarefas`}/><i style={{height:`${Math.max(3,Math.min(100,point.focusMinutes/120*100))}%`}} title={`${point.focusMinutes} minutos de foco`}/></div><strong>{point.completedTasks}</strong><small>{day(point.date)}</small></div>)}</div><footer><span><i className="legend tasks"/> tarefas</span><span><i className="legend focus"/> foco</span></footer></section>
   <section className="panel intelligence-section"><header><div><Lightbulb/><span><b>Recomendações</b><small>Próximas decisões de maior impacto</small></span></div></header><div className="recommendation-list">{data.recommendations.map(item=><article className={`recommendation ${item.severity.toLowerCase()}`} key={item.id}><span>{item.severity==="HIGH"?<AlertTriangle/>:<Sparkles/>}</span><div><strong>{item.title}</strong><p>{item.description}</p><Link href={item.href}>{item.actionLabel}<ArrowRight size={13}/></Link></div></article>)}</div></section>
   <section className="panel intelligence-section wide"><header><div><Gauge/><span><b>Saúde dos workspaces</b><small>Ritmo, atrasos, atividade e progresso</small></span></div><Link href="/workspaces">Abrir workspaces</Link></header><div className="health-table">{data.workspaceHealth.map(item=><Link href={`/workspaces?workspace=${item.id}`} className="health-row" key={item.id}><div><strong>{item.name}</strong><span>{item.reason}</span></div><div className="health-progress"><i><span style={{width:`${item.score}%`}}/></i><small>{item.score}/100</small></div><em className={`health-${item.status.toLowerCase()}`}>{healthLabel(item.status)}</em><b>{item.progress}%</b></Link>)}</div></section>
   <section className="panel intelligence-section"><header><div><CalendarPlus/><span><b>Agenda sugerida</b><small>Blocos recomendados pelas prioridades atuais</small></span></div></header><div className="suggestion-list">{data.agendaSuggestions.map(item=><article key={item.id}><TimerReset/><div><strong>{item.title}</strong><span>{item.workspace} · {item.durationMinutes} min</span><small>{item.reason} · {item.preferredPeriod}</small></div></article>)}</div><Link className="section-action" href="/agenda">Organizar na agenda <ArrowRight size={14}/></Link></section>
   <section className="panel intelligence-section"><header><div><Target/><span><b>Sinais das metas</b><small>Progresso sugerido pela execução registrada</small></span></div></header><div className="goal-signal-list">{data.goalSignals.length?data.goalSignals.map(goal=><article key={goal.id}><div><strong>{goal.title}</strong><span>{goal.currentProgress}% → {goal.suggestedProgress}%</span></div><i><span style={{width:`${goal.suggestedProgress}%`}}/></i><small>{goal.reason}</small></article>):<p className="muted">Nenhuma meta ativa para analisar.</p>}</div><Link className="section-action" href="/goals">Revisar metas <ArrowRight size={14}/></Link></section>
   <section className="panel intelligence-section wide habit-correlation"><header><div><HeartPulse/><span><b>Padrões de hábitos</b><small>Correlação simples, não causalidade</small></span></div></header>{data.habitSignals.map(signal=><article key={signal.label}><div><strong>{signal.value>0?`+${signal.value}`:signal.value}</strong><span>tarefas por dia</span></div><p>{signal.interpretation}</p></article>)}</section>
  </div>
 </div>;
}
