"use client";
import { CalendarDays, Pencil, Plus, Trash2 } from "lucide-react";
import { FormEvent, useCallback, useState } from "react";
import { lifeosApi } from "@/lib/api";
import { Goal, GoalInput } from "@/lib/types";
import { useResource } from "@/lib/use-resource";
import { SyncState } from "./sync-state";

const empty: GoalInput={title:"",area:"Pessoal",description:"",progress:0,deadline:null};
export function GoalsView(){
 const loader=useCallback(()=>lifeosApi.goals(),[]); const {data,setData,loading,source,warning,error,reload}=useResource(loader,[] as Goal[]);
 const [form,setForm]=useState<GoalInput>(empty); const [editing,setEditing]=useState<string>(); const [message,setMessage]=useState<string>();
 async function save(e:FormEvent){e.preventDefault();if(!form.title.trim())return;try{const r=editing?await lifeosApi.updateGoal(editing,form):await lifeosApi.createGoal(form);setData(c=>editing?c.map(x=>x.id===editing?r.data:x):[...c,r.data]);setForm(empty);setEditing(undefined);setMessage(undefined);}catch(x){setMessage(x instanceof Error?x.message:"Falha ao salvar meta.")}}
 function edit(g:Goal){setEditing(g.id);setForm({title:g.title,area:g.area,description:g.description,progress:g.progress,deadline:g.deadline});}
 async function remove(id:string){if(!confirm("Arquivar esta meta?"))return;try{await lifeosApi.deleteGoal(id);setData(c=>c.filter(x=>x.id!==id));}catch(x){setMessage(x instanceof Error?x.message:"Falha ao excluir meta.")}}
 return <><div className="resource-header"><SyncState loading={loading} source={source} warning={warning} error={error} onRetry={reload}/></div>
 <form className="goal-create panel" onSubmit={save}><Plus size={18}/><input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Ex.: concluir certificação"/><input value={form.area??""} onChange={e=>setForm({...form,area:e.target.value})} placeholder="Área"/><input type="number" min="0" max="100" value={form.progress??0} onChange={e=>setForm({...form,progress:Number(e.target.value)})}/><input type="date" value={form.deadline??""} onChange={e=>setForm({...form,deadline:e.target.value||null})}/><button>{editing?"Salvar":"Adicionar"}</button></form>
 {message?<p className="inline-message">{message}</p>:null}<section className="goal-grid">{data.map(g=><article className="goal-card" key={g.id}><header><span className="eyebrow small">{g.area}</span><div className="row-actions"><button className="icon-button ghost" onClick={()=>edit(g)}><Pencil size={15}/></button><button className="icon-button ghost danger-icon" onClick={()=>void remove(g.id)}><Trash2 size={15}/></button></div></header><h2>{g.title}</h2><p>{g.description||"Sem descrição."}</p><div className="goal-progress-copy"><span>Progresso</span><strong>{g.progress}%</strong></div><div className="progress"><span style={{width:`${g.progress}%`}}/></div><footer><CalendarDays size={14}/>{g.deadline?new Date(`${g.deadline}T12:00:00`).toLocaleDateString("pt-BR"):"Sem prazo"}</footer></article>)}</section></>;
}
