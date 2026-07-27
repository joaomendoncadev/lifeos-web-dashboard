import { ApiResult, Area, CalendarBlock, CalendarBlockInput, DashboardSummary, DailyReview, FocusSession, Goal, GoalInput, Habit, HabitInput, Note, NoteInput, Project, ProjectInput, Tag, Task, TaskInput, TaskStatus, WeeklyReview, Trip, TripInput, TripDetails, ItineraryItem, Reservation, TravelDocument, TripChecklistItem, TripExpense } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8081/api/v1";

async function parse<T>(response: Response): Promise<T> {
  if (response.status === 204) return undefined as T;
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || body.error || "Falha na operação.");
  return body;
}

const result = <T>(promise: Promise<T>): Promise<ApiResult<T>> => promise.then((data) => ({ data, source: "api" }));
const json = { "Content-Type": "application/json" };

export const lifeosApi = {

  trips: () => result(fetch(`${API_URL}/trips`, { cache: "no-store" }).then((r) => parse<Trip[]>(r))),
  trip: (id: string) => result(fetch(`${API_URL}/trips/${id}`, { cache: "no-store" }).then((r) => parse<TripDetails>(r))),
  createTrip: (input: TripInput) => result(fetch(`${API_URL}/trips`, { method: "POST", headers: json, body: JSON.stringify(input) }).then((r) => parse<Trip>(r))),
  updateTrip: (id: string, input: TripInput) => result(fetch(`${API_URL}/trips/${id}`, { method: "PUT", headers: json, body: JSON.stringify(input) }).then((r) => parse<Trip>(r))),
  deleteTrip: (id: string) => fetch(`${API_URL}/trips/${id}`, { method: "DELETE" }).then((r) => parse<void>(r)),
  addItinerary: (tripId: string, input: Omit<ItineraryItem,"id"|"tripId">) => result(fetch(`${API_URL}/trips/${tripId}/itinerary`, { method:"POST", headers:json, body:JSON.stringify(input) }).then(r=>parse<ItineraryItem>(r))),
  toggleItinerary: (tripId:string,id:string) => result(fetch(`${API_URL}/trips/${tripId}/itinerary/${id}/toggle`,{method:"PATCH"}).then(r=>parse<ItineraryItem>(r))),
  deleteItinerary: (tripId:string,id:string) => fetch(`${API_URL}/trips/${tripId}/itinerary/${id}`,{method:"DELETE"}).then(r=>parse<void>(r)),
  addReservation: (tripId:string,input:Omit<Reservation,"id"|"tripId">) => result(fetch(`${API_URL}/trips/${tripId}/reservations`,{method:"POST",headers:json,body:JSON.stringify(input)}).then(r=>parse<Reservation>(r))),
  deleteReservation: (tripId:string,id:string) => fetch(`${API_URL}/trips/${tripId}/reservations/${id}`,{method:"DELETE"}).then(r=>parse<void>(r)),
  addTravelDocument: (tripId:string,input:Omit<TravelDocument,"id"|"tripId">) => result(fetch(`${API_URL}/trips/${tripId}/documents`,{method:"POST",headers:json,body:JSON.stringify(input)}).then(r=>parse<TravelDocument>(r))),
  toggleTravelDocument: (tripId:string,id:string) => result(fetch(`${API_URL}/trips/${tripId}/documents/${id}/toggle`,{method:"PATCH"}).then(r=>parse<TravelDocument>(r))),
  deleteTravelDocument: (tripId:string,id:string) => fetch(`${API_URL}/trips/${tripId}/documents/${id}`,{method:"DELETE"}).then(r=>parse<void>(r)),
  addTripChecklist: (tripId:string,input:Omit<TripChecklistItem,"id"|"tripId">) => result(fetch(`${API_URL}/trips/${tripId}/checklist`,{method:"POST",headers:json,body:JSON.stringify(input)}).then(r=>parse<TripChecklistItem>(r))),
  toggleTripChecklist: (tripId:string,id:string) => result(fetch(`${API_URL}/trips/${tripId}/checklist/${id}/toggle`,{method:"PATCH"}).then(r=>parse<TripChecklistItem>(r))),
  deleteTripChecklist: (tripId:string,id:string) => fetch(`${API_URL}/trips/${tripId}/checklist/${id}`,{method:"DELETE"}).then(r=>parse<void>(r)),
  addTripExpense: (tripId:string,input:Omit<TripExpense,"id"|"tripId">) => result(fetch(`${API_URL}/trips/${tripId}/expenses`,{method:"POST",headers:json,body:JSON.stringify(input)}).then(r=>parse<TripExpense>(r))),
  deleteTripExpense: (tripId:string,id:string) => fetch(`${API_URL}/trips/${tripId}/expenses/${id}`,{method:"DELETE"}).then(r=>parse<void>(r)),
  dashboard: () => result(fetch(`${API_URL}/dashboard`, { cache: "no-store" }).then((r) => parse<DashboardSummary>(r))),
  tasks: () => result(fetch(`${API_URL}/tasks`, { cache: "no-store" }).then((r) => parse<Task[]>(r))),
  projects: () => result(fetch(`${API_URL}/projects`, { cache: "no-store" }).then((r) => parse<Project[]>(r))),
  habits: () => result(fetch(`${API_URL}/habits`, { cache: "no-store" }).then((r) => parse<Habit[]>(r))),
  goals: () => result(fetch(`${API_URL}/goals`, { cache: "no-store" }).then((r) => parse<Goal[]>(r))),
  createTask: (input: TaskInput) => result(fetch(`${API_URL}/tasks`, { method: "POST", headers: json, body: JSON.stringify(input) }).then((r) => parse<Task>(r))),
  updateTask: (id: string, input: TaskInput) => result(fetch(`${API_URL}/tasks/${id}`, { method: "PUT", headers: json, body: JSON.stringify(input) }).then((r) => parse<Task>(r))),
  updateTaskStatus: (id: string, status: TaskStatus) => fetch(`${API_URL}/tasks/${id}/status`, { method: "PATCH", headers: json, body: JSON.stringify({ status }) }).then((r) => parse<Task>(r)),
  deleteTask: (id: string) => fetch(`${API_URL}/tasks/${id}`, { method: "DELETE" }).then((r) => parse<void>(r)),
  createProject: (input: ProjectInput) => result(fetch(`${API_URL}/projects`, { method: "POST", headers: json, body: JSON.stringify(input) }).then((r) => parse<Project>(r))),
  updateProject: (id: string, input: ProjectInput) => result(fetch(`${API_URL}/projects/${id}`, { method: "PUT", headers: json, body: JSON.stringify(input) }).then((r) => parse<Project>(r))),
  deleteProject: (id: string) => fetch(`${API_URL}/projects/${id}`, { method: "DELETE" }).then((r) => parse<void>(r)),
  createHabit: (input: HabitInput) => result(fetch(`${API_URL}/habits`, { method: "POST", headers: json, body: JSON.stringify(input) }).then((r) => parse<Habit>(r))),
  updateHabit: (id: string, input: HabitInput) => result(fetch(`${API_URL}/habits/${id}`, { method: "PUT", headers: json, body: JSON.stringify(input) }).then((r) => parse<Habit>(r))),
  deleteHabit: (id: string) => fetch(`${API_URL}/habits/${id}`, { method: "DELETE" }).then((r) => parse<void>(r)),
  createGoal: (input: GoalInput) => result(fetch(`${API_URL}/goals`, { method: "POST", headers: json, body: JSON.stringify(input) }).then((r) => parse<Goal>(r))),
  updateGoal: (id: string, input: GoalInput) => result(fetch(`${API_URL}/goals/${id}`, { method: "PUT", headers: json, body: JSON.stringify(input) }).then((r) => parse<Goal>(r))),
  deleteGoal: (id: string) => fetch(`${API_URL}/goals/${id}`, { method: "DELETE" }).then((r) => parse<void>(r)),
  focusSessions: () => result(fetch(`${API_URL}/focus-sessions`, { cache: "no-store" }).then((r) => parse<FocusSession[]>(r))),
  startFocusSession: (input: { title: string; taskId?: string | null; plannedMinutes: number }) => result(fetch(`${API_URL}/focus-sessions`, { method: "POST", headers: json, body: JSON.stringify(input) }).then((r) => parse<FocusSession>(r))),
  completeFocusSession: (id: string, actualMinutes: number) => result(fetch(`${API_URL}/focus-sessions/${id}/complete`, { method: "PATCH", headers: json, body: JSON.stringify({ actualMinutes }) }).then((r) => parse<FocusSession>(r))),
  reviewToday: () => result(fetch(`${API_URL}/reviews/today`, { cache: "no-store" }).then((r) => parse<DailyReview | null>(r))),
  saveReviewToday: (input: DailyReview) => result(fetch(`${API_URL}/reviews/today`, { method: "PUT", headers: json, body: JSON.stringify(input) }).then((r) => parse<DailyReview>(r))),
  logHabit: (habitId: string, done: boolean) => fetch(`${API_URL}/habits/${habitId}/check-in`, { method: "POST", headers: json, body: JSON.stringify({ done }) }).then((r) => parse<{ ok: true }>(r)),
  calendarBlocks: (from: string, to: string) => result(fetch(`${API_URL}/calendar-blocks?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, { cache: "no-store" }).then((r) => parse<CalendarBlock[]>(r))),
  createCalendarBlock: (input: CalendarBlockInput) => result(fetch(`${API_URL}/calendar-blocks`, { method: "POST", headers: json, body: JSON.stringify(input) }).then((r) => parse<CalendarBlock>(r))),
  updateCalendarBlock: (id: string, input: CalendarBlockInput) => result(fetch(`${API_URL}/calendar-blocks/${id}`, { method: "PUT", headers: json, body: JSON.stringify(input) }).then((r) => parse<CalendarBlock>(r))),
  completeCalendarBlock: (id: string, completed: boolean) => result(fetch(`${API_URL}/calendar-blocks/${id}/complete`, { method: "PATCH", headers: json, body: JSON.stringify({ completed }) }).then((r) => parse<CalendarBlock>(r))),
  deleteCalendarBlock: (id: string) => fetch(`${API_URL}/calendar-blocks/${id}`, { method: "DELETE" }).then((r) => parse<void>(r)),
  weeklyReviewCurrent: () => result(fetch(`${API_URL}/weekly-reviews/current`, { cache: "no-store" }).then((r) => parse<WeeklyReview | null>(r))),
  saveWeeklyReviewCurrent: (input: WeeklyReview) => result(fetch(`${API_URL}/weekly-reviews/current`, { method: "PUT", headers: json, body: JSON.stringify(input) }).then((r) => parse<WeeklyReview>(r))),
  notes: (query = "", archived = false) => result(fetch(`${API_URL}/notes?query=${encodeURIComponent(query)}&archived=${archived}`, { cache: "no-store" }).then((r) => parse<Note[]>(r))),
  note: (id: string) => result(fetch(`${API_URL}/notes/${id}`, { cache: "no-store" }).then((r) => parse<Note>(r))),
  createNote: (input: NoteInput) => result(fetch(`${API_URL}/notes`, { method: "POST", headers: json, body: JSON.stringify(input) }).then((r) => parse<Note>(r))),
  updateNote: (id: string, input: NoteInput) => result(fetch(`${API_URL}/notes/${id}`, { method: "PUT", headers: json, body: JSON.stringify(input) }).then((r) => parse<Note>(r))),
  favoriteNote: (id: string, favorite: boolean) => result(fetch(`${API_URL}/notes/${id}/favorite`, { method: "PATCH", headers: json, body: JSON.stringify({ favorite }) }).then((r) => parse<Note>(r))),
  archiveNote: (id: string, archived: boolean) => result(fetch(`${API_URL}/notes/${id}/archive`, { method: "PATCH", headers: json, body: JSON.stringify({ archived }) }).then((r) => parse<Note>(r))),
  deleteNote: (id: string) => fetch(`${API_URL}/notes/${id}`, { method: "DELETE" }).then((r) => parse<void>(r)),
  areas: () => result(fetch(`${API_URL}/areas`, { cache: "no-store" }).then((r) => parse<Area[]>(r))),
  createArea: (name: string) => result(fetch(`${API_URL}/areas`, { method: "POST", headers: json, body: JSON.stringify({ name }) }).then((r) => parse<Area>(r))),
  tags: () => result(fetch(`${API_URL}/tags`, { cache: "no-store" }).then((r) => parse<Tag[]>(r))),
};
