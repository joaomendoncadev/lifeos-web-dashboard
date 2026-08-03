"use client";
import dynamic from "next/dynamic";

const AgendaView = dynamic(() => import("@/components/agenda-view").then(m => m.AgendaView), { ssr: false });

export default function AgendaPage(){ return <AgendaView/>; }
