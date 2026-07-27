"use client";

import { CalendarPlus, FileText, Inbox, LayoutGrid, Plus, X } from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { lifeosApi } from "@/lib/api";
import type { Project, TaskStatus } from "@/lib/types";
import { useToast } from "./toast-provider";

type CaptureType = "task" | "note" | "workspace";

export function QuickCapture() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<CaptureType>("task");
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [workspaceId, setWorkspaceId] = useState("");
  const [workspaces, setWorkspaces] = useState<Project[]>([]);
  const [saving, setSaving] = useState(false);
  const { notify } = useToast();

  const show = useCallback(() => {
    setOpen(true);
    void lifeosApi.projects().then(result => setWorkspaces(result.data)).catch(() => undefined);
  }, []);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.tagName === "SELECT" || target?.isContentEditable;
      if ((!typing && event.key.toLowerCase() === "q") || ((event.metaKey || event.ctrlKey) && event.shiftKey && event.code === "Space")) {
        event.preventDefault(); show();
      }
      if (event.key === "Escape") setOpen(false);
    };
    const custom = () => show();
    window.addEventListener("keydown", handler);
    window.addEventListener("lifeos:quick-capture", custom);
    return () => { window.removeEventListener("keydown", handler); window.removeEventListener("lifeos:quick-capture", custom); };
  }, [show]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      if (type === "task") {
        const status: TaskStatus = workspaceId ? "Próxima" : "Inbox";
        await lifeosApi.createTask({ title: title.trim(), projectId: workspaceId || null, status, context: "Pessoal", priority: "Média", durationMinutes: 30 });
      } else if (type === "note") {
        await lifeosApi.createNote({ title: title.trim(), content: details, projectId: workspaceId || null, tags: [], favorite: false, archived: false });
      } else {
        await lifeosApi.createProject({ name: title.trim(), description: details, area: "Pessoal", type: "BLANK", icon: "LayoutGrid", color: "gray" }, "blank");
      }
      notify(`${type === "task" ? "Tarefa" : type === "note" ? "Nota" : "Workspace"} criado.`);
      setTitle(""); setDetails(""); setWorkspaceId(""); setOpen(false);
      window.dispatchEvent(new Event("lifeos:data-changed"));
    } catch (reason) {
      notify(reason instanceof Error ? reason.message : "Não foi possível capturar o item.", "error");
    } finally { setSaving(false); }
  }

  if (!open) return null;
  return <div className="modal-layer command-layer" role="dialog" aria-modal="true" aria-label="Captura rápida">
    <button className="modal-backdrop" onClick={() => setOpen(false)} aria-label="Fechar"/>
    <section className="quick-capture-panel">
      <header><div><span className="eyebrow">CAPTURA GLOBAL</span><h2>Criar sem perder o contexto</h2></div><button className="icon-button ghost" onClick={() => setOpen(false)}><X size={18}/></button></header>
      <div className="capture-types">
        <button className={type === "task" ? "selected" : ""} onClick={() => setType("task")}><Inbox size={17}/>Tarefa</button>
        <button className={type === "note" ? "selected" : ""} onClick={() => setType("note")}><FileText size={17}/>Nota</button>
        <button className={type === "workspace" ? "selected" : ""} onClick={() => setType("workspace")}><LayoutGrid size={17}/>Workspace</button>
      </div>
      <form onSubmit={submit} className="entity-form">
        <label className="field field-wide"><span>Título</span><input autoFocus value={title} onChange={e => setTitle(e.target.value)} placeholder={type === "task" ? "O que precisa ser feito?" : type === "note" ? "Qual ideia deseja guardar?" : "Nome do novo workspace"}/></label>
        {type !== "workspace" ? <label className="field field-wide"><span>Workspace</span><select value={workspaceId} onChange={e => setWorkspaceId(e.target.value)}><option value="">{type === "task" ? "Inbox" : "Sem workspace"}</option>{workspaces.map(workspace => <option key={workspace.id} value={workspace.id}>{workspace.name}</option>)}</select></label> : null}
        {type !== "task" ? <label className="field field-wide"><span>{type === "note" ? "Conteúdo" : "Descrição"}</span><textarea rows={5} value={details} onChange={e => setDetails(e.target.value)}/></label> : null}
        <footer><span><kbd>Q</kbd> abre de qualquer tela</span><button className="primary-button" disabled={saving || !title.trim()}><Plus size={15}/>{saving ? "Criando…" : "Criar"}</button></footer>
      </form>
    </section>
  </div>;
}
