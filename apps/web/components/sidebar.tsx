"use client";

import { Brain, BriefcaseBusiness, CalendarDays, CheckSquare2, ClipboardCheck, CircleUserRound, HeartPulse, Home, Plane, Target, Zap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

const items = [
  { label: "Hoje", icon: Home, href: "/" },
  { label: "Tarefas", icon: CheckSquare2, href: "/tasks" },
  { label: "Projetos", icon: BriefcaseBusiness, href: "/projects" },
  { label: "Hábitos", icon: HeartPulse, href: "/habits" },
  { label: "Foco", icon: Zap, href: "/focus" },
  { label: "Metas", icon: Target, href: "/goals" },
  { label: "Revisão diária", icon: ClipboardCheck, href: "/review" },
  { label: "Revisão semanal", icon: ClipboardCheck, href: "/weekly-review" },
  { label: "Agenda", icon: CalendarDays, href: "/agenda" },
  { label: "Viagens", icon: Plane, href: "/trips" },
  { label: "Second Brain", icon: Brain, href: "/brain" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="brand"><span>◉</span><strong>LifeOS</strong></div>
        <ThemeToggle />
      </div>
      <nav>
        {items.map(({ label, icon: Icon, href }) => {
          const active = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
          return (
          <Link aria-current={active ? "page" : undefined} className={`nav-item ${active ? "active" : ""}`} href={href} key={label}>
            <Icon size={18} strokeWidth={1.9} />
            <span>{label}</span>
          </Link>
          );
        })}
      </nav>
      <div className="profile">
        <CircleUserRound size={32} />
        <div><strong>João</strong><span>Workspace pessoal</span></div>
      </div>
    </aside>
  );
}
