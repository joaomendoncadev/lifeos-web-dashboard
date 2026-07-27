"use client";
import { BarChart3, Brain, CalendarDays, CalendarRange, CheckSquare, FileText, FolderKanban, Home, Inbox, LayoutGrid, Loader2, Search, Settings, Sun, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { lifeosApi } from "@/lib/api";
import { SearchItem } from "@/lib/types";

const commands = [
  ["Home", "/", Home], ["Inbox", "/inbox", Inbox], ["Hoje", "/today", Sun], ["Próximos", "/upcoming", CalendarRange],
  ["Workspaces", "/workspaces", LayoutGrid], ["Knowledge", "/brain", Brain], ["Calendar", "/agenda", CalendarDays],
  ["Insights", "/insights", BarChart3], ["Configurações", "/settings", Settings]
] as const;
const icons:Record<string,typeof FileText>={WORKSPACE:FolderKanban,TASK:CheckSquare,NOTE:FileText};

export function CommandPalette() {
  const [open,setOpen]=useState(false); const [query,setQuery]=useState(""); const [results,setResults]=useState<SearchItem[]>([]); const [loading,setLoading]=useState(false); const router=useRouter();
  useEffect(()=>{const handler=(event:KeyboardEvent)=>{if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==="k"){event.preventDefault();setOpen(value=>!value);}if(event.key==="Escape")setOpen(false);};window.addEventListener("keydown",handler);return()=>window.removeEventListener("keydown",handler);},[]);
  useEffect(()=>{if(!open||query.trim().length<2){setResults([]);setLoading(false);return;}const id=window.setTimeout(async()=>{setLoading(true);try{setResults((await lifeosApi.search(query)).data.results);}catch{setResults([]);}finally{setLoading(false);}},220);return()=>window.clearTimeout(id);},[open,query]);
  const filtered=useMemo(()=>commands.filter(([label])=>label.toLowerCase().includes(query.toLowerCase())),[query]);
  function go(href:string){router.push(href);setOpen(false);setQuery("");setResults([]);}
  if(!open)return null;
  return <div className="modal-layer command-layer" role="dialog" aria-modal="true" aria-label="Busca global"><button className="modal-backdrop" onClick={()=>setOpen(false)} aria-label="Fechar"/><section className="command-palette global-search"><header><Search size={19}/><input autoFocus value={query} onChange={event=>setQuery(event.target.value)} placeholder="Buscar ou executar um comando…"/><button onClick={()=>setOpen(false)}><X size={17}/></button></header><div className="command-results">
   {query.length<2?<><p className="command-group-label">Navegação</p>{filtered.map(([label,href,Icon])=><button key={href} onClick={()=>go(href)}><Icon size={18}/><span>{label}</span><kbd>↵</kbd></button>)}</>:null}
   {query.length>=2?<><p className="command-group-label">Resultados em todo o LifeOS {loading?<Loader2 size={14} className="spin"/>:null}</p>{results.map(item=>{const Icon=icons[item.type]??FileText;return <button key={`${item.type}-${item.id}`} onClick={()=>go(item.href)}><Icon size={18}/><span><strong>{item.title}</strong><small>{item.type.toLowerCase()} · {item.subtitle}</small></span><kbd>↵</kbd></button>;})}{!loading&&!results.length?<p className="command-empty">Nenhum workspace, tarefa ou nota encontrado.</p>:null}</>:null}
  </div><footer><span><kbd>⌘ K</kbd> busca global</span><span><kbd>esc</kbd> fechar</span></footer></section></div>;
}
