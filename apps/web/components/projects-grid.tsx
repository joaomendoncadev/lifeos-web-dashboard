"use client";

import { CalendarDays, Check, ChevronRight, CircleDot, Inbox, LayoutGrid, ListChecks, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { DragEvent, FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { lifeosApi } from "@/lib/api";
import { Project, ProjectInput, Task, TaskInput, TaskStatus } from "@/lib/types";
import { useResource } from "@/lib/use-resource";
import { SyncState } from "./sync-state";
import { EntityDrawer } from "./entity-drawer";
import { ConfirmDialog } from "./confirm-dialog";
import { useToast } from "./toast-provider";
import { ProjectIcon, projectIconOptions } from "./project-icon";
import { Skeleton } from "./skeleton";

const emptyProject: ProjectInput = { name: "", area: "Pessoal", description: "", deadline: null, icon: "Rocket" };
const emptyTask: TaskInput = { title: "", projectId: null, status: "Próxima", context: "Computador", priority: "Média", durationMinutes: 30, dueDate: null };
const columns: Array<{ status: TaskStatus; label: string }> = [
  { status: "Próxima", label: "A fazer" },
  { status: "Em andamento", label: "Em andamento" },
  { status: "Concluída", label: "Concluído" },
];

export function ProjectsGrid() {
  const projectLoader = useCallback(() => lifeosApi.projects(), []);
  const taskLoader = useCallback(() => lifeosApi.tasks(), []);
  const { data: projects, setData: setProjects, loading, source, warning, error, reload } = useResource(projectLoader, [] as Project[]);
  const { data: tasks, setData: setTasks, reload: reloadTasks } = useResource(taskLoader, [] as Task[]);
  const [selectedId, setSelectedId] = useState<string | null | undefined>(undefined);
  const [query, setQuery] = useState("");
  const [drawer, setDrawer] = useState<"project" | "task" | null>(null);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [projectForm, setProjectForm] = useState<ProjectInput>(emptyProject);
  const [taskForm, setTaskForm] = useState<TaskInput>(emptyTask);
  const [deleteProject, setDeleteProject] = useState<Project | null>(null);
  const [deleteTask, setDeleteTask] = useState<Task | null>(null);
  const [saving, setSaving] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const { notify } = useToast();

  useEffect(() => {
    if (selectedId === undefined && projects.length > 0) setSelectedId(projects[0].id);
  }, [projects, selectedId]);

  const selectedProject = selectedId ? projects.find(project => project.id === selectedId) ?? null : null;
  const activeProjectId = selectedProject?.id ?? null;
  const inboxTasks = useMemo(() => tasks.filter(task => !task.projectId && task.status !== "Concluída" && task.title.toLowerCase().includes(query.toLowerCase())), [tasks, query]);
  const projectTasks = useMemo(() => tasks.filter(task => task.projectId === activeProjectId && task.title.toLowerCase().includes(query.toLowerCase())), [tasks, activeProjectId, query]);

  function openProject(project?: Project) {
    setEditingProjectId(project?.id ?? null);
    setProjectForm(project ? { name: project.name, area: project.area, description: project.description, deadline: project.deadlineDate ?? null, dueDate: project.deadlineDate ?? null, icon: project.icon, type: project.type, color: project.color, status: project.status, startDate: project.startDate, metadata: project.metadata } : emptyProject);
    setDrawer("project");
  }

  function openTask(task?: Task, projectId: string | null = activeProjectId) {
    setEditingTaskId(task?.id ?? null);
    setTaskForm(task ? { title: task.title, projectId: task.projectId ?? null, status: task.status, context: task.context, priority: task.priority, durationMinutes: task.durationMinutes, dueDate: task.dueDate ?? null } : { ...emptyTask, projectId });
    setDrawer("task");
  }

  async function saveProject(event: FormEvent) {
    event.preventDefault(); if (!projectForm.name.trim()) return; setSaving(true);
    try {
      const result = editingProjectId ? await lifeosApi.updateProject(editingProjectId, projectForm) : await lifeosApi.createProject(projectForm);
      setProjects(current => editingProjectId ? current.map(item => item.id === editingProjectId ? result.data : item) : [...current, result.data]);
      if (!editingProjectId) setSelectedId(result.data.id);
      setDrawer(null); notify(editingProjectId ? "Workspace atualizado." : "Workspace criado.");
    } catch (reason) { notify(reason instanceof Error ? reason.message : "Falha ao salvar projeto.", "error"); }
    finally { setSaving(false); }
  }

  async function saveTask(event: FormEvent) {
    event.preventDefault(); if (!taskForm.title.trim()) return; setSaving(true);
    try {
      const result = editingTaskId ? await lifeosApi.updateTask(editingTaskId, taskForm) : await lifeosApi.createTask(taskForm);
      setTasks(current => editingTaskId ? current.map(item => item.id === editingTaskId ? result.data : item) : [result.data, ...current]);
      setDrawer(null); notify(editingTaskId ? "Tarefa atualizada." : "Tarefa criada.");
    } catch (reason) { notify(reason instanceof Error ? reason.message : "Falha ao salvar tarefa.", "error"); }
    finally { setSaving(false); }
  }

  async function moveTask(taskId: string, projectId: string | null, status?: TaskStatus) {
    const task = tasks.find(item => item.id === taskId); if (!task) return;
    const next: TaskInput = { title: task.title, projectId, status: status ?? (projectId ? (task.status === "Inbox" ? "Próxima" : task.status) : "Inbox"), context: task.context, priority: task.priority, durationMinutes: task.durationMinutes, dueDate: task.dueDate ?? null };
    setTasks(current => current.map(item => item.id === taskId ? { ...item, projectId, project: projectId ? projects.find(p => p.id === projectId)?.name ?? item.project : "Inbox", status: next.status! } : item));
    try { const result = await lifeosApi.updateTask(taskId, next); setTasks(current => current.map(item => item.id === taskId ? result.data : item)); notify(projectId ? "Tarefa movida para o workspace." : "Tarefa movida para a Inbox."); }
    catch (reason) { notify(reason instanceof Error ? reason.message : "Não foi possível mover a tarefa.", "error"); await reloadTasks(); }
  }

  function drop(event: DragEvent, projectId: string | null, status?: TaskStatus) {
    event.preventDefault(); const id = event.dataTransfer.getData("text/task-id") || draggingId; setDraggingId(null); if (id) void moveTask(id, projectId, status);
  }

  async function toggle(task: Task) { await moveTask(task.id, task.projectId ?? null, task.status === "Concluída" ? "Próxima" : "Concluída"); }

  async function removeProject() {
    if (!deleteProject) return; setSaving(true);
    try { await lifeosApi.deleteProject(deleteProject.id); setProjects(current => current.filter(item => item.id !== deleteProject.id)); setTasks(current => current.map(task => task.projectId === deleteProject.id ? { ...task, projectId: null, project: "Inbox", status: "Inbox" } : task)); setDeleteProject(null); setSelectedId(null); notify("Workspace arquivado. As tarefas permanecem acessíveis pela Inbox."); }
    catch (reason) { notify(reason instanceof Error ? reason.message : "Falha ao excluir projeto.", "error"); } finally { setSaving(false); }
  }

  async function removeTask() {
    if (!deleteTask) return; setSaving(true);
    try { await lifeosApi.deleteTask(deleteTask.id); setTasks(current => current.filter(item => item.id !== deleteTask.id)); setDeleteTask(null); notify("Tarefa excluída."); }
    catch (reason) { notify(reason instanceof Error ? reason.message : "Falha ao excluir tarefa.", "error"); } finally { setSaving(false); }
  }

  return <>
    <div className="resource-header workspace-sync"><SyncState loading={loading} source={source} warning={warning} error={error} onRetry={reload}/></div>
    <section className="project-workspace">
      <aside className="workspace-rail panel">
        <div className="workspace-rail-header"><div><span className="eyebrow small">Workspaces</span><strong>Projetos</strong></div><button className="icon-button" onClick={() => openProject()} title="Novo workspace"><Plus size={17}/></button></div>
        <label className="workspace-search"><Search size={15}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar tarefas"/></label>
        <button className={`workspace-project inbox-project ${selectedId === null ? "selected" : ""}`} onClick={() => setSelectedId(null)} onDragOver={event => event.preventDefault()} onDrop={event => drop(event, null)}><span className="workspace-project-icon"><Inbox size={17}/></span><span><strong>Inbox</strong><small>{inboxTasks.length} tarefas sem projeto</small></span><ChevronRight size={15}/></button>
        <div className="workspace-project-list">{loading ? <WorkspaceRailSkeleton/> : projects.map(project => <button key={project.id} className={`workspace-project ${activeProjectId === project.id ? "selected" : ""}`} onClick={() => setSelectedId(project.id)} onDragOver={event => event.preventDefault()} onDrop={event => drop(event, project.id)}><span className="workspace-project-icon"><ProjectIcon name={project.icon}/></span><span><strong>{project.name}</strong><small>{tasks.filter(task => task.projectId === project.id && task.status !== "Concluída").length} abertas · {project.progress}%</small></span><ChevronRight size={15}/></button>)}</div>
      </aside>

      <main className="workspace-main panel">
        {selectedProject ? <>
          <header className="workspace-hero"><div className="workspace-title"><span className="workspace-large-icon"><ProjectIcon name={selectedProject.icon} size={23}/></span><div><span className="eyebrow small">{selectedProject.area}</span><h2>{selectedProject.name}</h2><p>{selectedProject.description}</p></div></div><div className="workspace-actions"><Link className="secondary-button" href={`/workspaces/${selectedProject.id}`}>Abrir workspace</Link><button className="secondary-button" onClick={() => openProject(selectedProject)}><Pencil size={15}/> Editar</button><button className="primary-button" onClick={() => openTask()}><Plus size={15}/> Nova tarefa</button><button className="icon-button ghost danger-icon" onClick={() => setDeleteProject(selectedProject)}><Trash2 size={16}/></button></div></header>
          <div className="workspace-summary"><div><strong>{projectTasks.filter(t => t.status !== "Concluída").length}</strong><span>itens abertos</span></div><div><strong>{projectTasks.filter(t => t.status === "Em andamento").length}</strong><span>em andamento</span></div><div><strong>{projectTasks.filter(t => t.status === "Concluída").length}</strong><span>concluídas</span></div><div><strong>{selectedProject.deadline}</strong><span>prazo</span></div></div>
          <div className="workspace-progress"><div><span>Progresso do projeto</span><strong>{selectedProject.progress}%</strong></div><div className="progress-track"><span style={{ width: `${selectedProject.progress}%` }}/></div></div>
          <section className="workspace-board">{columns.map(column => { const items = projectTasks.filter(task => task.status === column.status); return <div className="workspace-column" key={column.status} onDragOver={event => event.preventDefault()} onDrop={event => drop(event, selectedProject.id, column.status)}><header><span><CircleDot size={14}/>{column.label}</span><strong>{items.length}</strong></header><div className="workspace-cards">{items.map(task => <TaskCard key={task.id} task={task} onDragStart={() => setDraggingId(task.id)} onEdit={() => openTask(task)} onToggle={() => void toggle(task)} onDelete={() => setDeleteTask(task)}/>)}{items.length === 0 ? <div className="workspace-drop-hint">Arraste uma tarefa para cá</div> : null}</div><button className="workspace-add-task" onClick={() => openTask(undefined, selectedProject.id)}><Plus size={14}/> Adicionar tarefa</button></div>; })}</section>
        </> : <InboxWorkspace tasks={inboxTasks} projects={projects} onDragStart={setDraggingId} onEdit={openTask} onDelete={setDeleteTask} onCreate={() => openTask(undefined, null)} onDrop={(event) => drop(event, null)}/>} 
      </main>
    </section>

    <EntityDrawer open={drawer === "project"} onClose={() => setDrawer(null)} eyebrow={editingProjectId ? "Editar workspace" : "Novo workspace"} title={editingProjectId ? projectForm.name : "Crie um novo workspace"} footer={<><button className="secondary-button" onClick={() => setDrawer(null)}>Cancelar</button><button className="primary-button" form="project-editor-form" disabled={saving}>{saving ? "Salvando…" : "Salvar workspace"}</button></>}><form id="project-editor-form" className="entity-form" onSubmit={saveProject}><label className="field field-wide"><span>Nome</span><input autoFocus required value={projectForm.name} onChange={e => setProjectForm(v => ({...v,name:e.target.value}))}/></label><div className="form-grid"><label className="field"><span>Área</span><input value={projectForm.area} onChange={e => setProjectForm(v => ({...v,area:e.target.value}))}/></label><label className="field"><span>Prazo</span><input type="date" value={projectForm.deadline ?? ""} onChange={e => setProjectForm(v => ({...v,deadline:e.target.value || null}))}/></label><label className="field"><span>Ícone</span><select value={projectForm.icon} onChange={e => setProjectForm(v => ({...v,icon:e.target.value}))}>{projectIconOptions.map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label></div><label className="field field-wide"><span>Descrição</span><textarea rows={7} value={projectForm.description} onChange={e => setProjectForm(v => ({...v,description:e.target.value}))}/></label></form></EntityDrawer>

    <EntityDrawer open={drawer === "task"} onClose={() => setDrawer(null)} eyebrow={editingTaskId ? "Editar tarefa" : "Nova tarefa"} title={editingTaskId ? taskForm.title : "Adicionar ao fluxo"} footer={<><button className="secondary-button" onClick={() => setDrawer(null)}>Cancelar</button><button className="primary-button" form="workspace-task-form" disabled={saving}>{saving ? "Salvando…" : "Salvar tarefa"}</button></>}><form id="workspace-task-form" className="entity-form" onSubmit={saveTask}><label className="field field-wide"><span>Título</span><input autoFocus required value={taskForm.title} onChange={e => setTaskForm(v => ({...v,title:e.target.value}))}/></label><div className="form-grid"><label className="field"><span>Workspace</span><select value={taskForm.projectId ?? ""} onChange={e => setTaskForm(v => ({...v,projectId:e.target.value || null,status:e.target.value ? (v.status === "Inbox" ? "Próxima" : v.status) : "Inbox"}))}><option value="">Inbox</option>{projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label><label className="field"><span>Status</span><select value={taskForm.status} onChange={e => setTaskForm(v => ({...v,status:e.target.value as TaskStatus}))}>{["Inbox","Próxima","Em andamento","Concluída"].map(v => <option key={v}>{v}</option>)}</select></label><label className="field"><span>Prioridade</span><select value={taskForm.priority} onChange={e => setTaskForm(v => ({...v,priority:e.target.value}))}><option>Alta</option><option>Média</option><option>Baixa</option></select></label><label className="field"><span>Duração (min)</span><input type="number" min="5" step="5" value={taskForm.durationMinutes} onChange={e => setTaskForm(v => ({...v,durationMinutes:Number(e.target.value)}))}/></label><label className="field"><span>Data</span><input type="date" value={taskForm.dueDate ?? ""} onChange={e => setTaskForm(v => ({...v,dueDate:e.target.value || null}))}/></label></div></form></EntityDrawer>
    <ConfirmDialog open={Boolean(deleteProject)} title="Arquivar workspace?" description={`“${deleteProject?.name ?? ""}” será removido da navegação principal.`} onCancel={() => setDeleteProject(null)} onConfirm={() => void removeProject()} busy={saving}/>
    <ConfirmDialog open={Boolean(deleteTask)} title="Excluir tarefa?" description={`“${deleteTask?.title ?? ""}” será removida permanentemente.`} onCancel={() => setDeleteTask(null)} onConfirm={() => void removeTask()} busy={saving}/>
  </>;
}

function TaskCard({ task, onDragStart, onEdit, onToggle, onDelete }: { task: Task; onDragStart: () => void; onEdit: () => void; onToggle: () => void; onDelete: () => void }) {
  return <article className={`workspace-task-card ${task.status === "Concluída" ? "completed" : ""}`} draggable onDragStart={event => { event.dataTransfer.setData("text/task-id", task.id); event.dataTransfer.effectAllowed = "move"; onDragStart(); }} onDoubleClick={onEdit}><div className="workspace-task-top"><button className="task-check" onClick={onToggle}>{task.status === "Concluída" ? <Check size={14}/> : null}</button><button className="workspace-task-copy" onClick={onEdit}><strong>{task.title}</strong><span>{task.context} · {task.duration}</span></button><button className="icon-button ghost danger-icon workspace-task-delete" onClick={onDelete}><Trash2 size={14}/></button></div><footer><span className={`priority-dot priority-${task.priority.toLowerCase()}`}/><span>{task.priority}</span>{task.dueDate ? <span><CalendarDays size={12}/>{new Date(`${task.dueDate}T12:00:00`).toLocaleDateString("pt-BR")}</span> : null}</footer></article>;
}

function WorkspaceRailSkeleton() {
  return <>{Array.from({ length: 3 }).map((_, index) => <div className="workspace-project" key={index} aria-hidden="true">
    <Skeleton width={34} height={34} radius="9px"/>
    <span style={{ display: "grid", gap: 4 }}><Skeleton width="70%" height={13}/><Skeleton width="40%" height={10}/></span>
  </div>)}</>;
}

function InboxWorkspace({ tasks, projects, onDragStart, onEdit, onDelete, onCreate, onDrop }: { tasks: Task[]; projects: Project[]; onDragStart: (id:string)=>void; onEdit:(task?:Task,projectId?:string|null)=>void; onDelete:(task:Task)=>void; onCreate:()=>void; onDrop:(event:DragEvent)=>void }) {
  return <div className="inbox-workspace" onDragOver={event => event.preventDefault()} onDrop={onDrop}><header className="workspace-hero"><div className="workspace-title"><span className="workspace-large-icon"><Inbox size={24}/></span><div><span className="eyebrow small">Captura rápida</span><h2>Inbox</h2><p>Tarefas ainda sem projeto. Arraste cada uma para um workspace na barra lateral.</p></div></div><button className="primary-button" onClick={onCreate}><Plus size={15}/> Nova tarefa</button></header><div className="inbox-task-list">{tasks.map(task => <article key={task.id} className="inbox-task-row" draggable onDragStart={event => {event.dataTransfer.setData("text/task-id",task.id);onDragStart(task.id)}}><button className="workspace-task-copy" onClick={() => onEdit(task)}><strong>{task.title}</strong><span>{task.context} · {task.priority} · {task.duration}</span></button><div className="inbox-project-buttons">{projects.slice(0,3).map(project => <span key={project.id}><ProjectIcon name={project.icon} size={12}/> {project.name}</span>)}</div><button className="icon-button ghost" onClick={() => onEdit(task)}><Pencil size={15}/></button><button className="icon-button ghost danger-icon" onClick={() => onDelete(task)}><Trash2 size={15}/></button></article>)}{tasks.length === 0 ? <div className="empty-state"><LayoutGrid size={28}/><strong>Inbox organizada</strong><p>Crie uma tarefa ou arraste uma tarefa de volta para cá.</p></div> : null}</div></div>;
}
