import {
  BookOpen,
  Brain,
  Check,
  Dumbbell,
  Footprints,
  HeartPulse,
  ListChecks,
  Moon,
  Sparkles,
  Sun,
  Droplets,
  type LucideIcon,
} from "lucide-react";

const icons: Record<string, LucideIcon> = {
  BookOpen,
  Brain,
  Check,
  Dumbbell,
  Footprints,
  HeartPulse,
  ListChecks,
  Moon,
  Sparkles,
  Sun,
  Droplets,
};

export const habitIconOptions = [
  { value: "Check", label: "Concluir" },
  { value: "Dumbbell", label: "Treino" },
  { value: "BookOpen", label: "Estudo" },
  { value: "ListChecks", label: "Planejamento" },
  { value: "HeartPulse", label: "Saúde" },
  { value: "Droplets", label: "Água" },
  { value: "Moon", label: "Sono" },
  { value: "Footprints", label: "Caminhada" },
  { value: "Brain", label: "Mente" },
  { value: "Sun", label: "Manhã" },
  { value: "Sparkles", label: "Outro" },
] as const;

export function HabitIcon({ name, size = 22 }: { name?: string; size?: number }) {
  const normalized = name?.trim() || "Check";
  const Icon = icons[normalized];

  if (Icon) {
    return <Icon size={size} strokeWidth={2} aria-hidden="true" />;
  }

  // Mantém compatibilidade com hábitos antigos que já tenham um emoji salvo.
  const looksLikeEmoji = normalized.length <= 8 && !/^[A-Za-z][A-Za-z0-9_-]*$/.test(normalized);
  if (looksLikeEmoji) {
    return <span className="habit-emoji" aria-hidden="true">{normalized}</span>;
  }

  return <Sparkles size={size} strokeWidth={2} aria-hidden="true" />;
}
