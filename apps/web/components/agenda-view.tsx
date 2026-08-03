"use client";

import Link from "next/link";
import { CalendarPlus, Repeat2, Check, ChevronLeft, ChevronRight, Clock3, Plus, Trash2, X } from "lucide-react";
import { DragEvent, MouseEvent, useCallback, useEffect, useMemo, useState } from "react";
import { lifeosApi } from "@/lib/api";
import { CalendarBlock, CalendarBlockInput, CalendarBlockType, CalendarDomain, CalendarLifecycleStatus, Project, Task, WeeklyCalendarSummary } from "@/lib/types";
import { PageHeader } from "./page-header";
import { SyncState } from "./sync-state";

const lifecycleLabels: Record<CalendarLifecycleStatus,string> = {PLANNED:"Planejado",DONE:"Realizado",CANCELLED:"Cancelado"};
const domainLabels: Record<CalendarDomain,string> = {WORK:"Trabalho",HEALTH:"Saúde",STUDY:"Estudo",PERSONAL:"Pessoal"};
const typeLabels: Record<CalendarBlockType,string> = {FOCUS:"Foco",MEETING:"Reunião",PERSONAL:"Pessoal",ROUTINE:"Rotina",BREAK:"Pausa"};
const START_HOUR=7;
const END_HOUR=23;
const HOUR_HEIGHT=64;
const hours=Array.from({length:END_HOUR-START_HOUR+1},(_,index)=>START_HOUR+index);
const startOfWeek=(date:Date)=>{const d=new Date(date);const day=(d.getDay()+6)%7;d.setDate(d.getDate()-day);d.setHours(0,0,0,0);return d;};
const isoLocal=(date:Date)=>{const offset=date.getTimezoneOffset();return new Date(date.getTime()-offset*60000).toISOString().slice(0,16);};
const dayKey=(value:string|Date)=>{const d=new Date(value);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;};
const minutesFromDayStart=(value:string)=>{const date=new Date(value);return date.getHours()*60+date.getMinutes();};

function buildEventLayout(items: CalendarBlock[]) {
  const sorted = [...items].sort((a,b)=>new Date(a.startAt).getTime()-new Date(b.startAt).getTime());
  const layout = new Map<string,{column:number;columns:number}>();
  let group: CalendarBlock[] = [];
  let groupEnd = -Infinity;

  const flush = () => {
    if (!group.length) return;
    const columnEnds: number[] = [];
    const assignments = new Map<string,number>();
    for (const item of group) {
      const start = new Date(item.startAt).getTime();
      const end = new Date(item.endAt).getTime();
      let column = columnEnds.findIndex(value => value <= start);
      if (column < 0) column = columnEnds.length;
      columnEnds[column] = end;
      assignments.set(item.id,column);
    }
    const columns = Math.max(1,columnEnds.length);
    for (const item of group) layout.set(item.id,{column:assignments.get(item.id) ?? 0,columns});
    group = [];
    groupEnd = -Infinity;
  };

  for (const item of sorted) {
    const start = new Date(item.startAt).getTime();
    const end = new Date(item.endAt).getTime();
    if (group.length && start >= groupEnd) flush();
    group.push(item);
    groupEnd = Math.max(groupEnd,end);
  }
  flush();
  return layout;
}

export function AgendaView(){
  const [anchor,setAnchor]=useState(()=>startOfWeek(new Date()));
  const [blocks,setBlocks]=useState<CalendarBlock[]>([]);
  const [loading,setLoading]=useState(true);
  const [message,setMessage]=useState<string>();
  const [editorOpen,setEditorOpen]=useState(false);
  const [editingId,setEditingId]=useState<string|null>(null);
  const [selectedDay,setSelectedDay]=useState<Date>(()=>new Date());
  const [title,setTitle]=useState("");
  const [type,setType]=useState<CalendarBlockType>("FOCUS");
  const [startAt,setStartAt]=useState(()=>isoLocal(new Date(Date.now()+3600000)));
  const [endAt,setEndAt]=useState(()=>isoLocal(new Date(Date.now()+7200000)));
  const [completed,setCompleted]=useState(false);
  const [lifecycleStatus,setLifecycleStatus]=useState<CalendarLifecycleStatus>("PLANNED");
  const [domain,setDomain]=useState<CalendarDomain>("PERSONAL");
  const [summary,setSummary]=useState<WeeklyCalendarSummary|null>(null);
  const [conflictWarning,setConflictWarning]=useState<string>();
  const [saving,setSaving]=useState(false);
  const [draggingId,setDraggingId]=useState<string|null>(null);
  const [tasks,setTasks]=useState<Task[]>([]);
  const [workspaces,setWorkspaces]=useState<Project[]>([]);
  const [projectId,setProjectId]=useState<string>("");
  const days=useMemo(()=>Array.from({length:7},(_,i)=>{const d=new Date(anchor);d.setDate(d.getDate()+i);return d;}),[anchor]);

  const load=useCallback(async()=>{setLoading(true);setMessage(undefined);try{const from=anchor.toISOString();const to=new Date(anchor.getTime()+7*86400000).toISOString();const [result,summaryResult]=await Promise.all([lifeosApi.calendarBlocks(from,to),lifeosApi.calendarWeeklySummary(from,to)]);setBlocks(result.data);setSummary(summaryResult.data);}catch(e){setMessage(e instanceof Error?e.message:"Falha ao carregar agenda.");}finally{setLoading(false);}},[anchor]);
  useEffect(()=>{void load();},[load]);
  useEffect(()=>{void Promise.all([lifeosApi.tasks(),lifeosApi.projects()]).then(([taskResult,workspaceResult])=>{
    setTasks(taskResult.data.filter(item=>item.status!=="Concluída")); setWorkspaces(workspaceResult.data);
  }).catch(()=>undefined);},[]);
  useEffect(()=>{if(!editorOpen)return;const close=(event:KeyboardEvent)=>{if(event.key==="Escape")setEditorOpen(false);};window.addEventListener("keydown",close);return()=>window.removeEventListener("keydown",close);},[editorOpen]);

  function openNewEditor(day:Date,hour=9,minute=0){
    const start=new Date(day);start.setHours(hour,minute,0,0);
    const end=new Date(start);end.setHours(start.getHours()+1);
    setEditingId(null);setSelectedDay(new Date(day));setTitle("");setType("FOCUS");setCompleted(false);setLifecycleStatus("PLANNED");setDomain("PERSONAL");setConflictWarning(undefined);setProjectId("");setStartAt(isoLocal(start));setEndAt(isoLocal(end));setMessage(undefined);setEditorOpen(true);
  }

  function openBlockEditor(block:CalendarBlock){
    const start=new Date(block.startAt);
    setEditingId(block.id);setSelectedDay(start);setTitle(block.title);setType(block.blockType);setCompleted(block.completed);setLifecycleStatus(block.lifecycleStatus??(block.completed?"DONE":"PLANNED"));setDomain(block.domain??"PERSONAL");setConflictWarning(undefined);setProjectId(block.projectId??"");setStartAt(isoLocal(start));setEndAt(isoLocal(new Date(block.endAt)));setMessage(undefined);setEditorOpen(true);
  }

  function openFromTimeline(event:MouseEvent<HTMLDivElement>,day:Date){
    if((event.target as HTMLElement).closest(".calendar-block"))return;
    const rect=event.currentTarget.getBoundingClientRect();
    const rawMinutes=((event.clientY-rect.top)/HOUR_HEIGHT)*60;
    const rounded=Math.max(0,Math.min((END_HOUR-START_HOUR)*60,Math.round(rawMinutes/30)*30));
    const hour=START_HOUR+Math.floor(rounded/60);
    const minute=rounded%60;
    openNewEditor(day,hour,minute);
  }

  function overlappingBlocks(startValue:string,endValue:string,ignoreId?:string){const start=new Date(startValue).getTime(),end=new Date(endValue).getTime();return blocks.filter(item=>item.id!==ignoreId&&item.lifecycleStatus!=="CANCELLED"&&start<new Date(item.endAt).getTime()&&end>new Date(item.startAt).getTime());}

  async function save(){
    if(!title.trim()){setMessage("Digite um título para o compromisso.");return;}
    if(new Date(endAt)<=new Date(startAt)){setMessage("O horário final deve ser posterior ao inicial.");return;}
    const conflicts=overlappingBlocks(startAt,endAt,editingId??undefined);
    if(conflicts.length&&!conflictWarning){setConflictWarning(`Conflito com ${conflicts.map(item=>item.title).join(", ")}. Clique em salvar novamente para manter mesmo assim.`);return;}
    setSaving(true);setMessage(undefined);
    try{
      const input:CalendarBlockInput={title:title.trim(),description:"",blockType:type,startAt:new Date(startAt).toISOString(),endAt:new Date(endAt).toISOString(),taskId:null,projectId:projectId||null,completed:lifecycleStatus==="DONE",lifecycleStatus,domain};
      if(editingId)await lifeosApi.updateCalendarBlock(editingId,input);else await lifeosApi.createCalendarBlock(input);
      setEditorOpen(false);setTitle("");setEditingId(null);await load();
    }catch(e){setMessage(e instanceof Error?e.message:"Falha ao salvar bloco.");}finally{setSaving(false);}
  }
  async function toggle(block:CalendarBlock){try{await lifeosApi.completeCalendarBlock(block.id,block.lifecycleStatus!=="DONE");await load();}catch(e){setMessage(e instanceof Error?e.message:"Falha ao atualizar bloco.");}}
  async function remove(id:string){try{await lifeosApi.deleteCalendarBlock(id);setEditorOpen(false);setEditingId(null);await load();}catch(e){setMessage(e instanceof Error?e.message:"Falha ao excluir bloco.");}}
  async function returnToInbox(id:string){try{const result=await lifeosApi.returnCalendarBlockToInbox(id);setTasks(current=>[result.data,...current]);setEditorOpen(false);setEditingId(null);await load();}catch(e){setMessage(e instanceof Error?e.message:"Falha ao devolver para a Inbox.");}}

  async function dropBlock(event:DragEvent<HTMLDivElement>,day:Date){
    event.preventDefault();
    const taskDropId=event.dataTransfer.getData("text/lifeos-task");
    const id=event.dataTransfer.getData("text/calendar-block")||draggingId;
    const block=blocks.find(item=>item.id===id);
    setDraggingId(null);
    const rect=event.currentTarget.getBoundingClientRect();
    const rawMinutes=((event.clientY-rect.top)/HOUR_HEIGHT)*60;
    const rounded=Math.max(0,Math.min((END_HOUR-START_HOUR)*60,Math.round(rawMinutes/30)*30));
    const nextStart=new Date(day); nextStart.setHours(START_HOUR+Math.floor(rounded/60),rounded%60,0,0);
    if(taskDropId){
      const task=tasks.find(item=>item.id===taskDropId); if(!task)return;
      const nextEnd=new Date(nextStart.getTime()+Math.max(30,task.durationMinutes||30)*60000);
      try{const conflicts=overlappingBlocks(nextStart.toISOString(),nextEnd.toISOString());if(conflicts.length)setMessage(`Atenção: tarefa adicionada com conflito em ${conflicts.map(item=>item.title).join(", ")}.`);await lifeosApi.scheduleInboxTask(task.id,nextStart.toISOString(),nextEnd.toISOString());setTasks(current=>current.filter(item=>item.id!==task.id));await load();}catch(e){setMessage(e instanceof Error?e.message:"Falha ao planejar tarefa.");} return;
    }
    if(!block)return;
    const duration=Math.max(30*60000,new Date(block.endAt).getTime()-new Date(block.startAt).getTime());
    const nextEnd=new Date(nextStart.getTime()+duration);
    try{const conflicts=overlappingBlocks(nextStart.toISOString(),nextEnd.toISOString(),block.id);if(conflicts.length)setMessage(`Atenção: ${block.title} foi movido para um horário que conflita com ${conflicts.map(item=>item.title).join(", ")}.`);await lifeosApi.updateCalendarBlock(block.id,{title:block.title,description:block.description??"",blockType:block.blockType,startAt:nextStart.toISOString(),endAt:nextEnd.toISOString(),taskId:null,projectId:block.projectId??null,completed:block.lifecycleStatus==="DONE",lifecycleStatus:block.lifecycleStatus,domain:block.domain});await load();}catch(e){setMessage(e instanceof Error?e.message:"Falha ao mover evento.");}
  }
  const move=(delta:number)=>setAnchor(prev=>{const d=new Date(prev);d.setDate(d.getDate()+delta*7);return d;});

  return <main className="main-content">
    <PageHeader eyebrow="PLANEJAMENTO SEMANAL" title="Agenda" subtitle="Crie atividades com horário ou arraste pendências da Inbox. Cada item existe em um único lugar." />
    <div className="resource-header"><SyncState loading={loading} source="api" error={message} onRetry={load}/></div>
    <section className="panel agenda-toolbar">
      <div className="week-navigation">
        <button aria-label="Semana anterior" onClick={()=>move(-1)}><ChevronLeft size={17}/></button>
        <strong>{days[0].toLocaleDateString("pt-BR",{day:"2-digit",month:"short"})} — {days[6].toLocaleDateString("pt-BR",{day:"2-digit",month:"short",year:"numeric"})}</strong>
        <button aria-label="Próxima semana" onClick={()=>move(1)}><ChevronRight size={17}/></button>
        <button onClick={()=>setAnchor(startOfWeek(new Date()))}>Hoje</button>
        <Link className="secondary-button" href="/routine"><Repeat2 size={16}/>Minha rotina</Link><button className="agenda-primary-action" onClick={()=>openNewEditor(new Date(),new Date().getHours()+1,0)}><CalendarPlus size={16}/>Novo evento</button>
      </div>
      <p className="agenda-hint">A Agenda é preenchida pela sua Rotina Base. Ajustes feitos aqui alteram somente esta ocorrência, não a semana ideal.</p>
    </section>

    {summary&&<section className="agenda-summary-grid">
      <article><span>Trabalho</span><strong>{Math.round(summary.workMinutes/60)}h</strong></article>
      <article><span>Saúde</span><strong>{Math.round(summary.healthMinutes/60)}h</strong></article>
      <article><span>Estudo</span><strong>{Math.round(summary.studyMinutes/60)}h</strong></article>
      <article><span>Pessoal</span><strong>{Math.round(summary.personalMinutes/60)}h</strong></article>
      <article><span>Realizado</span><strong>{Math.round(summary.doneMinutes/60)}h</strong></article>
    </section>}
    <section className="agenda-task-tray panel"><div><strong>Inbox — ainda sem data</strong><span>Arraste para um horário: o item sai da Inbox e passa a existir na agenda.</span></div><div className="agenda-task-chips">{tasks.slice(0,12).map(task=><button draggable key={task.id} onDragStart={event=>{event.dataTransfer.effectAllowed="copy";event.dataTransfer.setData("text/lifeos-task",task.id);}}>{task.title}<small>{task.durationMinutes||30} min</small></button>)}</div></section>

    <section className="agenda-week-shell">
      <div className="agenda-week-header">
        <div className="agenda-time-corner" />
        {days.map(day=>{const isToday=dayKey(day)===dayKey(new Date());return <button key={day.toISOString()} className={`agenda-day-heading ${isToday?"today":""}`} onClick={()=>openNewEditor(day)}>
          <span>{day.toLocaleDateString("pt-BR",{weekday:"short"})}</span><strong>{day.getDate()}</strong>{isToday&&<small>Hoje</small>}
        </button>;})}
      </div>
      <div className="agenda-week-scroll">
        <div className="agenda-time-axis">{hours.map(hour=><div key={hour} style={{height:HOUR_HEIGHT}}><span>{String(hour).padStart(2,"0")}:00</span></div>)}</div>
        {days.map(day=>{
          const items=blocks.filter(b=>dayKey(b.startAt)===dayKey(day)).sort((a,b)=>new Date(a.startAt).getTime()-new Date(b.startAt).getTime());
          const eventLayout=buildEventLayout(items);
          return <div className={`agenda-day-timeline ${draggingId?"is-dragging":""}`} key={day.toISOString()} style={{height:(END_HOUR-START_HOUR+1)*HOUR_HEIGHT}} onClick={event=>openFromTimeline(event,day)} onDragOver={event=>event.preventDefault()} onDrop={event=>void dropBlock(event,day)}>
            {hours.map(hour=><div key={hour} className="agenda-hour-line" style={{top:(hour-START_HOUR)*HOUR_HEIGHT}} />)}
            {items.map(block=>{
              const startMinutes=Math.max(START_HOUR*60,minutesFromDayStart(block.startAt));
              const endMinutes=Math.min((END_HOUR+1)*60,minutesFromDayStart(block.endAt));
              const top=((startMinutes-START_HOUR*60)/60)*HOUR_HEIGHT;
              const height=Math.max(28,((Math.max(endMinutes,startMinutes+30)-startMinutes)/60)*HOUR_HEIGHT-4);
              const placement=eventLayout.get(block.id) ?? {column:0,columns:1};
              const columnWidth=100/placement.columns;
              const compact=height<42;
              const medium=height<72;
              const blockStyle={
                top,
                height,
                left:`calc(${placement.column*columnWidth}% + 4px)`,
                right:"auto",
                width:`calc(${columnWidth}% - 8px)`
              };
              return <button draggable className={`calendar-block type-${block.blockType.toLowerCase()} ${compact?"compact":""} ${medium?"medium":""} ${block.lifecycleStatus==="DONE"?"completed":""} ${block.lifecycleStatus==="CANCELLED"?"cancelled":""} ${draggingId===block.id?"dragging":""}`} style={blockStyle} key={block.id} onDragStart={event=>{setDraggingId(block.id);event.dataTransfer.effectAllowed="move";event.dataTransfer.setData("text/calendar-block",block.id);}} onDragEnd={()=>setDraggingId(null)} onClick={e=>{e.stopPropagation();openBlockEditor(block);}} title={`${block.title} · ${new Date(block.startAt).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}–${new Date(block.endAt).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}`}>
                <strong>{block.title}</strong>
                <small><Clock3 size={11}/>{new Date(block.startAt).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}–{new Date(block.endAt).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}</small>
                <span>{domainLabels[block.domain??"PERSONAL"]} · {lifecycleLabels[block.lifecycleStatus??"PLANNED"]}{block.projectId?" · workspace":""}</span>
              </button>;
            })}
            {!items.length&&<div className="agenda-day-empty"><Plus size={14}/><span>Clique para adicionar</span></div>}
          </div>;
        })}
      </div>
    </section>

    {editorOpen&&<div className="agenda-modal-backdrop" role="presentation" onMouseDown={()=>setEditorOpen(false)}>
      <section className="agenda-modal" role="dialog" aria-modal="true" aria-labelledby="agenda-modal-title" onMouseDown={e=>e.stopPropagation()}>
        <header><div><span>{editingId?"EDITAR EVENTO":"NOVO EVENTO"}</span><h2 id="agenda-modal-title">{selectedDay.toLocaleDateString("pt-BR",{weekday:"long",day:"2-digit",month:"long"})}</h2></div><button aria-label="Fechar" onClick={()=>setEditorOpen(false)}><X size={19}/></button></header>
        <div className="agenda-form">
          <label className="agenda-field agenda-field-wide"><span>Título</span><input autoFocus value={title} onChange={e=>setTitle(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")void save();}} placeholder="Ex.: Academia, consulta, reunião..."/></label>
          <label className="agenda-field"><span>Formato</span><select value={type} onChange={e=>setType(e.target.value as CalendarBlockType)}>{Object.entries(typeLabels).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
          <label className="agenda-field"><span>Área de vida</span><select value={domain} onChange={e=>setDomain(e.target.value as CalendarDomain)}>{Object.entries(domainLabels).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
          <label className="agenda-field"><span>Status</span><select value={lifecycleStatus} onChange={e=>{const value=e.target.value as CalendarLifecycleStatus;setLifecycleStatus(value);setCompleted(value==="DONE");}}>{Object.entries(lifecycleLabels).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
          <label className="agenda-field"><span>Início</span><input type="datetime-local" value={startAt} onChange={e=>setStartAt(e.target.value)}/></label>
          <label className="agenda-field"><span>Fim</span><input type="datetime-local" value={endAt} onChange={e=>setEndAt(e.target.value)}/></label>
          <label className="agenda-field"><span>Workspace relacionado</span><select value={projectId} onChange={e=>setProjectId(e.target.value)}><option value="">Nenhum</option>{workspaces.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <p className="agenda-sync-note">O item criado aqui já é a atividade da sua semana. A Inbox guarda somente o que ainda não tem data; arrastar para a agenda move o item, sem criar cópia.</p>
          
        </div>
        {conflictWarning&&<p className="agenda-conflict-warning">{conflictWarning}</p>}
        {message&&<p className="agenda-form-error">{message}</p>}
        <footer className="agenda-modal-actions">
          {editingId&&<><button className="agenda-cancel" onClick={()=>void returnToInbox(editingId)}>Mover para Inbox</button><button className="agenda-delete" onClick={()=>void remove(editingId)}><Trash2 size={15}/>Excluir</button></>}
          <span />
          <button className="agenda-cancel" onClick={()=>setEditorOpen(false)}>Cancelar</button>
          <button className="agenda-save" disabled={saving} onClick={()=>void save()}>{saving?"Salvando...":editingId?"Salvar alterações":"Adicionar à agenda"}</button>
        </footer>
      </section>
    </div>}
  </main>;
}
