import { describe, expect, it } from "vitest";
import { durationMinutes, hasCalendarConflict } from "../calendar-utils";
import type { CalendarBlock } from "../types";
const block=(overrides:Partial<CalendarBlock>={}):CalendarBlock=>({id:"1",title:"Trabalho",description:"",blockType:"ROUTINE",startAt:"2026-07-27T11:00:00.000Z",endAt:"2026-07-27T20:00:00.000Z",completed:false,lifecycleStatus:"PLANNED",domain:"WORK",...overrides});
describe("calendar-utils",()=>{it("detecta sobreposição",()=>expect(hasCalendarConflict([block()],"2026-07-27T19:00:00.000Z","2026-07-27T21:00:00.000Z")).toBe(true));it("ignora cancelados",()=>expect(hasCalendarConflict([block({lifecycleStatus:"CANCELLED"})],"2026-07-27T19:00:00.000Z","2026-07-27T21:00:00.000Z")).toBe(false));it("calcula duração",()=>expect(durationMinutes("2026-07-27T10:00:00.000Z","2026-07-27T11:30:00.000Z")).toBe(90));});
