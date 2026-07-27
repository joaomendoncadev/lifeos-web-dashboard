"use client";
import type { ReactNode } from "react";
import { Sidebar } from "@/components/sidebar";
import { CommandPalette } from "@/components/command-palette";
import { ToastProvider } from "@/components/toast-provider";
import { QuickCapture } from "@/components/quick-capture";

export function AppShell({ children }: { children: ReactNode }) {
  return <ToastProvider><a className="skip-link" href="#main-content">Pular para o conteúdo</a><div className="app-shell"><Sidebar/><main id="main-content" className="app-content">{children}</main></div><CommandPalette/><QuickCapture/></ToastProvider>;
}
