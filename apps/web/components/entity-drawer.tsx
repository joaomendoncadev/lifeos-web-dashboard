"use client";

import { X } from "lucide-react";
import { ReactNode, useEffect } from "react";

export function EntityDrawer({ open, title, eyebrow, children, footer, onClose }: {
  open: boolean;
  title: string;
  eyebrow?: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const close = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", close);
    return () => { document.body.style.overflow = previous; window.removeEventListener("keydown", close); };
  }, [open, onClose]);

  if (!open) return null;
  return <div className="drawer-layer" role="dialog" aria-modal="true" aria-label={title}>
    <button className="drawer-backdrop" aria-label="Fechar painel" onClick={onClose}/>
    <aside className="entity-drawer">
      <header className="drawer-header">
        <div>{eyebrow ? <span>{eyebrow}</span> : null}<h2>{title}</h2></div>
        <button className="icon-button ghost" onClick={onClose} aria-label="Fechar"><X size={20}/></button>
      </header>
      <div className="drawer-content">{children}</div>
      {footer ? <footer className="drawer-footer">{footer}</footer> : null}
    </aside>
  </div>;
}
