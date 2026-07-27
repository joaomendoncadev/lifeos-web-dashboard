"use client";

import { Plus } from "lucide-react";
import { useCallback, useState } from "react";
import { lifeosApi } from "@/lib/api";
import type { WorkspaceTemplate } from "@/lib/types";
import { useResource } from "@/lib/use-resource";
import { EntityDrawer } from "./entity-drawer";
import { ProjectIcon } from "./project-icon";
import { useToast } from "./toast-provider";

export function WorkspaceTemplatePicker() {
  const loader = useCallback(() => lifeosApi.workspaceTemplates(), []);
  const { data: templates } = useResource(loader, [] as WorkspaceTemplate[]);
  const [selected, setSelected] = useState<WorkspaceTemplate | null>(null);
  const [name, setName] = useState(""); const [description, setDescription] = useState(""); const [saving, setSaving] = useState(false);
  const { notify } = useToast();

  async function create() {
    if (!selected || !name.trim()) return;
    setSaving(true);
    try {
      await lifeosApi.createProject({ name, description, area: "Pessoal", type: selected.type, icon: selected.icon, color: selected.color, metadata: selected.defaultMetadata }, selected.code);
      notify("Workspace criado a partir do template."); setSelected(null); setName(""); setDescription("");
      window.dispatchEvent(new Event("lifeos:data-changed"));
      window.location.reload();
    } catch (reason) { notify(reason instanceof Error ? reason.message : "Não foi possível criar o workspace.", "error"); }
    finally { setSaving(false); }
  }

  return <>
    <section className="template-strip panel"><div className="template-strip-copy"><span className="eyebrow">TEMPLATES</span><h3>Comece com a estrutura certa</h3><p>O tipo define o contexto inicial; tarefas e conhecimento continuam compartilhando a mesma fundação.</p></div><div className="template-cards">{templates.map(template => <button key={template.id} onClick={() => { setSelected(template); setName(""); setDescription(""); }}><span className={`template-icon color-${template.color}`}><ProjectIcon name={template.icon}/></span><strong>{template.name}</strong><small>{template.description}</small><em><Plus size={13}/> Criar</em></button>)}</div></section>
    <EntityDrawer open={Boolean(selected)} onClose={() => setSelected(null)} eyebrow="Novo workspace" title={selected?.name ?? "Template"} footer={<><button className="secondary-button" onClick={() => setSelected(null)}>Cancelar</button><button className="primary-button" disabled={saving || !name.trim()} onClick={() => void create()}>{saving ? "Criando…" : "Criar workspace"}</button></>}>
      <div className="template-drawer-intro"><span className={`template-icon color-${selected?.color ?? "gray"}`}><ProjectIcon name={selected?.icon ?? "LayoutGrid"} size={22}/></span><p>{selected?.description}</p></div>
      <div className="entity-form"><label className="field field-wide"><span>Nome</span><input autoFocus value={name} onChange={e => setName(e.target.value)}/></label><label className="field field-wide"><span>Descrição</span><textarea rows={6} value={description} onChange={e => setDescription(e.target.value)}/></label></div>
    </EntityDrawer>
  </>;
}
