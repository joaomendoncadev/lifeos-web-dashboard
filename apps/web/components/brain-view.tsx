"use client";

import { Archive, ArchiveRestore, FileText, Plus, Search, Star, Trash2 } from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { lifeosApi } from "@/lib/api";
import { Area, Note, NoteInput, Project } from "@/lib/types";
import { SyncState } from "./sync-state";
import { ConfirmDialog } from "./confirm-dialog";
import { useToast } from "./toast-provider";
import { Skeleton } from "./skeleton";

const empty: NoteInput = { title: "", content: "", areaId: null, projectId: null, tags: [], favorite: false, archived: false };

function markdownPreview(content: string) {
  return content.split("\n").map((line, index) => {
    if (line.startsWith("### ")) return <h3 key={index}>{line.slice(4)}</h3>;
    if (line.startsWith("## ")) return <h2 key={index}>{line.slice(3)}</h2>;
    if (line.startsWith("# ")) return <h1 key={index}>{line.slice(2)}</h1>;
    if (line.startsWith("- [x] ")) return <p key={index}>☑ {line.slice(6)}</p>;
    if (line.startsWith("- [ ] ")) return <p key={index}>☐ {line.slice(6)}</p>;
    if (line.startsWith("- ")) return <li key={index}>{line.slice(2)}</li>;
    if (line.startsWith("> ")) return <blockquote key={index}>{line.slice(2)}</blockquote>;
    if (line.startsWith("```")) return <code key={index}>{line.slice(3)}</code>;
    return <p key={index}>{line || " "}</p>;
  });
}

export function BrainView() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selected, setSelected] = useState<string>();
  const [form, setForm] = useState<NoteInput>(empty);
  const [query, setQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState<string>();
  const [deleteTarget, setDeleteTarget] = useState<Note | null>(null);
  const [saving, setSaving] = useState(false);
  const { notify } = useToast();

  const load = useCallback(async () => {
    setLoading(true); setError(undefined);
    try {
      const [noteResult, areaResult, projectResult] = await Promise.all([
        lifeosApi.notes(query, showArchived), lifeosApi.areas(), lifeosApi.projects()
      ]);
      setNotes(noteResult.data); setAreas(areaResult.data); setProjects(projectResult.data);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Falha ao carregar o Second Brain."); }
    finally { setLoading(false); }
  }, [query, showArchived]);

  useEffect(() => { const id = window.setTimeout(() => void load(), 250); return () => window.clearTimeout(id); }, [load]);

  const current = useMemo(() => notes.find((note) => note.id === selected), [notes, selected]);

  function select(note: Note) {
    setSelected(note.id);
    setForm({ title: note.title, content: note.content, areaId: note.area?.id ?? null, projectId: note.projectId ?? null, tags: note.tags.map((tag) => tag.name), favorite: note.favorite, archived: note.archived });
    setMessage(undefined);
  }

  function createNew() { setSelected(undefined); setForm(empty); setPreview(false); setMessage(undefined); }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!form.title?.trim()) { notify("Informe um título.", "error"); return; }
    setSaving(true);
    try {
      const result = selected ? await lifeosApi.updateNote(selected, form) : await lifeosApi.createNote(form);
      setNotes((items) => selected ? items.map((item) => item.id === selected ? result.data : item) : [result.data, ...items]);
      setSelected(result.data.id); setMessage("Nota salva."); notify("Nota salva.");
    } catch (reason) { notify(reason instanceof Error ? reason.message : "Falha ao salvar a nota.", "error"); }
    finally { setSaving(false); }
  }

  async function toggleFavorite(note: Note) {
    try { const result = await lifeosApi.favoriteNote(note.id, !note.favorite); setNotes((items) => items.map((item) => item.id === note.id ? result.data : item)); if (selected === note.id) setForm((value) => ({ ...value, favorite: result.data.favorite })); }
    catch (reason) { setMessage(reason instanceof Error ? reason.message : "Falha ao favoritar."); }
  }

  async function archive(note: Note) {
    try { await lifeosApi.archiveNote(note.id, !note.archived); setNotes((items) => items.filter((item) => item.id !== note.id)); if (selected === note.id) createNew(); }
    catch (reason) { setMessage(reason instanceof Error ? reason.message : "Falha ao arquivar."); }
  }

  async function remove() {
    if (!deleteTarget) return;
    setSaving(true);
    try { await lifeosApi.deleteNote(deleteTarget.id); setNotes((items) => items.filter((item) => item.id !== deleteTarget.id)); if (selected === deleteTarget.id) createNew(); setDeleteTarget(null); notify("Nota excluída."); }
    catch (reason) { notify(reason instanceof Error ? reason.message : "Falha ao excluir.", "error"); }
    finally { setSaving(false); }
  }

  return <>
  <section className="brain-layout panel">
    <aside className="brain-list">
      <div className="brain-toolbar">
        <button className="primary-button" onClick={createNew}><Plus size={16}/>Nova nota</button>
        <button className="icon-button" title={showArchived ? "Ver ativas" : "Ver arquivadas"} onClick={() => { setShowArchived((value) => !value); setSelected(undefined); }}><Archive size={16}/></button>
      </div>
      <label className="brain-search"><Search size={15}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pesquisar notas e tags"/></label>
      <SyncState loading={loading} source="api" error={error} onRetry={load}/>
      <div className="brain-note-list">
        {loading ? Array.from({ length: 5 }).map((_, index) => <div className="brain-note-item" key={index} aria-hidden="true">
          <div><Skeleton width={15} height={15} radius="4px"/><Skeleton width="55%" height={13}/></div>
          <Skeleton width="90%" height={11} style={{ marginTop: 4 }}/>
          <Skeleton width="40%" height={9} style={{ marginTop: 4 }}/>
        </div>) : notes.map((note) => <button className={`brain-note-item ${selected === note.id ? "active" : ""}`} onClick={() => select(note)} key={note.id}>
          <div><FileText size={15}/><strong>{note.title}</strong>{note.favorite ? <Star size={13} fill="currentColor"/> : null}</div>
          <p>{note.content.slice(0, 90) || "Nota sem conteúdo"}</p>
          <span>{note.area?.name ?? "Sem área"} · {new Date(note.updatedAt).toLocaleDateString("pt-BR")}</span>
        </button>)}
        {!loading && notes.length === 0 ? <p className="empty-state">Nenhuma nota encontrada.</p> : null}
      </div>
    </aside>

    <form className="brain-editor" onSubmit={save}>
      <div className="brain-editor-actions">
        <div className="segmented"><button type="button" className={!preview ? "active" : ""} onClick={() => setPreview(false)}>Editar</button><button type="button" className={preview ? "active" : ""} onClick={() => setPreview(true)}>Visualizar</button></div>
        {current ? <div className="row-actions"><button type="button" className="icon-button" title="Favoritar" onClick={() => void toggleFavorite(current)}><Star size={17} fill={current.favorite ? "currentColor" : "none"}/></button><button type="button" className="icon-button" title={current.archived ? "Restaurar" : "Arquivar"} onClick={() => void archive(current)}>{current.archived ? <ArchiveRestore size={17}/> : <Archive size={17}/>}</button><button type="button" className="icon-button danger-icon" title="Excluir" onClick={() => setDeleteTarget(current)}><Trash2 size={17}/></button></div> : null}
      </div>
      <input className="brain-title" value={form.title ?? ""} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Título da nota"/>
      <div className="brain-meta">
        <select value={form.areaId ?? ""} onChange={(event) => setForm({ ...form, areaId: event.target.value || null })}><option value="">Sem área</option>{areas.map((area) => <option key={area.id} value={area.id}>{area.name}</option>)}</select>
        <select value={form.projectId ?? ""} onChange={(event) => setForm({ ...form, projectId: event.target.value || null })}><option value="">Sem projeto</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select>
        <input value={(form.tags ?? []).join(", ")} onChange={(event) => setForm({ ...form, tags: event.target.value.split(",").map((tag) => tag.trim()).filter(Boolean) })} placeholder="tags, separadas, por vírgula"/>
      </div>
      {preview ? <article className="markdown-preview">{markdownPreview(form.content ?? "")}</article> : <textarea className="brain-content" value={form.content ?? ""} onChange={(event) => setForm({ ...form, content: event.target.value })} placeholder="# Comece a escrever...\n\nUse Markdown para organizar suas ideias."/>}
      <footer className="brain-footer"><span>{message}</span><button className="primary-button" type="submit" disabled={saving}>{saving ? "Salvando…" : "Salvar nota"}</button></footer>
    </form>
  </section>
  <ConfirmDialog open={Boolean(deleteTarget)} title="Excluir nota definitivamente?" description={`“${deleteTarget?.title ?? ""}” e seu conteúdo serão removidos permanentemente.`} onCancel={() => setDeleteTarget(null)} onConfirm={() => void remove()} busy={saving}/>
  </>;
}
