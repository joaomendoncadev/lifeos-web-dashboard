import {
  Briefcase,
  BriefcaseBusiness,
  CircleDot,
  Dumbbell,
  Globe2,
  GraduationCap,
  HeartPulse,
  Landmark,
  LayoutGrid,
  Plane,
  Rocket,
  Sparkles,
  Target,
  Wallet,
  WalletCards,
} from "lucide-react";

const icons = {
  Rocket,
  Plane,
  Briefcase,
  BriefcaseBusiness,
  HeartPulse,
  Wallet,
  WalletCards,
  GraduationCap,
  LayoutGrid,
  Sparkles,
  Globe2,
  Target,
  Landmark,
  Dumbbell,
  CircleDot,
} as const;

export function ProjectIcon({ name, size = 18 }: { name?: string | null; size?: number }) {
  const normalized = name?.trim();
  if (!normalized) return <CircleDot size={size} aria-hidden="true" />;
  const Icon = icons[normalized as keyof typeof icons];
  if (Icon) return <Icon size={size} strokeWidth={1.9} aria-hidden="true" />;
  if (Array.from(normalized).length <= 3) return <span aria-hidden="true">{normalized}</span>;
  return <CircleDot size={size} aria-hidden="true" />;
}

export const projectIconOptions = [
  ["Rocket", "Foguete"],
  ["Plane", "Avião"],
  ["BriefcaseBusiness", "Carreira"],
  ["HeartPulse", "Saúde"],
  ["WalletCards", "Finanças"],
  ["GraduationCap", "Estudos"],
  ["LayoutGrid", "Geral"],
  ["Sparkles", "Pessoal"],
  ["Globe2", "Viagens"],
  ["Target", "Meta"],
  ["Landmark", "Patrimônio"],
  ["Dumbbell", "Treino"],
] as const;
