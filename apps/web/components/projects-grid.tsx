"use client";

import { CalendarDays, ListChecks, Pencil, Plus, Trash2 } from "lucide-react";
import { FormEvent, useCallback, useState } from "react";
import { lifeosApi } from "@/lib/api";
import { Project } from "@/lib/types";
import { useResource } from "@/lib/use-resource";
import { SyncState } from "./sync-state";

const initial: Project[] = [];
export function ProjectsGrid() {
  const loader = useCallback(() => lifeosApi.projects(), []);
  const { data, setData, loading, source, warning, error, reload } = useResource(loader, initial);
  const [name, setName] = useState("");
  const [area, setArea] = useState("Pessoal");
  const [message, setMessage] = useState<string>();

  async function create(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    try { const result = await lifeosApi.createProject({ name: name.trim(), area, description: "Novo projeto" }); setData(current => [...current, result.data]); setName(""); setMessage("Projeto criado."); }
    catch (reason) { setMessage(reason instanceof Error ? reason.message : "Falha ao criar projeto."); }
  }

  async function edit(project: Project) {
    const newName = window.prompt("Nome do projeto", project.name)?.trim(); if (!newName) return;
    const newArea = window.prompt("Área", project.area)?.trim() || project.area;
    const description = window.prompt("Descrição", project.description)?.trim() ?? project.description;
    const deadline = window.prompt("Prazo (AAAA-MM-DD) ou vazio", project.deadlineDate ?? "")?.trim() || null;
    try { const result = await lifeosApi.updateProject(project.id, { name: newName, area: newArea, description, deadline, icon: project.icon }); setData(current => current.map(item => item.id === project.id ? result.data : item)); setMessage("Projeto atualizado."); }
    catch (reason) { setMessage(reason instanceof Error ? reason.message : "Falha ao atualizar projeto."); }
  }

  async function remove(project: Project) {
    if (!window.confirm(`Excluir “${project.name}”? As tarefas irão para a Inbox.`)) return;
    try { await lifeosApi.deleteProject(project.id); setData(current => current.filter(item => item.id !== project.id)); setMessage("Projeto excluído."); }
    catch (reason) { setMessage(reason instanceof Error ? reason.message : "Falha ao excluir projeto."); }
  }

  return <>
    <div className="resource-header"><SyncState loading={loading} source={source} warning={warning} error={error} onRetry={reload}/></div>
    <form className="project-create panel" onSubmit={create}><Plus size={18}/><input value={name} onChange={event => setName(event.target.value)} placeholder="Nome do novo projeto"/><input value={area} onChange={event => setArea(event.target.value)} placeholder="Área"/><button>Criar projeto</button></form>
    {message ? <p className="inline-message">{message}</p> : null}
    <section className="project-cards">{data.map(project => <article className="project-card panel" key={project.id}>
      <header><span className="project-icon">{project.icon}</span><div className="row-actions"><button className="icon-button ghost" onClick={() => void edit(project)}><Pencil size={17}/></button><button className="icon-button ghost danger-icon" onClick={() => void remove(project)}><Trash2 size={17}/></button></div></header>
      <div><span className="eyebrow small">{project.area}</span><h2>{project.name}</h2><p>{project.description}</p></div>
      <div className="progress-track"><span style={{width:`${project.progress}%`}}/></div>
      <footer><strong>{project.progress}%</strong><span><ListChecks size={14}/> {project.tasks} tarefas</span><span><CalendarDays size={14}/> {project.deadline}</span></footer>
    </article>)}</section>
  </>;
}
