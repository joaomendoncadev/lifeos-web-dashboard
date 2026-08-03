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

export type WorkspaceType = "PROJECT" | "TRAVEL" | "HEALTH" | "FINANCE" | "STUDY" | "CAREER" | "PERSONAL" | "BLANK";

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
  type?: WorkspaceType;
  color?: string;
  status?: string;
  startDate?: string | null;
  metadata?: string;
};

export type WorkspaceTemplate = {
  id: string; code: string; name: string; description: string; type: WorkspaceType; icon: string; color: string; defaultMetadata: string;
};

export type ProjectInput = {
  name: string;
  area?: string;
  description?: string;
  deadline?: string | null;
  dueDate?: string | null;
  startDate?: string | null;
  icon?: string;
  type?: WorkspaceType;
  color?: string;
  status?: string;
  metadata?: string;
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
export type CalendarLifecycleStatus = "PLANNED" | "DONE" | "CANCELLED";
export type CalendarDomain = "WORK" | "HEALTH" | "STUDY" | "PERSONAL";

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
  lifecycleStatus: CalendarLifecycleStatus;
  domain: CalendarDomain;
};

export type CalendarBlockInput = Omit<CalendarBlock, "id">;
export type WeeklyCalendarSummary = { workMinutes:number; healthMinutes:number; studyMinutes:number; personalMinutes:number; plannedMinutes:number; doneMinutes:number; cancelledMinutes:number };
export type RoutineDefinition = {
  id:string; code:string; title:string; description:string; blockType:CalendarBlockType; domain:CalendarDomain;
  daysOfWeek:number[]; startTime:string; endTime:string; active:boolean; sortOrder:number;
};
export type RoutineDefinitionInput = Omit<RoutineDefinition,"id"|"code">;
export type RoutineGenerationResult = { created:number; weekStart:string; weekEnd:string };


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

export type CompactTask = { id:string; title:string; workspaceId?:string|null; workspace:string; priority:string; dueDate?:string|null; status:string };
export type CompactNote = { id:string; title:string; workspaceId?:string|null; workspace:string; excerpt:string; updatedAt:string };
export type CompactWorkspace = { id:string; name:string; type:string; icon:string; progress:number; openTasks:number; overdueTasks:number };
export type TodayHub = { date:string; overdueCount:number; dueTodayCount:number; focusMinutes:number; overdue:CompactTask[]; tasks:CompactTask[]; agenda:Array<{id:string;title:string;startAt:string;endAt:string;type:string;completed:boolean}>; habits:Array<{id:string;name:string;icon:string;frequency:string}>; workspaces:CompactWorkspace[]; notes:CompactNote[] };
export type SearchItem = { id:string; type:"WORKSPACE"|"TASK"|"NOTE"|string; title:string; subtitle:string; href:string };
export type SearchResponse = { query:string; results:SearchItem[] };
export type TimelineItem = { id:string; entityType:string; action:string; description:string; createdAt:string };
export type WorkspaceInsights = { totalTasks:number; completedTasks:number; openTasks:number; overdueTasks:number; progress:number; focusMinutes:number; notes:number; activityLast7Days:number };

export type IntelligenceDailyPoint = { date:string; completedTasks:number; focusMinutes:number; habitsDone:number };
export type WorkspaceHealth = { id:string; name:string; status:"HEALTHY"|"AT_RISK"|"STALLED"; score:number; progress:number; openTasks:number; overdueTasks:number; activityLast14Days:number; reason:string };
export type IntelligenceRecommendation = { id:string; severity:"HIGH"|"MEDIUM"|"LOW"; title:string; description:string; actionLabel:string; href:string };
export type AgendaSuggestion = { id:string; title:string; reason:string; durationMinutes:number; preferredPeriod:string; taskId:string; workspace:string };
export type GoalSignal = { id:string; title:string; currentProgress:number; suggestedProgress:number; reason:string };
export type HabitSignal = { label:string; value:number; interpretation:string };
export type IntelligenceOverview = {
  generatedAt:string; completedLast7Days:number; completedPrevious7Days:number; focusMinutesLast7Days:number;
  productiveDays:number; activeWorkspaces:number; workspacesAtRisk:number; habitCompletionRate:number;
  trend:IntelligenceDailyPoint[]; workspaceHealth:WorkspaceHealth[]; recommendations:IntelligenceRecommendation[];
  agendaSuggestions:AgendaSuggestion[]; goalSignals:GoalSignal[]; habitSignals:HabitSignal[];
};

export type WorkspaceTaskItem = { id:string; title:string; status:TaskStatus; priority:string; context:string; durationMinutes:number; dueDate?:string|null };
export type WorkspaceNoteItem = { id:string; title:string; content:string; favorite:boolean; updatedAt:string };
export type WorkspaceEventItem = { id:string; action:string; description:string; entityType:string; createdAt:string };
export type WorkspaceChecklistItem = { id:string; title:string; completed:boolean; position:number };
export type WorkspaceAttachment = { id:string; name:string; url:string; contentType?:string|null; sizeBytes?:number|null; createdAt:string };
export type WorkspaceDetail = {
 id:string; name:string; description:string; area:string; type:WorkspaceType; icon:string; color:string; status:string;
 startDate?:string|null; dueDate?:string|null; progress:number; tasks:WorkspaceTaskItem[]; notes:WorkspaceNoteItem[];
 timeline:WorkspaceEventItem[]; checklist:WorkspaceChecklistItem[]; attachments:WorkspaceAttachment[];
};
