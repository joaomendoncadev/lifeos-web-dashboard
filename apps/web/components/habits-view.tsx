"use client";

import { Check, Flame, Pencil, Plus, Trash2 } from "lucide-react";
import { HabitIcon, habitIconOptions } from "./habit-icon";
import { FormEvent, useCallback, useMemo, useState } from "react";
import { lifeosApi } from "@/lib/api";
import { Habit, HabitInput } from "@/lib/types";
import { useResource } from "@/lib/use-resource";
import { SyncState } from "./sync-state";
import { EntityDrawer } from "./entity-drawer";
import { ConfirmDialog } from "./confirm-dialog";
import { useToast } from "./toast-provider";

const emptyForm: HabitInput = { name: "", description: "", frequency: "Diário", icon: "Check" };

export function HabitsView() {
  const loader = useCallback(() => lifeosApi.habits(), []);
  const { data: items, setData: setItems, loading, source, warning, error, reload } = useResource(loader, [] as Habit[]);
  const [form, setForm] = useState<HabitInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Habit | null>(null);
  const [saving, setSaving] = useState(false);
  const { notify } = useToast();
  const completed = useMemo(() => items.filter((item) => item.done).length, [items]);
  const editingHabit = items.find(item => item.id === editingId) ?? null;

  function openCreate() { setEditingId(null); setForm(emptyForm); setDrawerOpen(true); }
  function openEdit(habit: Habit) {
    setEditingId(habit.id);
    setForm({ name: habit.name, description: habit.description, frequency: habit.frequency, icon: habit.icon });
    setDrawerOpen(true);
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!form.name.trim()) { notify("Informe o nome do hábito.", "error"); return; }
    setSaving(true);
    try {
      const response = editingId ? await lifeosApi.updateHabit(editingId, form) : await lifeosApi.createHabit(form);
      setItems(current => editingId ? current.map(item => item.id === editingId ? response.data : item) : [...current, response.data].sort((a,b) => a.name.localeCompare(b.name)));
      setDrawerOpen(false);
      notify(editingId ? "Hábito atualizado." : "Hábito criado.");
    } catch (reason) { notify(reason instanceof Error ? reason.message : "Falha ao salvar hábito.", "error"); }
    finally { setSaving(false); }
  }

  async function toggle(habit: Habit) {
    const done = !habit.done;
    setItems(current => current.map(item => item.id === habit.id ? { ...item, done, streak: Math.max(0, item.streak + (done ? 1 : -1)) } : item));
    try { await lifeosApi.logHabit(habit.id, done); notify(done ? "Hábito concluído hoje." : "Check-in removido."); }
    catch (reason) { notify(reason instanceof Error ? reason.message : "Falha ao registrar hábito.", "error"); await reload(); }
  }

  async function remove() {
    if (!deleteTarget) return;
    setSaving(true);
    try { await lifeosApi.deleteHabit(deleteTarget.id); setItems(current => current.filter(item => item.id !== deleteTarget.id)); setDeleteTarget(null); notify("Hábito arquivado."); }
    catch (reason) { notify(reason instanceof Error ? reason.message : "Falha ao arquivar hábito.", "error"); }
    finally { setSaving(false); }
  }

  return <>
    <div className="resource-header"><SyncState loading={loading} source={source} warning={warning} error={error} onRetry={reload} /><button className="primary-button" onClick={openCreate}><Plus size={16}/> Novo hábito</button></div>
    <section className="habit-summary panel"><div><span className="eyebrow small">Consistência diária</span><h2>{completed} de {items.length} concluídos hoje</h2><p>Continue pequeno, mas continue.</p></div><div className="streak"><Flame size={26} /><strong>{Math.max(...items.map(item => item.streak), 0)}</strong><span>melhor sequência</span></div></section>
    {!loading && items.length === 0 ? <div className="empty-state panel"><strong>Nenhum hábito criado</strong><p>Comece com uma rotina simples que você consiga repetir todos os dias.</p><button className="primary-button" onClick={openCreate}><Plus size={16}/> Criar primeiro hábito</button></div> : null}
    <section className="habit-cards">{items.map(habit => <article key={habit.id} className={`habit-card ${habit.done ? "done" : ""}`} onDoubleClick={() => openEdit(habit)}>
      <button className="habit-toggle" onClick={() => void toggle(habit)} aria-label={`Marcar ${habit.name}`}>
        <div className="habit-card-top"><span className="habit-symbol"><HabitIcon name={habit.icon} /></span><span className="task-check">{habit.done ? <Check size={15} /> : null}</span></div>
        <div><strong>{habit.name}</strong><p>{habit.description || "Sem descrição."}</p></div><footer><span>{habit.frequency}</span><strong>{habit.streak} dias</strong></footer>
      </button>
      <div className="habit-actions"><button className="icon-button ghost" onClick={() => openEdit(habit)} title="Editar"><Pencil size={15}/></button><button className="icon-button ghost danger-icon" onClick={() => setDeleteTarget(habit)} title="Arquivar"><Trash2 size={15}/></button></div>
    </article>)}</section>

    <EntityDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} eyebrow={editingHabit ? "Editar hábito" : "Novo hábito"} title={editingHabit?.name || "Construa uma rotina sustentável"} footer={<><button className="secondary-button" onClick={() => setDrawerOpen(false)}>Cancelar</button><button className="primary-button" form="habit-editor-form" disabled={saving}>{saving ? "Salvando…" : editingId ? "Salvar alterações" : "Criar hábito"}</button></>}>
      <form id="habit-editor-form" className="entity-form" onSubmit={save}>
        <label className="field field-wide"><span>Nome</span><input autoFocus value={form.name} onChange={e => setForm({...form,name:e.target.value})} placeholder="Ex.: Treinar, estudar inglês, beber água"/></label>
        <label className="field field-wide"><span>Descrição</span><textarea rows={4} value={form.description ?? ""} onChange={e => setForm({...form,description:e.target.value})} placeholder="Qual comportamento você quer repetir?"/></label>
        <div className="form-grid">
          <label className="field"><span>Ícone</span><select value={form.icon ?? "Check"} onChange={e => setForm({...form,icon:e.target.value})}>{habitIconOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
          <label className="field"><span>Frequência</span><select value={form.frequency ?? "Diário"} onChange={e => setForm({...form,frequency:e.target.value})}><option>Diário</option><option>Dias úteis</option><option>Semanal</option><option>3x por semana</option><option>4x por semana</option><option>Mensal</option></select></label>
        </div>
        <div className="drawer-tip"><strong>Dica</strong><span>Hábitos específicos e fáceis de medir tendem a ser mais consistentes.</span></div>
      </form>
    </EntityDrawer>
    <ConfirmDialog open={Boolean(deleteTarget)} title="Arquivar hábito?" description={`“${deleteTarget?.name ?? ""}” sairá da sua rotina ativa, mas o histórico será preservado.`} confirmLabel="Arquivar" onCancel={() => setDeleteTarget(null)} onConfirm={() => void remove()} busy={saving}/>
  </>;
}
