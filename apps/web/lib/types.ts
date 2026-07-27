export type TaskStatus = "Inbox" | "Próxima" | "Em andamento" | "Concluída";

export type Task = {
  id: string;
  title: string;
  projectId?: string | null;
  project: string;
  context: string;
  duration: string;
  durationMinutes: number;
  status: TaskStatus;
  priority: string;
  dueDate?: string | null;
};

export type TaskInput = {
  title: string;
  status?: TaskStatus;
  projectId?: string | null;
  context?: string;
  durationMinutes?: number;
  priority?: string;
  dueDate?: string | null;
};

export type Project = {
  id: string;
  name: string;
  area: string;
  description: string;
  progress: number;
  deadline: string;
  deadlineDate?: string | null;
  tasks: number;
  icon: string;
};

export type ProjectInput = {
  name: string;
  area?: string;
  description?: string;
  deadline?: string | null;
  icon?: string;
};

export type HabitInput = {
  name: string;
  description?: string;
  frequency?: string;
  icon?: string;
};

export type Habit = {
  id: string;
  name: string;
  description: string;
  frequency: string;
  streak: number;
  icon: string;
  done: boolean;
};

export type DashboardSummary = {
  openTasks: number;
  completedTasks: number;
  activeProjects: number;
  habitsDone: number;
  habitsTotal: number;
  plannedMinutes: number;
  overdueTasks: number;
  dueToday: number;
  focusMinutesToday: number;
  priorities: Array<{ id: string; title: string; context: string; duration: string; priority: string }>;
};

export type ApiResult<T> = {
  data: T;
  source: "api";
};

export type Goal = {
  id: string;
  title: string;
  area: string;
  description: string;
  progress: number;
  deadline?: string | null;
};

export type GoalInput = {
  title: string;
  area?: string;
  description?: string;
  progress?: number;
  deadline?: string | null;
};

export type FocusSession = {
  id: string;
  title: string;
  taskId?: string | null;
  plannedMinutes: number;
  actualMinutes: number;
  completed: boolean;
  startedAt: string;
  endedAt?: string | null;
};

export type DailyReview = {
  id?: string | null;
  reviewDate: string;
  wins: string;
  blockers: string;
  tomorrow: string;
  mood: number;
};

export type CalendarBlockType = "FOCUS" | "MEETING" | "PERSONAL" | "ROUTINE" | "BREAK";

export type CalendarBlock = {
  id: string;
  title: string;
  description: string;
  blockType: CalendarBlockType;
  startAt: string;
  endAt: string;
  taskId?: string | null;
  projectId?: string | null;
  completed: boolean;
};

export type CalendarBlockInput = Omit<CalendarBlock, "id">;

export type WeeklyReview = {
  id?: string | null;
  weekStart?: string | null;
  highlights: string;
  challenges: string;
  lessons: string;
  nextWeekPriorities: string;
  energy: number;
};

export type Area = {
  id: string;
  name: string;
  icon: string;
};

export type Tag = {
  id: string;
  name: string;
};

export type Note = {
  id: string;
  title: string;
  content: string;
  area?: Area | null;
  projectId?: string | null;
  projectName?: string | null;
  tags: Tag[];
  favorite: boolean;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
};

export type NoteInput = {
  title: string;
  content?: string;
  areaId?: string | null;
  projectId?: string | null;
  tags?: string[];
  favorite?: boolean;
  archived?: boolean;
};

export type Trip = {
  id: string; name: string; destination: string; startDate?: string | null; endDate?: string | null;
  status: string; currency: string; budget: number; spent: number; notes: string; coverEmoji: string;
  itineraryCount: number; reservationCount: number; documentCount: number; checklistDone: number; checklistTotal: number;
};
export type TripInput = { name:string; destination:string; startDate?:string|null; endDate?:string|null; status?:string; currency?:string; budget?:number; notes?:string; coverEmoji?:string };
export type ItineraryItem = { id:string; tripId:string; itemDate:string; startTime?:string|null; title:string; location:string; notes:string; completed:boolean };
export type Reservation = { id:string; tripId:string; reservationType:string; provider:string; confirmationCode:string; startAt?:string|null; endAt?:string|null; amount:number; notes:string };
export type TravelDocument = { id:string; tripId:string; name:string; documentType:string; reference:string; expiryDate?:string|null; ready:boolean };
export type TripChecklistItem = { id:string; tripId:string; title:string; category:string; completed:boolean };
export type TripExpense = { id:string; tripId:string; description:string; category:string; amount:number; expenseDate:string; paid:boolean };
export type TripDetails = { trip:Trip; itinerary:ItineraryItem[]; reservations:Reservation[]; documents:TravelDocument[]; checklist:TripChecklistItem[]; expenses:TripExpense[] };
