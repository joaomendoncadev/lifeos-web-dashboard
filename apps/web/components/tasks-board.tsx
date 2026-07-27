"use client";

import { CalendarDays, Check, Clock3, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { lifeosApi } from "@/lib/api";
import { Project, Task, TaskInput, TaskStatus } from "@/lib/types";
import { useResource } from "@/lib/use-resource";
import { SyncState } from "./sync-state";
import { EntityDrawer } from "./entity-drawer";
import { ConfirmDialog } from "./confirm-dialog";
import { useToast } from "./toast-provider";

const initial: Task[] = [];
const emptyTask: TaskInput = { title: "", projectId: null, status: "Inbox", context: "Computador", priority: "Média", durationMinutes: 30, dueDate: null };

export type TaskView = "all" | "inbox" | "today" | "upcoming";

export function TasksBoard({ view = "all" }: { view?: TaskView }) {
  const taskLoader = useCallback(() => lifeosApi.tasks(), []);
  const projectLoader = useCallback(() => lifeosApi.projects(), []);
  const { data: tasks, setData: setTasks, loading, source, warning, error, reload } = useResource(taskLoader, initial);
  const { data: projects } = useResource<Project[]>(projectLoader, []);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Todas");
  const [newTitle, setNewTitle] = useState("");
  const [projectId, setProjectId] = useState("");
  const [saving, setSaving] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TaskInput>(emptyTask);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const { notify } = useToast();

  const filtered = useMemo(() => {
    const today = new Date();
    const todayKey = today.toISOString().slice(0, 10);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const tomorrowKey = tomorrow.toISOString().slice(0, 10);
    return tasks.filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = status === "Todas" || task.status === status;
      const matchesView = view === "all"
        || (view === "inbox" && !task.projectId && task.status !== "Concluída")
        || (view === "today" && task.dueDate === todayKey && task.status !== "Concluída")
        || (view === "upcoming" && Boolean(task.dueDate && task.dueDate >= tomorrowKey) && task.status !== "Concluída");
      return matchesSearch && matchesStatus && matchesView;
    });
  }, [query, status, tasks, view]);
  const editingTask = tasks.find(task => task.id === editingId) ?? null;

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const element = event.target as HTMLElement | null;
      if (element?.matches("input, textarea, select") || drawerOpen) return;
      if (event.key.toLowerCase() === "n") { event.preventDefault(); openCreate(); }
    };
    window.addEventListener("keydown", handler); return () => window.removeEventListener("keydown", handler);
  }, [drawerOpen]);

  function openCreate() { setEditingId(null); setForm(emptyTask); setDrawerOpen(true); }
  function openEdit(task: Task) {
    setEditingId(task.id);
    setForm({ title: task.title, projectId: task.projectId ?? null, status: task.status, context: task.context, priority: task.priority, durationMinutes: task.durationMinutes, dueDate: task.dueDate ?? null });
    setDrawerOpen(true);
  }

  async function toggleTask(task: Task) {
    const next: TaskStatus = task.status === "Concluída" ? "Próxima" : "Concluída";
    setTasks((current) => current.map((item) => item.id === task.id ? { ...item, status: next } : item));
    try { const updated = await lifeosApi.updateTaskStatus(task.id, next); setTasks(current => current.map(item => item.id === task.id ? updated : item)); notify(next === "Concluída" ? "Tarefa concluída." : "Tarefa reaberta."); }
    catch (reason) { notify(reason instanceof Error ? reason.message : "Falha ao sincronizar.", "error"); await reload(); }
  }

  async function capture(event: FormEvent) {
    event.preventDefault(); const title = newTitle.trim(); if (!title) return;
    setSaving(true);
    try { const result = await lifeosApi.createTask({ title, projectId: projectId || null }); setTasks(current => [result.data, ...current]); setNewTitle(""); setProjectId(""); notify("Tarefa criada."); }
    catch (reason) { notify(reason instanceof Error ? reason.message : "Falha ao criar tarefa.", "error"); }
    finally { setSaving(false); }
  }

  async function saveTask(event: FormEvent) {
    event.preventDefault(); if (!form.title.trim()) return;
    setSaving(true);
    try {
      const result = editingId ? await lifeosApi.updateTask(editingId, form) : await lifeosApi.createTask(form);
      setTasks(current => editingId ? current.map(item => item.id === editingId ? result.data : item) : [result.data, ...current]);
      setDrawerOpen(false); notify(editingId ? "Tarefa atualizada." : "Tarefa criada.");
    } catch (reason) { notify(reason instanceof Error ? reason.message : "Falha ao salvar tarefa.", "error"); }
    finally { setSaving(false); }
  }

  async function remove() {
    if (!deleteTarget) return; setSaving(true);
    try { await lifeosApi.deleteTask(deleteTarget.id); setTasks(current => current.filter(item => item.id !== deleteTarget.id)); setDeleteTarget(null); notify("Tarefa excluída."); }
    catch (reason) { notify(reason instanceof Error ? reason.message : "Falha ao excluir tarefa.", "error"); }
    finally { setSaving(false); }
  }

  return <>
    <section className="panel large-panel task-panel">
      <div className="resource-header"><SyncState loading={loading} source={source} warning={warning} error={error} onRetry={reload}/></div>
      <form className="capture-bar capture-with-project" onSubmit={capture}><Plus size={17}/><input value={newTitle} onChange={(event) => setNewTitle(event.target.value)} placeholder="Capture uma nova tarefa"/><select value={projectId} onChange={event => setProjectId(event.target.value)}><option value="">Inbox</option>{projects.map(project => <option value={project.id} key={project.id}>{project.name}</option>)}</select><button disabled={saving}>{saving ? "Salvando…" : "Adicionar"}</button></form>
      <div className="toolbar"><label className="search-field"><Search size={17}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar nesta visão"/></label>{view === "all" ? <div className="segmented">{["Todas", "Inbox", "Próxima", "Em andamento", "Concluída"].map(item => <button key={item} onClick={() => setStatus(item)} className={status === item ? "selected" : ""} type="button">{item}</button>)}</div> : null}</div>
      <div className="data-list">{!loading && filtered.length === 0 ? <div className="empty-state compact"><strong>Nenhuma tarefa encontrada</strong><p>Ajuste os filtros ou pressione <kbd>N</kbd> para criar uma tarefa.</p><button className="primary-button" onClick={openCreate}><Plus size={16}/> Nova tarefa</button></div> : null}{filtered.map(task => <article className={`data-row task-row ${task.status === "Concluída" ? "completed" : ""}`} key={task.id} onDoubleClick={() => openEdit(task)}>
        <button className="task-check" onClick={() => void toggleTask(task)}>{task.status === "Concluída" ? <Check size={15}/> : null}</button>
        <button className="data-copy task-copy" onClick={() => openEdit(task)}><strong>{task.title}</strong><span>{task.project} · {task.context} · {task.priority}{task.dueDate ? ` · ${new Date(`${task.dueDate}T12:00:00`).toLocaleDateString("pt-BR")}` : ""}</span></button>
        <span className={`status-badge status-${task.status.toLowerCase().replace(/ /g, "-")}`}>{task.status}</span>
        <span className="time-label"><Clock3 size={14}/> {task.duration}</span>
        <div className="row-actions"><button className="icon-button ghost" onClick={() => openEdit(task)} title="Editar"><Pencil size={16}/></button><button className="icon-button ghost danger-icon" onClick={() => setDeleteTarget(task)} title="Excluir"><Trash2 size={16}/></button></div>
      </article>)}</div>
    </section>

    <EntityDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} eyebrow={editingTask ? "Editar tarefa" : "Nova tarefa"} title={editingTask?.title || "Organize a próxima ação"} footer={<><button className="secondary-button" type="button" onClick={() => setDrawerOpen(false)}>Cancelar</button><button className="primary-button" form="task-editor-form" disabled={saving}>{saving ? "Salvando…" : editingId ? "Salvar alterações" : "Criar tarefa"}</button></>}>
      <form id="task-editor-form" className="entity-form" onSubmit={saveTask}>
        <label className="field field-wide"><span>Título</span><input autoFocus value={form.title} onChange={event => setForm(current => ({ ...current, title: event.target.value }))} placeholder="O que precisa ser feito?"/></label>
        <div className="form-grid">
          <label className="field"><span>Status</span><select value={form.status} onChange={event => setForm(current => ({ ...current, status: event.target.value as TaskStatus }))}>{["Inbox", "Próxima", "Em andamento", "Concluída"].map(value => <option key={value}>{value}</option>)}</select></label>
          <label className="field"><span>Prioridade</span><select value={form.priority} onChange={event => setForm(current => ({ ...current, priority: event.target.value }))}><option>Alta</option><option>Média</option><option>Baixa</option></select></label>
          <label className="field"><span>Projeto</span><select value={form.projectId ?? ""} onChange={event => setForm(current => ({ ...current, projectId: event.target.value || null }))}><option value="">Inbox</option>{projects.map(project => <option value={project.id} key={project.id}>{project.name}</option>)}</select></label>
          <label className="field"><span>Contexto</span><select value={form.context} onChange={event => setForm(current => ({ ...current, context: event.target.value }))}><option>Computador</option><option>Casa</option><option>Rua</option><option>Telefone</option><option>Trabalho</option><option>Pessoal</option></select></label>
          <label className="field"><span><Clock3 size={14}/> Duração</span><div className="input-suffix"><input type="number" min="5" step="5" value={form.durationMinutes} onChange={event => setForm(current => ({ ...current, durationMinutes: Number(event.target.value) }))}/><em>min</em></div></label>
          <label className="field"><span><CalendarDays size={14}/> Data</span><input type="date" value={form.dueDate ?? ""} onChange={event => setForm(current => ({ ...current, dueDate: event.target.value || null }))}/></label>
        </div>
        <div className="drawer-tip"><strong>Atalhos</strong><span><kbd>Esc</kbd> fecha o painel · <kbd>N</kbd> cria uma tarefa · duplo clique abre a edição.</span></div>
      </form>
    </EntityDrawer>
    <ConfirmDialog open={Boolean(deleteTarget)} title="Excluir tarefa?" description={`“${deleteTarget?.title ?? ""}” será removida permanentemente.`} onCancel={() => setDeleteTarget(null)} onConfirm={() => void remove()} busy={saving}/>
  </>;
}
