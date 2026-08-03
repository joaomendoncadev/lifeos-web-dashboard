import { CalendarBlock } from "./types";
export function hasCalendarConflict(blocks: CalendarBlock[], startAt: string, endAt: string, ignoreId?: string): boolean {
  const start = new Date(startAt).getTime(); const end = new Date(endAt).getTime();
  return blocks.some(item => item.id !== ignoreId && item.lifecycleStatus !== "CANCELLED" && start < new Date(item.endAt).getTime() && end > new Date(item.startAt).getTime());
}
export function durationMinutes(startAt: string, endAt: string): number { return Math.max(0, Math.round((new Date(endAt).getTime()-new Date(startAt).getTime())/60000)); }
