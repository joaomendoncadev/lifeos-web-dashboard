"use client";

import { CalendarPlus, Check, ChevronLeft, ChevronRight, Clock3, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { lifeosApi } from "@/lib/api";
import { CalendarBlock, CalendarBlockInput, CalendarBlockType } from "@/lib/types";
import { PageHeader } from "./page-header";
import { SyncState } from "./sync-state";
import { Skeleton } from "./skeleton";

const typeLabels: Record<CalendarBlockType,string> = {FOCUS:"Foco",MEETING:"Reunião",PERSONAL:"Pessoal",ROUTINE:"Rotina",BREAK:"Pausa"};
const startOfWeek=(date:Date)=>{const d=new Date(date);const day=(d.getDay()+6)%7;d.setDate(d.getDate()-day);d.setHours(0,0,0,0);return d;};
const isoLocal=(date:Date)=>{const offset=date.getTimezoneOffset();return new Date(date.getTime()-offset*60000).toISOString().slice(0,16);};
const dayKey=(value:string|Date)=>{const d=new Date(value);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;};

export function AgendaView(){
  const [anchor,setAnchor]=useState(()=>startOfWeek(new Date()));
  const [blocks,setBlocks]=useState<CalendarBlock[]>([]);
  const [loading,setLoading]=useState(true);
  const [message,setMessage]=useState<string>();
  const [title,setTitle]=useState("");
  const [type,setType]=useState<CalendarBlockType>("FOCUS");
  const [startAt,setStartAt]=useState(()=>isoLocal(new Date(Date.now()+3600000)));
  const [endAt,setEndAt]=useState(()=>isoLocal(new Date(Date.now()+7200000)));
  const days=useMemo(()=>Array.from({length:7},(_,i)=>{const d=new Date(anchor);d.setDate(d.getDate()+i);return d;}),[anchor]);

  const load=useCallback(async()=>{setLoading(true);setMessage(undefined);try{const from=anchor.toISOString();const to=new Date(anchor.getTime()+7*86400000).toISOString();const result=await lifeosApi.calendarBlocks(from,to);setBlocks(result.data);}catch(e){setMessage(e instanceof Error?e.message:"Falha ao carregar agenda.");}finally{setLoading(false);}},[anchor]);
  useEffect(()=>{void load();},[load]);

  async function create(){if(!title.trim())return;setMessage(undefined);try{const input:CalendarBlockInput={title:title.trim(),description:"",blockType:type,startAt:new Date(startAt).toISOString(),endAt:new Date(endAt).toISOString(),taskId:null,projectId:null,completed:false};await lifeosApi.createCalendarBlock(input);setTitle("");await load();}catch(e){setMessage(e instanceof Error?e.message:"Falha ao criar bloco.");}}
  async function toggle(block:CalendarBlock){await lifeosApi.completeCalendarBlock(block.id,!block.completed);await load();}
  async function remove(id:string){await lifeosApi.deleteCalendarBlock(id);await load();}
  const move=(delta:number)=>setAnchor(prev=>{const d=new Date(prev);d.setDate(d.getDate()+delta*7);return d;});

  return <main className="main-content">
    <PageHeader eyebrow="PLANEJAMENTO SEMANAL" title="Agenda" subtitle="Transforme prioridades em blocos reais de tempo e proteja seu foco." />
    <div className="resource-header"><SyncState loading={loading} source="api" error={message} onRetry={load}/></div>
    <section className="panel agenda-toolbar">
      <div className="week-navigation"><button onClick={()=>move(-1)}><ChevronLeft size={17}/></button><strong>{days[0].toLocaleDateString("pt-BR",{day:"2-digit",month:"short"})} — {days[6].toLocaleDateString("pt-BR",{day:"2-digit",month:"short",year:"numeric"})}</strong><button onClick={()=>move(1)}><ChevronRight size={17}/></button><button onClick={()=>setAnchor(startOfWeek(new Date()))}>Hoje</button></div>
      <div className="agenda-create"><CalendarPlus size={18}/><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Novo bloco de tempo"/><select value={type} onChange={e=>setType(e.target.value as CalendarBlockType)}>{Object.entries(typeLabels).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select><input type="datetime-local" value={startAt} onChange={e=>setStartAt(e.target.value)}/><input type="datetime-local" value={endAt} onChange={e=>setEndAt(e.target.value)}/><button onClick={create}>Adicionar</button></div>
    </section>
    <section className="week-grid">{days.map(day=>{const items=blocks.filter(b=>dayKey(b.startAt)===dayKey(day));return <article className="day-column" key={day.toISOString()}><header><span>{day.toLocaleDateString("pt-BR",{weekday:"short"})}</span><strong>{day.getDate()}</strong></header><div className="day-blocks">{loading?<><Skeleton height={54} radius="11px"/><Skeleton height={54} radius="11px" style={{opacity:.6}}/></>:<>{items.length===0&&<p className="day-empty">Sem blocos</p>}{items.map(block=><div className={`calendar-block type-${block.blockType.toLowerCase()} ${block.completed?"completed":""}`} key={block.id}><div><span>{typeLabels[block.blockType]}</span><strong>{block.title}</strong><small><Clock3 size={12}/>{new Date(block.startAt).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}–{new Date(block.endAt).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}</small></div><footer><button onClick={()=>toggle(block)} title="Concluir"><Check size={15}/></button><button onClick={()=>remove(block.id)} title="Excluir"><Trash2 size={15}/></button></footer></div>)}</>}</div></article>})}</section>
  </main>;
}
