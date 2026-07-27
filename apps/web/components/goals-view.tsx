"use client";
import { CalendarDays, Pencil, Plus, Trash2 } from "lucide-react";
import { FormEvent, useCallback, useState } from "react";
import { lifeosApi } from "@/lib/api";
import { Goal, GoalInput } from "@/lib/types";
import { useResource } from "@/lib/use-resource";
import { SyncState } from "./sync-state";
import { EntityDrawer } from "./entity-drawer";
import { ConfirmDialog } from "./confirm-dialog";
import { useToast } from "./toast-provider";

const empty: GoalInput={title:"",area:"Pessoal",description:"",progress:0,deadline:null};
export function GoalsView(){
 const loader=useCallback(()=>lifeosApi.goals(),[]); const {data,setData,loading,source,warning,error,reload}=useResource(loader,[] as Goal[]);
 const [form,setForm]=useState<GoalInput>(empty); const [editing,setEditing]=useState<string|null>(null); const [drawerOpen,setDrawerOpen]=useState(false); const [deleteTarget,setDeleteTarget]=useState<Goal|null>(null); const [saving,setSaving]=useState(false); const {notify}=useToast();
 const current=data.find(item=>item.id===editing)??null;
 function openCreate(){setEditing(null);setForm(empty);setDrawerOpen(true)}
 function openEdit(g:Goal){setEditing(g.id);setForm({title:g.title,area:g.area,description:g.description,progress:g.progress,deadline:g.deadline});setDrawerOpen(true)}
 async function save(e:FormEvent){e.preventDefault();if(!form.title.trim()){notify("Informe o título da meta.","error");return}setSaving(true);try{const r=editing?await lifeosApi.updateGoal(editing,form):await lifeosApi.createGoal(form);setData(c=>editing?c.map(x=>x.id===editing?r.data:x):[...c,r.data]);setDrawerOpen(false);notify(editing?"Meta atualizada.":"Meta criada.")}catch(x){notify(x instanceof Error?x.message:"Falha ao salvar meta.","error")}finally{setSaving(false)}}
 async function remove(){if(!deleteTarget)return;setSaving(true);try{await lifeosApi.deleteGoal(deleteTarget.id);setData(c=>c.filter(x=>x.id!==deleteTarget.id));setDeleteTarget(null);notify("Meta arquivada.")}catch(x){notify(x instanceof Error?x.message:"Falha ao arquivar meta.","error")}finally{setSaving(false)}}
 return <><div className="resource-header"><SyncState loading={loading} source={source} warning={warning} error={error} onRetry={reload}/><button className="primary-button" onClick={openCreate}><Plus size={16}/> Nova meta</button></div>
 {!loading&&data.length===0?<div className="empty-state panel"><strong>Nenhuma meta ativa</strong><p>Defina um resultado importante e acompanhe seu progresso.</p><button className="primary-button" onClick={openCreate}><Plus size={16}/> Criar primeira meta</button></div>:null}
 <section className="goal-grid">{data.map(g=><article className="goal-card" key={g.id} onDoubleClick={()=>openEdit(g)}><header><span className="eyebrow small">{g.area}</span><div className="row-actions"><button className="icon-button ghost" onClick={()=>openEdit(g)}><Pencil size={15}/></button><button className="icon-button ghost danger-icon" onClick={()=>setDeleteTarget(g)}><Trash2 size={15}/></button></div></header><h2>{g.title}</h2><p>{g.description||"Sem descrição."}</p><div className="goal-progress-copy"><span>Progresso</span><strong>{g.progress}%</strong></div><div className="progress"><span style={{width:`${g.progress}%`}}/></div><footer><CalendarDays size={14}/>{g.deadline?new Date(`${g.deadline}T12:00:00`).toLocaleDateString("pt-BR"):"Sem prazo"}</footer></article>)}</section>
 <EntityDrawer open={drawerOpen} onClose={()=>setDrawerOpen(false)} eyebrow={current?"Editar meta":"Nova meta"} title={current?.title||"Defina um resultado claro"} footer={<><button className="secondary-button" onClick={()=>setDrawerOpen(false)}>Cancelar</button><button className="primary-button" form="goal-editor-form" disabled={saving}>{saving?"Salvando…":editing?"Salvar alterações":"Criar meta"}</button></>}><form id="goal-editor-form" className="entity-form" onSubmit={save}><label className="field field-wide"><span>Título</span><input autoFocus value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Ex.: concluir certificação AWS"/></label><label className="field field-wide"><span>Descrição</span><textarea rows={5} value={form.description??""} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Como você saberá que essa meta foi alcançada?"/></label><div className="form-grid"><label className="field"><span>Área</span><select value={form.area??"Pessoal"} onChange={e=>setForm({...form,area:e.target.value})}><option>Pessoal</option><option>Carreira</option><option>Estudos</option><option>Saúde</option><option>Finanças</option><option>Viagens</option><option>Relacionamentos</option></select></label><label className="field"><span>Prazo</span><input type="date" value={form.deadline??""} onChange={e=>setForm({...form,deadline:e.target.value||null})}/></label><label className="field field-wide"><span>Progresso: {form.progress??0}%</span><input type="range" min="0" max="100" step="5" value={form.progress??0} onChange={e=>setForm({...form,progress:Number(e.target.value)})}/></label></div></form></EntityDrawer>
 <ConfirmDialog open={Boolean(deleteTarget)} title="Arquivar meta?" description={`“${deleteTarget?.title??""}” deixará de aparecer entre as metas ativas.`} confirmLabel="Arquivar" onCancel={()=>setDeleteTarget(null)} onConfirm={()=>void remove()} busy={saving}/>
 </>;
}
