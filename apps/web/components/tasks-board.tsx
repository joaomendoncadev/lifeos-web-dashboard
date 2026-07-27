"use client";

import { Check, Clock3, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { FormEvent, useCallback, useMemo, useState } from "react";
import { lifeosApi } from "@/lib/api";
import { Project, Task, TaskStatus } from "@/lib/types";
import { useResource } from "@/lib/use-resource";
import { SyncState } from "./sync-state";

const initial: Task[] = [];

export function TasksBoard() {
  const taskLoader = useCallback(() => lifeosApi.tasks(), []);
  const projectLoader = useCallback(() => lifeosApi.projects(), []);
  const { data: tasks, setData: setTasks, loading, source, warning, error, reload } = useResource(taskLoader, initial);
  const { data: projects } = useResource<Project[]>(projectLoader, []);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Todas");
  const [newTitle, setNewTitle] = useState("");
  const [projectId, setProjectId] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string>();

  const filtered = useMemo(() => tasks.filter((task) => task.title.toLowerCase().includes(query.toLowerCase()) && (status === "Todas" || task.status === status)), [query, status, tasks]);

  async function toggleTask(task: Task) {
    const next: TaskStatus = task.status === "Concluída" ? "Próxima" : "Concluída";
    setTasks((current) => current.map((item) => item.id === task.id ? { ...item, status: next } : item));
    try { const updated = await lifeosApi.updateTaskStatus(task.id, next); setTasks(current => current.map(item => item.id === task.id ? updated : item)); }
    catch (reason) { setMessage(reason instanceof Error ? reason.message : "Falha ao sincronizar."); await reload(); }
  }

  async function capture(event: FormEvent) {
    event.preventDefault();
    const title = newTitle.trim();
    if (!title) return;
    setSaving(true);
    try {
      const result = await lifeosApi.createTask({ title, projectId: projectId || null });
      setTasks((current) => [result.data, ...current]);
      setNewTitle(""); setProjectId(""); setMessage("Tarefa criada.");
    } catch (reason) { setMessage(reason instanceof Error ? reason.message : "Falha ao criar tarefa."); }
    finally { setSaving(false); }
  }

  async function edit(task: Task) {
    const title = window.prompt("Título da tarefa", task.title)?.trim();
    if (!title) return;
    const context = window.prompt("Contexto", task.context)?.trim() || task.context;
    const priority = window.prompt("Prioridade: Alta, Média ou Baixa", task.priority)?.trim() || task.priority;
    const durationText = window.prompt("Duração em minutos", String(task.durationMinutes));
    const durationMinutes = Math.max(5, Number(durationText) || task.durationMinutes);
    try {
      const result = await lifeosApi.updateTask(task.id, { title, context, priority, durationMinutes, status: task.status, projectId: task.projectId });
      setTasks(current => current.map(item => item.id === task.id ? result.data : item));
      setMessage("Tarefa atualizada.");
    } catch (reason) { setMessage(reason instanceof Error ? reason.message : "Falha ao atualizar tarefa."); }
  }

  async function remove(task: Task) {
    if (!window.confirm(`Excluir “${task.title}”?`)) return;
    try { await lifeosApi.deleteTask(task.id); setTasks(current => current.filter(item => item.id !== task.id)); setMessage("Tarefa excluída."); }
    catch (reason) { setMessage(reason instanceof Error ? reason.message : "Falha ao excluir tarefa."); }
  }

  return <section className="panel large-panel">
    <div className="resource-header"><SyncState loading={loading} source={source} warning={warning} error={error} onRetry={reload}/></div>
    <form className="capture-bar capture-with-project" onSubmit={capture}><Plus size={17}/><input value={newTitle} onChange={(event) => setNewTitle(event.target.value)} placeholder="Capture uma nova tarefa"/><select value={projectId} onChange={event => setProjectId(event.target.value)}><option value="">Inbox</option>{projects.map(project => <option value={project.id} key={project.id}>{project.name}</option>)}</select><button disabled={saving}>{saving ? "Salvando…" : "Adicionar"}</button></form>
    {message ? <p className="inline-message">{message}</p> : null}
    <div className="toolbar"><label className="search-field"><Search size={17}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar tarefas"/></label><div className="segmented">{["Todas", "Inbox", "Próxima", "Em andamento", "Concluída"].map(item => <button key={item} onClick={() => setStatus(item)} className={status === item ? "selected" : ""} type="button">{item}</button>)}</div></div>
    <div className="data-list">{!loading && filtered.length === 0 ? <div className="empty-state compact"><strong>Nenhuma tarefa encontrada</strong><p>Ajuste os filtros ou capture uma nova tarefa.</p></div> : null}{filtered.map(task => <article className={`data-row ${task.status === "Concluída" ? "completed" : ""}`} key={task.id}>
      <button className="task-check" onClick={() => void toggleTask(task)}>{task.status === "Concluída" ? <Check size={15}/> : null}</button>
      <div className="data-copy"><strong>{task.title}</strong><span>{task.project} · {task.context} · {task.priority}</span></div>
      <span className={`status-badge status-${task.status.toLowerCase().replace(/ /g, "-")}`}>{task.status}</span>
      <span className="time-label"><Clock3 size={14}/> {task.duration}</span>
      <div className="row-actions"><button className="icon-button ghost" onClick={() => void edit(task)} title="Editar"><Pencil size={16}/></button><button className="icon-button ghost danger-icon" onClick={() => void remove(task)} title="Excluir"><Trash2 size={16}/></button></div>
    </article>)}</div>
  </section>;
}
