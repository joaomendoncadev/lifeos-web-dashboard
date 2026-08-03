"use client";

import { BarChart3, Brain, CalendarDays, Repeat2, CircleUserRound, Home, Inbox, LayoutGrid, Settings, Sun, CalendarRange } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

const primary = [
  { label: "Home", icon: Home, href: "/" },
  { label: "Inbox", icon: Inbox, href: "/inbox" },
  { label: "Hoje", icon: Sun, href: "/today" },
  { label: "Próximos", icon: CalendarRange, href: "/upcoming" },
];
const system = [
  { label: "Workspaces", icon: LayoutGrid, href: "/workspaces" },
  { label: "Knowledge", icon: Brain, href: "/brain" },
  { label: "Calendar", icon: CalendarDays, href: "/agenda" },
  { label: "Minha rotina", icon: Repeat2, href: "/routine" },
  { label: "Insights", icon: BarChart3, href: "/insights" },
  { label: "Configurações", icon: Settings, href: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const render = (items: typeof primary) => items.map(({ label, icon: Icon, href }) => {
    const active = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
    return <Link aria-current={active ? "page" : undefined} className={`nav-item ${active ? "active" : ""}`} href={href} key={label}><Icon size={18} strokeWidth={1.9}/><span>{label}</span></Link>;
  });
  return <aside className="sidebar">
    <div className="sidebar-top"><div className="brand"><span>◉</span><strong>LifeOS</strong></div><div className="sidebar-tools"><button className="command-trigger" onClick={() => window.dispatchEvent(new Event("lifeos:quick-capture"))} title="Captura rápida"><span>Q</span>+</button><button className="command-trigger" onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))} title="Abrir comandos"><span>⌘</span>K</button><ThemeToggle/></div></div>
    <nav className="sidebar-navigation"><div className="nav-section">{render(primary)}</div><div className="nav-divider"/><div className="nav-section">{render(system)}</div></nav>
    <div className="profile"><CircleUserRound size={32}/><div><strong>João</strong><span>Workspace pessoal</span></div></div>
  </aside>;
}
