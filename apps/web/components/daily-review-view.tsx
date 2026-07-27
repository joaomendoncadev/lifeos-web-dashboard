"use client";

import { Save, Sparkles } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { lifeosApi } from "@/lib/api";
import { DailyReview } from "@/lib/types";
import { PageHeader } from "./page-header";
import { SyncState } from "./sync-state";

const today = new Date().toISOString().slice(0, 10);
const empty: DailyReview = { reviewDate: today, wins: "", blockers: "", tomorrow: "", mood: 3 };

export function DailyReviewView() {
  const [review, setReview] = useState<DailyReview>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string>();

  const load = useCallback(async () => {
    setLoading(true);
    setMessage(undefined);
    try {
      const result = await lifeosApi.reviewToday();
      setReview(result.data ?? empty);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Falha ao carregar a revisão.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function save() {
    setSaving(true); setMessage(undefined);
    try {
      const result = await lifeosApi.saveReviewToday(review);
      setReview(result.data);
      setMessage("Revisão salva no PostgreSQL.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Falha ao salvar."); }
    finally { setSaving(false); }
  }

  return <main className="main-content">
    <PageHeader eyebrow="ENCERRAMENTO DO DIA" title="Revisão diária" subtitle="Registre aprendizados e prepare o próximo dia sem deixar decisões soltas." />
    <div className="resource-header"><SyncState loading={loading} source="api" error={message?.startsWith("Falha") ? message : undefined} onRetry={load}/></div>
    <section className="review-grid">
      <article className="panel review-main">
        <label className="field-label">Como foi seu dia?</label>
        <div className="mood-picker">{[1,2,3,4,5].map(value => <button key={value} className={review.mood === value ? "active" : ""} onClick={() => setReview({...review, mood:value})}>{["😞","😕","😐","🙂","🤩"][value-1]}</button>)}</div>
        <label className="field-label">Vitórias e avanços</label>
        <textarea value={review.wins} onChange={e => setReview({...review, wins:e.target.value})} placeholder="O que funcionou bem hoje?" />
        <label className="field-label">Bloqueios e pontos de atenção</label>
        <textarea value={review.blockers} onChange={e => setReview({...review, blockers:e.target.value})} placeholder="O que te atrasou ou drenou energia?" />
        <label className="field-label">Prioridades de amanhã</label>
        <textarea value={review.tomorrow} onChange={e => setReview({...review, tomorrow:e.target.value})} placeholder="Quais são as 1–3 ações mais importantes?" />
        <button className="primary-button" onClick={save} disabled={saving}><Save size={17}/>{saving ? "Salvando..." : "Salvar revisão"}</button>
        {message && !message.startsWith("Falha") && <p className="success-message">{message}</p>}
      </article>
      <aside className="panel review-tip"><Sparkles size={28}/><h3>Feche os ciclos</h3><p>Uma revisão curta reduz a ansiedade e deixa o começo do próximo dia mais objetivo.</p><ul><li>Reconheça o que avançou.</li><li>Registre bloqueios sem julgamento.</li><li>Escolha poucas prioridades reais.</li></ul></aside>
    </section>
  </main>;
}
