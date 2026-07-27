"use client";

import { CheckCircle2, Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { lifeosApi } from "@/lib/api";
import { FocusSession as FocusSessionType } from "@/lib/types";

const DEFAULT_MINUTES = 25;

export function FocusSession() {
  const [plannedMinutes, setPlannedMinutes] = useState(DEFAULT_MINUTES);
  const [seconds, setSeconds] = useState(DEFAULT_MINUTES * 60);
  const [running, setRunning] = useState(false);
  const [title, setTitle] = useState("Definir a próxima ação importante");
  const [activeSession, setActiveSession] = useState<FocusSessionType | null>(null);
  const [history, setHistory] = useState<FocusSessionType[]>([]);
  const [message, setMessage] = useState<string>();

  useEffect(() => { void lifeosApi.focusSessions().then(r => setHistory(r.data)).catch(() => undefined); }, []);
  useEffect(() => {
    if (!running || seconds <= 0) return;
    const timer = window.setInterval(() => setSeconds((value) => value - 1), 1000);
    return () => window.clearInterval(timer);
  }, [running, seconds]);
  useEffect(() => { if (seconds === 0 && activeSession) void complete(); }, [seconds]); // eslint-disable-line react-hooks/exhaustive-deps

  async function toggle() {
    setMessage(undefined);
    if (!activeSession) {
      try {
        const result = await lifeosApi.startFocusSession({ title, plannedMinutes });
        setActiveSession(result.data);
        setRunning(true);
      } catch (error) { setMessage(error instanceof Error ? error.message : "Falha ao iniciar a sessão."); }
      return;
    }
    setRunning(value => !value);
  }

  async function complete() {
    if (!activeSession) return;
    setRunning(false);
    const elapsed = Math.max(1, Math.ceil((plannedMinutes * 60 - seconds) / 60));
    try {
      const result = await lifeosApi.completeFocusSession(activeSession.id, elapsed);
      setHistory(current => [result.data, ...current.filter(item => item.id !== result.data.id)]);
      setActiveSession(null);
      setSeconds(plannedMinutes * 60);
      setMessage(`Sessão concluída: ${elapsed} min de foco.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Falha ao concluir a sessão."); }
  }

  function reset() { setRunning(false); setActiveSession(null); setSeconds(plannedMinutes * 60); setMessage(undefined); }
  function changeMinutes(value: number) { if (activeSession) return; setPlannedMinutes(value); setSeconds(value * 60); }

  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remaining = (seconds % 60).toString().padStart(2, "0");
  const totalSeconds = plannedMinutes * 60;
  const progress = ((totalSeconds - seconds) / totalSeconds) * 100;

  return <div className="focus-layout">
    <section className="focus-card">
      <span className="eyebrow">SESSÃO DE FOCO</span>
      <input className="focus-title-input" value={title} onChange={e => setTitle(e.target.value)} disabled={Boolean(activeSession)} aria-label="Objetivo da sessão" />
      <div className="duration-pills">{[15,25,45,60].map(value => <button key={value} className={plannedMinutes === value ? "active" : ""} onClick={() => changeMinutes(value)} disabled={Boolean(activeSession)}>{value} min</button>)}</div>
      <div className="timer-ring" style={{ "--timer-progress": `${progress * 3.6}deg` } as CSSProperties}>
        <div><strong>{minutes}:{remaining}</strong><span>tempo restante</span></div>
      </div>
      <div className="focus-actions">
        <button className="secondary-button" onClick={reset}><RotateCcw size={17}/> Reiniciar</button>
        <button className="primary-button" onClick={toggle}><>{running ? <Pause size={18}/> : <Play size={18}/>} {running ? "Pausar" : activeSession ? "Continuar" : "Começar"}</></button>
        {activeSession && <button className="secondary-button" onClick={complete}><CheckCircle2 size={17}/> Concluir</button>}
      </div>
      {message && <p className="success-message">{message}</p>}
    </section>
    <section className="panel focus-history"><div className="panel-header"><div><span>Histórico</span><h3>Sessões recentes</h3></div></div>{history.length ? history.slice(0,8).map(item => <article className="history-row" key={item.id}><div><strong>{item.title}</strong><span>{new Date(item.startedAt).toLocaleDateString("pt-BR")}</span></div><em>{item.completed ? `${item.actualMinutes} min` : "não concluída"}</em></article>) : <p className="muted">Nenhuma sessão registrada ainda.</p>}</section>
  </div>;
}
