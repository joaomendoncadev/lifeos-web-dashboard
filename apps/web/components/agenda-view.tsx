"use client";

import { CalendarPlus, Check, ChevronLeft, ChevronRight, Clock3, GripVertical, Trash2 } from "lucide-react";
import { DragEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { lifeosApi } from "@/lib/api";
import { CalendarBlock, CalendarBlockInput, CalendarBlockType, Task } from "@/lib/types";
import { PageHeader } from "./page-header";
import { SyncState } from "./sync-state";
import { Skeleton } from "./skeleton";

const typeLabels: Record<CalendarBlockType,string> = {FOCUS:"Foco",MEETING:"Reunião",PERSONAL:"Pessoal",ROUTINE:"Rotina",BREAK:"Pausa"};
const startOfWeek=(date:Date)=>{const d=new Date(date);const day=(d.getDay()+6)%7;d.setDate(d.getDate()-day);d.setHours(0,0,0,0);return d;};
const isoLocal=(date:Date)=>{const offset=date.getTimezoneOffset();return new Date(date.getTime()-offset*60000).toISOString().slice(0,16);};
const dayKey=(value:string|Date)=>{const d=new Date(value);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;};
const minutesOfDay=(date:Date)=>date.getHours()*60+date.getMinutes();
const dateAtMinutes=(day:Date,minutes:number)=>{const d=new Date(day);d.setHours(0,minutes,0,0);return d;};
const formatDuration=(minutes:number)=>{const h=Math.floor(minutes/60),m=minutes%60;return h?`${h}h${m?` ${m}min`:""}`:`${m}min`;};

const ROW_HEIGHT = 52;
const DAY_MINUTES = 24*60;
const SNAP_MINUTES = 15;

type Positioned = { block: CalendarBlock; top: number; height: number; left: number; width: number };

function layoutDay(dayBlocks: CalendarBlock[]): Positioned[] {
  const sorted = [...dayBlocks].sort((a,b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
  const laneEnds: number[] = [];
  const laneOf: number[] = sorted.map(block => {
    const start = new Date(block.startAt).getTime();
    let lane = laneEnds.findIndex(end => end <= start);
    if (lane === -1) { lane = laneEnds.length; laneEnds.push(0); }
    laneEnds[lane] = new Date(block.endAt).getTime();
    return lane;
  });
  const laneCount = Math.max(1, laneEnds.length);
  return sorted.map((block, index) => {
    const startMinutes = minutesOfDay(new Date(block.startAt));
    let duration = minutesOfDay(new Date(block.endAt)) - startMinutes;
    if (duration <= 0) duration = DAY_MINUTES - startMinutes;
    duration = Math.max(20, duration);
    return {
      block,
      top: (startMinutes / 60) * ROW_HEIGHT,
      height: (duration / 60) * ROW_HEIGHT,
      left: (laneOf[index] / laneCount) * 100,
      width: (1 / laneCount) * 100,
    };
  });
}

type DragPayload = { kind: "block" | "task"; id: string };

export function AgendaView(){
  const [anchor,setAnchor]=useState(()=>startOfWeek(new Date()));
  const [blocks,setBlocks]=useState<CalendarBlock[]>([]);
  const [tasks,setTasks]=useState<Task[]>([]);
  const [loading,setLoading]=useState(true);
  const [message,setMessage]=useState<string>();
  const [title,setTitle]=useState("");
  const [type,setType]=useState<CalendarBlockType>("FOCUS");
  const [startAt,setStartAt]=useState(()=>isoLocal(new Date(Date.now()+3600000)));
  const [endAt,setEndAt]=useState(()=>isoLocal(new Date(Date.now()+7200000)));
  const [dropHint,setDropHint]=useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrolledOnce = useRef(false);
  const days=useMemo(()=>Array.from({length:7},(_,i)=>{const d=new Date(anchor);d.setDate(d.getDate()+i);return d;}),[anchor]);
  const now = new Date();
  const todayKey = dayKey(now);

  const load=useCallback(async()=>{
    setLoading(true);setMessage(undefined);
    try{
      const from=anchor.toISOString();const to=new Date(anchor.getTime()+7*86400000).toISOString();
      const [blockResult, taskResult] = await Promise.all([lifeosApi.calendarBlocks(from,to), lifeosApi.tasks()]);
      setBlocks(blockResult.data);
      setTasks(taskResult.data);
    }catch(e){setMessage(e instanceof Error?e.message:"Falha ao carregar agenda.");}
    finally{setLoading(false);}
  },[anchor]);
  useEffect(()=>{void load();},[load]);

  useEffect(() => {
    if (scrolledOnce.current || !scrollRef.current) return;
    scrollRef.current.scrollTop = Math.max(0, 6 * ROW_HEIGHT - 40);
    scrolledOnce.current = true;
  }, [loading]);

  const scheduledTaskIds = useMemo(() => new Set(blocks.map(b => b.taskId).filter(Boolean) as string[]), [blocks]);
  const unscheduledTasks = useMemo(() => tasks.filter(t => t.status !== "Concluída" && !scheduledTaskIds.has(t.id)), [tasks, scheduledTaskIds]);

  async function create(){if(!title.trim())return;setMessage(undefined);try{const input:CalendarBlockInput={title:title.trim(),description:"",blockType:type,startAt:new Date(startAt).toISOString(),endAt:new Date(endAt).toISOString(),taskId:null,projectId:null,completed:false};await lifeosApi.createCalendarBlock(input);setTitle("");await load();}catch(e){setMessage(e instanceof Error?e.message:"Falha ao criar bloco.");}}
  async function toggle(block:CalendarBlock){await lifeosApi.completeCalendarBlock(block.id,!block.completed);await load();}
  async function remove(id:string){await lifeosApi.deleteCalendarBlock(id);await load();}
  const move=(delta:number)=>setAnchor(prev=>{const d=new Date(prev);d.setDate(d.getDate()+delta*7);return d;});

  async function moveBlock(block: CalendarBlock, day: Date, minutes: number) {
    const durationMs = new Date(block.endAt).getTime() - new Date(block.startAt).getTime();
    const nextStart = dateAtMinutes(day, minutes);
    const nextEnd = new Date(nextStart.getTime() + durationMs);
    try {
      await lifeosApi.updateCalendarBlock(block.id, { title: block.title, description: block.description, blockType: block.blockType, startAt: nextStart.toISOString(), endAt: nextEnd.toISOString(), taskId: block.taskId ?? null, projectId: block.projectId ?? null, completed: block.completed });
      await load();
    } catch (e) { setMessage(e instanceof Error ? e.message : "Falha ao mover o bloco."); }
  }

  async function scheduleTask(task: Task, day: Date, minutes: number) {
    const start = dateAtMinutes(day, minutes);
    const end = new Date(start.getTime() + task.durationMinutes * 60000);
    try {
      await lifeosApi.createCalendarBlock({ title: task.title, description: "", blockType: "FOCUS", startAt: start.toISOString(), endAt: end.toISOString(), taskId: task.id, projectId: task.projectId ?? null, completed: false });
      await load();
    } catch (e) { setMessage(e instanceof Error ? e.message : "Falha ao agendar a tarefa."); }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>, day: Date) {
    event.preventDefault();
    setDropHint(null);
    const raw = event.dataTransfer.getData("text/plain");
    if (!raw) return;
    let payload: DragPayload;
    try { payload = JSON.parse(raw); } catch { return; }
    const rect = event.currentTarget.getBoundingClientRect();
    const offsetY = event.clientY - rect.top;
    const rawMinutes = (offsetY / ROW_HEIGHT) * 60;
    const snapped = Math.max(0, Math.min(DAY_MINUTES - SNAP_MINUTES, Math.round(rawMinutes / SNAP_MINUTES) * SNAP_MINUTES));
    if (payload.kind === "block") {
      const block = blocks.find(b => b.id === payload.id);
      if (block) void moveBlock(block, day, snapped);
    } else {
      const task = unscheduledTasks.find(t => t.id === payload.id);
      if (task) void scheduleTask(task, day, snapped);
    }
  }

  return <main className="main-content">
    <PageHeader eyebrow="PLANEJAMENTO SEMANAL" title="Agenda" subtitle="Transforme prioridades em blocos reais de tempo e proteja seu foco." />
    <div className="resource-header"><SyncState loading={loading} source="api" error={message} onRetry={load}/></div>
    <section className="panel agenda-toolbar">
      <div className="week-navigation"><button onClick={()=>move(-1)}><ChevronLeft size={17}/></button><strong>{days[0].toLocaleDateString("pt-BR",{day:"2-digit",month:"short"})} — {days[6].toLocaleDateString("pt-BR",{day:"2-digit",month:"short",year:"numeric"})}</strong><button onClick={()=>move(1)}><ChevronRight size={17}/></button><button onClick={()=>setAnchor(startOfWeek(new Date()))}>Hoje</button></div>
      <div className="agenda-create"><CalendarPlus size={18}/><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Novo bloco de tempo"/><select value={type} onChange={e=>setType(e.target.value as CalendarBlockType)}>{Object.entries(typeLabels).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select><input type="datetime-local" value={startAt} onChange={e=>setStartAt(e.target.value)}/><input type="datetime-local" value={endAt} onChange={e=>setEndAt(e.target.value)}/><button onClick={create}>Adicionar</button></div>
    </section>

    <div className="agenda-layout">
      <div className="timeline-column">
        <div className="timeline-header" style={{ gridTemplateColumns: `52px repeat(7, minmax(150px, 1fr))` }}>
          <div/>
          {days.map(day => <div key={dayKey(day)} className={`timeline-header-cell ${dayKey(day) === todayKey ? "today" : ""}`}><span>{day.toLocaleDateString("pt-BR",{weekday:"short"})}</span><strong>{day.getDate()}</strong></div>)}
        </div>
        <div className="timeline-scroll" ref={scrollRef}>
        <div className="timeline-grid" style={{ gridTemplateColumns: `52px repeat(7, minmax(150px, 1fr))` }}>
          <div className="timeline-gutter" style={{ height: DAY_MINUTES / 60 * ROW_HEIGHT }}>
            {Array.from({ length: 24 }).map((_, hour) => <span key={hour} style={{ top: hour * ROW_HEIGHT }}>{String(hour).padStart(2, "0")}:00</span>)}
          </div>
          {days.map(day => {
            const key = dayKey(day);
            const items = loading ? [] : layoutDay(blocks.filter(b => dayKey(b.startAt) === key));
            const isToday = key === todayKey;
            return <div className={`day-timeline ${isToday ? "today" : ""} ${dropHint === key ? "drop-active" : ""}`} key={key}
              style={{ height: DAY_MINUTES / 60 * ROW_HEIGHT }}
              onDragOver={event => { event.preventDefault(); setDropHint(key); }}
              onDragLeave={() => setDropHint(current => current === key ? null : current)}
              onDrop={event => handleDrop(event, day)}>
              {loading ? <div className="timeline-loading"><Skeleton height={60} radius="11px"/><Skeleton height={60} radius="11px" style={{ marginTop: 8, opacity: .6 }}/></div> : null}
              {isToday ? <div className="now-line" style={{ top: (minutesOfDay(now) / 60) * ROW_HEIGHT }}/> : null}
              {items.map(({ block, top, height, left, width }) => <div
                key={block.id}
                className={`timeline-block type-${block.blockType.toLowerCase()} ${block.completed ? "completed" : ""}`}
                style={{ top, height, left: `${left}%`, width: `calc(${width}% - 4px)` }}
                draggable
                onDragStart={event => event.dataTransfer.setData("text/plain", JSON.stringify({ kind: "block", id: block.id }))}
                title={`${block.title} · ${new Date(block.startAt).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}–${new Date(block.endAt).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}`}>
                <div className="timeline-block-head"><GripVertical size={12}/><span>{typeLabels[block.blockType]}</span></div>
                <strong>{block.title}</strong>
                {height > 40 ? <small><Clock3 size={11}/>{formatDuration(Math.round((new Date(block.endAt).getTime()-new Date(block.startAt).getTime())/60000))}</small> : null}
                <footer><button onClick={() => void toggle(block)} title="Concluir"><Check size={13}/></button><button onClick={() => void remove(block.id)} title="Excluir"><Trash2 size={13}/></button></footer>
              </div>)}
            </div>;
          })}
        </div>
        </div>
      </div>

      <aside className="panel agenda-unscheduled">
        <header><span className="eyebrow small">Não agendadas</span><h3>Arraste para um horário</h3></header>
        <div className="unscheduled-list">
          {loading ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} height={54} radius="11px"/>) : unscheduledTasks.length === 0
            ? <p className="muted">Todas as tarefas ativas já estão na agenda.</p>
            : unscheduledTasks.map(task => <div className="unscheduled-task" key={task.id} draggable
                onDragStart={event => event.dataTransfer.setData("text/plain", JSON.stringify({ kind: "task", id: task.id }))}>
                <GripVertical size={14}/>
                <div><strong>{task.title}</strong><span>{task.project} · {task.duration}</span></div>
              </div>)}
        </div>
      </aside>
    </div>
  </main>;
}
