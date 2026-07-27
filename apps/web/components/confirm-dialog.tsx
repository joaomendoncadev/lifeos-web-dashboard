"use client";
import { AlertTriangle } from "lucide-react";

export function ConfirmDialog({ open, title, description, confirmLabel = "Excluir", onCancel, onConfirm, busy = false }: {
  open: boolean; title: string; description: string; confirmLabel?: string; onCancel: () => void; onConfirm: () => void; busy?: boolean;
}) {
  if (!open) return null;
  return <div className="modal-layer" role="alertdialog" aria-modal="true">
    <button className="modal-backdrop" aria-label="Cancelar" onClick={onCancel}/>
    <section className="confirm-dialog">
      <div className="confirm-icon"><AlertTriangle size={22}/></div>
      <div><h3>{title}</h3><p>{description}</p></div>
      <footer><button className="secondary-button" onClick={onCancel}>Cancelar</button><button className="danger-button" disabled={busy} onClick={onConfirm}>{busy ? "Excluindo…" : confirmLabel}</button></footer>
    </section>
  </div>;
}
