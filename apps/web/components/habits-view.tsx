"use client";

import { Check, Flame, Pencil, Plus, Trash2 } from "lucide-react";
import { HabitIcon, habitIconOptions } from "./habit-icon";
import { FormEvent, useCallback, useMemo, useState } from "react";
import { lifeosApi } from "@/lib/api";
import { Habit, HabitInput } from "@/lib/types";
import { useResource } from "@/lib/use-resource";
import { SyncState } from "./sync-state";

const initial: Habit[] = [];
const emptyForm: HabitInput = { name: "", description: "", frequency: "Diário", icon: "Check" };

export function HabitsView() {
  const loader = useCallback(() => lifeosApi.habits(), []);
  const { data: items, setData: setItems, loading, source, warning, error, reload } = useResource(loader, initial);
  const [form, setForm] = useState<HabitInput>(emptyForm);
  const [editingId, setEditingId] = useState<string>();
  const [message, setMessage] = useState<string>();
  const completed = useMemo(() => items.filter((item) => item.done).length, [items]);

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!form.name.trim()) return;
    try {
      const response = editingId ? await lifeosApi.updateHabit(editingId, form) : await lifeosApi.createHabit(form);
      setItems((current) => editingId ? current.map((item) => item.id === editingId ? response.data : item) : [...current, response.data].sort((a,b) => a.name.localeCompare(b.name)));
      setForm(emptyForm); setEditingId(undefined); setMessage(undefined);
    } catch (reason) { setMessage(reason instanceof Error ? reason.message : "Falha ao salvar hábito."); }
  }

  async function toggle(habit: Habit) {
    const done = !habit.done;
    setItems((current) => current.map((item) => item.id === habit.id ? { ...item, done, streak: Math.max(0, item.streak + (done ? 1 : -1)) } : item));
    try { await lifeosApi.logHabit(habit.id, done); setMessage(undefined); }
    catch (reason) { setMessage(reason instanceof Error ? reason.message : "Falha ao registrar hábito."); await reload(); }
  }

  function edit(habit: Habit) {
    setEditingId(habit.id);
    setForm({ name: habit.name, description: habit.description, frequency: habit.frequency, icon: habit.icon });
  }

  async function remove(id: string) {
    if (!confirm("Arquivar este hábito?")) return;
    try { await lifeosApi.deleteHabit(id); setItems((current) => current.filter((item) => item.id !== id)); }
    catch (reason) { setMessage(reason instanceof Error ? reason.message : "Falha ao excluir hábito."); }
  }

  return <>
    <div className="resource-header"><SyncState loading={loading} source={source} warning={warning} error={error} onRetry={reload} /></div>
    <form className="habit-create" onSubmit={save}>
      <Plus size={18} />
      <select value={form.icon ?? "Check"} onChange={(e) => setForm({...form, icon:e.target.value})} aria-label="Ícone do hábito">
        {habitIconOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      <input value={form.name} onChange={(e) => setForm({...form, name:e.target.value})} placeholder="Novo hábito" />
      <input value={form.frequency ?? ""} onChange={(e) => setForm({...form, frequency:e.target.value})} placeholder="Frequência" />
      <button>{editingId ? "Salvar" : "Adicionar"}</button>
      {editingId ? <button type="button" className="secondary-button" onClick={() => {setEditingId(undefined);setForm(emptyForm);}}>Cancelar</button> : null}
    </form>
    {message ? <p className="inline-message">{message}</p> : null}
    <section className="habit-summary panel"><div><span className="eyebrow small">Consistência diária</span><h2>{completed} de {items.length} concluídos hoje</h2><p>Continue pequeno, mas continue.</p></div><div className="streak"><Flame size={26} /><strong>{Math.max(...items.map((item) => item.streak), 0)}</strong><span>melhor sequência</span></div></section>
    <section className="habit-cards">{items.map((habit) => <article key={habit.id} className={`habit-card ${habit.done ? "done" : ""}`}>
      <button className="habit-toggle" onClick={() => void toggle(habit)} aria-label={`Marcar ${habit.name}`}>
        <div className="habit-card-top"><span className="habit-symbol"><HabitIcon name={habit.icon} /></span><span className="task-check">{habit.done ? <Check size={15} /> : null}</span></div>
        <div><strong>{habit.name}</strong><p>{habit.description || "Sem descrição."}</p></div><footer><span>{habit.frequency}</span><strong>{habit.streak} dias</strong></footer>
      </button>
      <div className="habit-actions"><button onClick={() => edit(habit)}><Pencil size={15}/></button><button className="danger-icon" onClick={() => void remove(habit.id)}><Trash2 size={15}/></button></div>
    </article>)}</section>
  </>;
}
