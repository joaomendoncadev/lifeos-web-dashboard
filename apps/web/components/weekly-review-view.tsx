"use client";

import { BarChart3, Save, Sparkles } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { lifeosApi } from "@/lib/api";
import { WeeklyReview } from "@/lib/types";
import { PageHeader } from "./page-header";
import { SyncState } from "./sync-state";

const empty:WeeklyReview={highlights:"",challenges:"",lessons:"",nextWeekPriorities:"",energy:3};
export function WeeklyReviewView(){
 const [review,setReview]=useState<WeeklyReview>(empty);const[loading,setLoading]=useState(true);const[saving,setSaving]=useState(false);const[message,setMessage]=useState<string>();
 const load=useCallback(async()=>{setLoading(true);setMessage(undefined);try{const result=await lifeosApi.weeklyReviewCurrent();setReview(result.data??empty);}catch(e){setMessage(e instanceof Error?e.message:"Falha ao carregar revisão semanal.");}finally{setLoading(false);}},[]);
 useEffect(()=>{void load();},[load]);
 async function save(){setSaving(true);setMessage(undefined);try{const result=await lifeosApi.saveWeeklyReviewCurrent(review);setReview(result.data);setMessage("Revisão semanal salva.");}catch(e){setMessage(e instanceof Error?e.message:"Falha ao salvar.");}finally{setSaving(false);}}
 return <main className="main-content"><PageHeader eyebrow="FECHAMENTO DA SEMANA" title="Revisão semanal" subtitle="Consolide aprendizados, ajuste a direção e escolha poucas prioridades para a próxima semana."/><div className="resource-header"><SyncState loading={loading} source="api" error={message?.startsWith("Falha")?message:undefined} onRetry={load}/></div><section className="review-grid"><article className="panel review-main"><label className="field-label">Energia média da semana</label><div className="mood-picker">{[1,2,3,4,5].map(v=><button key={v} className={review.energy===v?"active":""} onClick={()=>setReview({...review,energy:v})}>{["😴","😕","😐","🙂","⚡"][v-1]}</button>)}</div><label className="field-label">Principais avanços</label><textarea value={review.highlights} onChange={e=>setReview({...review,highlights:e.target.value})} placeholder="O que realmente avançou?"/><label className="field-label">Desafios e pendências</label><textarea value={review.challenges} onChange={e=>setReview({...review,challenges:e.target.value})} placeholder="O que ficou travado ou consumiu energia?"/><label className="field-label">Aprendizados</label><textarea value={review.lessons} onChange={e=>setReview({...review,lessons:e.target.value})} placeholder="O que deve mudar na próxima semana?"/><label className="field-label">Prioridades da próxima semana</label><textarea value={review.nextWeekPriorities} onChange={e=>setReview({...review,nextWeekPriorities:e.target.value})} placeholder="Escolha de 3 a 5 resultados importantes."/><button className="primary-button" onClick={save} disabled={saving}><Save size={17}/>{saving?"Salvando...":"Salvar revisão semanal"}</button>{message&&!message.startsWith("Falha")&&<p className="success-message">{message}</p>}</article><aside className="panel review-tip"><BarChart3 size={28}/><h3>Revise o sistema, não apenas você</h3><p>Use os dados da semana para ajustar capacidade, agenda e prioridades.</p><ul><li>Elimine compromissos sem valor.</li><li>Reserve blocos para trabalho profundo.</li><li>Planeje margem para imprevistos.</li></ul><Sparkles size={20}/></aside></section></main>;
}
