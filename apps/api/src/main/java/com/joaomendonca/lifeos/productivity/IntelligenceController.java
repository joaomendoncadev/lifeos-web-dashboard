package com.joaomendonca.lifeos.productivity;

import com.joaomendonca.lifeos.agenda.*;
import com.joaomendonca.lifeos.focus.*;
import com.joaomendonca.lifeos.goal.*;
import com.joaomendonca.lifeos.habit.*;
import com.joaomendonca.lifeos.task.*;
import com.joaomendonca.lifeos.workspace.*;
import java.time.*;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/intelligence")
public class IntelligenceController {
  private final TaskRepository tasks;
  private final WorkspaceRepository workspaces;
  private final FocusSessionRepository focus;
  private final HabitRepository habits;
  private final HabitLogRepository habitLogs;
  private final CalendarBlockRepository calendar;
  private final GoalRepository goals;
  private final ActivityEventRepository events;

  public IntelligenceController(TaskRepository tasks, WorkspaceRepository workspaces, FocusSessionRepository focus,
      HabitRepository habits, HabitLogRepository habitLogs, CalendarBlockRepository calendar,
      GoalRepository goals, ActivityEventRepository events) {
    this.tasks = tasks; this.workspaces = workspaces; this.focus = focus; this.habits = habits;
    this.habitLogs = habitLogs; this.calendar = calendar; this.goals = goals; this.events = events;
  }

  record DailyPoint(LocalDate date, long completedTasks, int focusMinutes, long habitsDone) {}
  record WorkspaceHealth(String id, String name, String status, int score, int progress, long openTasks,
      long overdueTasks, long activityLast14Days, String reason) {}
  record Recommendation(String id, String severity, String title, String description, String actionLabel, String href) {}
  record AgendaSuggestion(String id, String title, String reason, int durationMinutes, String preferredPeriod,
      String taskId, String workspace) {}
  record GoalSignal(String id, String title, int currentProgress, int suggestedProgress, String reason) {}
  record HabitSignal(String label, double value, String interpretation) {}
  record IntelligenceOverview(LocalDate generatedAt, long completedLast7Days, long completedPrevious7Days,
      int focusMinutesLast7Days, int productiveDays, int activeWorkspaces, int workspacesAtRisk,
      int habitCompletionRate, List<DailyPoint> trend, List<WorkspaceHealth> workspaceHealth,
      List<Recommendation> recommendations, List<AgendaSuggestion> agendaSuggestions,
      List<GoalSignal> goalSignals, List<HabitSignal> habitSignals) {}

  @GetMapping("/overview")
  @Transactional(readOnly = true)
  IntelligenceOverview overview() {
    LocalDate today = LocalDate.now();
    ZoneId zone = ZoneId.systemDefault();
    Instant start7 = today.minusDays(6).atStartOfDay(zone).toInstant();
    Instant start14 = today.minusDays(13).atStartOfDay(zone).toInstant();
    Instant tomorrow = today.plusDays(1).atStartOfDay(zone).toInstant();
    OffsetDateTime activityCutoff = OffsetDateTime.now().minusDays(14);

    List<TaskEntity> allTasks = tasks.findAllByOrderByCreatedAtDesc();
    List<FocusSessionEntity> focus14 = focus.findByStartedAtBetween(start14, tomorrow);
    List<HabitEntity> activeHabits = habits.findByActiveTrueOrderByNameAsc();
    List<WorkspaceEntity> activeWorkspaces = workspaces.findAllByArchivedFalseOrderByUpdatedAtDesc();

    List<DailyPoint> trend = IntStream.range(0, 7).mapToObj(index -> {
      LocalDate date = today.minusDays(6 - index);
      Instant dayStart = date.atStartOfDay(zone).toInstant();
      Instant dayEnd = date.plusDays(1).atStartOfDay(zone).toInstant();
      long completed = allTasks.stream().filter(t -> t.getStatus() == TaskStatus.DONE)
          .filter(t -> !t.getUpdatedAt().isBefore(dayStart) && t.getUpdatedAt().isBefore(dayEnd)).count();
      int minutes = focus14.stream().filter(f -> Boolean.TRUE.equals(f.getCompleted()))
          .filter(f -> !f.getStartedAt().isBefore(dayStart) && f.getStartedAt().isBefore(dayEnd))
          .mapToInt(f -> Optional.ofNullable(f.getActualMinutes()).orElse(0)).sum();
      long doneHabits = habitLogs.findByDate(date).stream().filter(l -> Boolean.TRUE.equals(l.getDone())).count();
      return new DailyPoint(date, completed, minutes, doneHabits);
    }).toList();

    long completed7 = trend.stream().mapToLong(DailyPoint::completedTasks).sum();
    long completedPrevious = allTasks.stream().filter(t -> t.getStatus() == TaskStatus.DONE)
        .filter(t -> !t.getUpdatedAt().isBefore(today.minusDays(13).atStartOfDay(zone).toInstant()))
        .filter(t -> t.getUpdatedAt().isBefore(today.minusDays(6).atStartOfDay(zone).toInstant())).count();
    int focus7 = trend.stream().mapToInt(DailyPoint::focusMinutes).sum();
    int productiveDays = (int) trend.stream().filter(p -> p.completedTasks() > 0 || p.focusMinutes() > 0).count();
    long habitDone = trend.stream().mapToLong(DailyPoint::habitsDone).sum();
    int habitRate = activeHabits.isEmpty() ? 0 : (int) Math.round(habitDone * 100d / (activeHabits.size() * 7d));

    List<WorkspaceHealth> health = activeWorkspaces.stream().map(w -> health(w, today, activityCutoff)).toList();
    int atRisk = (int) health.stream().filter(h -> !"HEALTHY".equals(h.status())).count();
    List<Recommendation> recommendations = recommendations(allTasks, health, completed7, completedPrevious, focus7, habitRate, today);
    List<AgendaSuggestion> suggestions = agendaSuggestions(allTasks, today, zone);
    List<GoalSignal> goalSignals = goals.findByActiveTrueOrderByDeadlineAsc().stream().map(g -> goalSignal(g, allTasks, today)).toList();
    List<HabitSignal> habitSignals = habitSignals(trend);

    return new IntelligenceOverview(today, completed7, completedPrevious, focus7, productiveDays,
        activeWorkspaces.size(), atRisk, habitRate, trend, health, recommendations, suggestions, goalSignals, habitSignals);
  }

  @GetMapping("/workspaces/{id}/health")
  @Transactional(readOnly = true)
  WorkspaceHealth workspaceHealth(@PathVariable UUID id) {
    WorkspaceEntity workspace = workspaces.findById(id).orElseThrow(() -> new IllegalArgumentException("Workspace não encontrado."));
    return health(workspace, LocalDate.now(), OffsetDateTime.now().minusDays(14));
  }

  private WorkspaceHealth health(WorkspaceEntity workspace, LocalDate today, OffsetDateTime cutoff) {
    long total = tasks.countByWorkspaceId(workspace.getId());
    long done = tasks.countByWorkspaceIdAndStatus(workspace.getId(), TaskStatus.DONE);
    long open = total - done;
    long overdue = tasks.countOverdueByWorkspace(workspace.getId(), today);
    long activity = events.countByWorkspaceIdAndCreatedAtAfter(workspace.getId(), cutoff);
    int progress = total == 0 ? 0 : (int) Math.round(done * 100d / total);
    int score = 100;
    score -= Math.min(45, (int) overdue * 15);
    if (open > 0 && activity == 0) score -= 25;
    if (workspace.getDueDate() != null && workspace.getDueDate().isBefore(today) && progress < 100) score -= 25;
    if (total == 0) score -= 10;
    score = Math.max(0, score);
    String status = score >= 75 ? "HEALTHY" : score >= 45 ? "AT_RISK" : "STALLED";
    String reason = overdue > 0 ? overdue + " tarefa(s) atrasada(s)" : activity == 0 && open > 0
        ? "Sem atividade nos últimos 14 dias" : total == 0 ? "Ainda sem próximas ações" : "Ritmo e prazos sob controle";
    return new WorkspaceHealth(workspace.getId().toString(), workspace.getName(), status, score, progress, open, overdue, activity, reason);
  }

  private List<Recommendation> recommendations(List<TaskEntity> all, List<WorkspaceHealth> health, long current,
      long previous, int focusMinutes, int habitRate, LocalDate today) {
    List<Recommendation> result = new ArrayList<>();
    long overdue = all.stream().filter(t -> t.getStatus() != TaskStatus.DONE && t.getDueDate() != null && t.getDueDate().isBefore(today)).count();
    if (overdue > 0) result.add(new Recommendation("overdue", "HIGH", "Limpe as tarefas atrasadas",
        "Há " + overdue + " tarefa(s) vencida(s). Reagende, conclua ou remova o que deixou de ser relevante.", "Revisar Hoje", "/today"));
    health.stream().filter(h -> "STALLED".equals(h.status())).findFirst().ifPresent(h -> result.add(new Recommendation(
        "workspace-" + h.id(), "HIGH", "Workspace parado: " + h.name(), h.reason() + ". Defina uma próxima ação pequena.", "Abrir workspace", "/workspaces?workspace=" + h.id())));
    if (current < previous) result.add(new Recommendation("velocity", "MEDIUM", "Seu ritmo caiu nesta semana",
        "Você concluiu " + current + " tarefas, contra " + previous + " na semana anterior. Reduza o trabalho em andamento.", "Ver Inbox", "/inbox"));
    if (focusMinutes < 120) result.add(new Recommendation("focus", "MEDIUM", "Reserve mais tempo de foco",
        "Foram registrados " + focusMinutes + " minutos de foco nos últimos 7 dias. Uma sessão curta hoje já melhora o ritmo.", "Iniciar foco", "/focus"));
    if (habitRate < 50) result.add(new Recommendation("habits", "LOW", "Simplifique seus hábitos",
        "A consistência estimada está em " + habitRate + "%. Escolha os hábitos essenciais para esta semana.", "Abrir hábitos", "/habits"));
    if (result.isEmpty()) result.add(new Recommendation("steady", "LOW", "Sistema em bom ritmo",
        "Não há alertas críticos. Use a revisão semanal para proteger o que está funcionando.", "Abrir revisão", "/weekly-review"));
    return result.stream().limit(5).toList();
  }

  private List<AgendaSuggestion> agendaSuggestions(List<TaskEntity> all, LocalDate today, ZoneId zone) {
    Instant start = today.atStartOfDay(zone).toInstant();
    Instant end = today.plusDays(1).atStartOfDay(zone).toInstant();
    int occupied = calendar.findByStartAtGreaterThanEqualAndStartAtLessThanOrderByStartAtAsc(start, end).stream()
        .mapToInt(b -> (int) ChronoUnit.MINUTES.between(b.getStartAt(), b.getEndAt())).sum();
    String period = occupied >= 360 ? "amanhã de manhã" : occupied >= 180 ? "fim da tarde" : "próximo bloco livre";
    return all.stream().filter(t -> t.getStatus() != TaskStatus.DONE)
        .sorted(Comparator.comparing((TaskEntity t) -> priorityScore(t.getPriority())).reversed()
            .thenComparing(t -> Optional.ofNullable(t.getDueDate()).orElse(today.plusYears(10))))
        .limit(3).map(t -> new AgendaSuggestion("task-" + t.getId(), t.getTitle(),
            t.getDueDate() != null && !t.getDueDate().isAfter(today) ? "Prazo exige atenção" : "Boa próxima ação",
            Optional.ofNullable(t.getDurationMinutes()).orElse(30), period, t.getId().toString(), t.getProjectName())).toList();
  }

  private GoalSignal goalSignal(GoalEntity goal, List<TaskEntity> all, LocalDate today) {
    long related = all.stream().filter(t -> t.getStatus() == TaskStatus.DONE)
        .filter(t -> contains(t.getContext(), goal.getArea()) || contains(t.getProjectName(), goal.getArea())).count();
    int suggested = goal.getProgress();
    String reason = "Progresso manual mantido";
    if (related > 0) {
      suggested = Math.max(goal.getProgress(), Math.min(95, (int) related * 5));
      reason = related + " tarefa(s) concluída(s) relacionadas à área " + goal.getArea();
    }
    if (goal.getDeadline() != null && goal.getDeadline().isBefore(today) && goal.getProgress() < 100) reason = "Prazo vencido; revise escopo e progresso";
    return new GoalSignal(goal.getId().toString(), goal.getTitle(), goal.getProgress(), suggested, reason);
  }

  private List<HabitSignal> habitSignals(List<DailyPoint> trend) {
    double avgTasksWithHabits = trend.stream().filter(p -> p.habitsDone() > 0).mapToLong(DailyPoint::completedTasks).average().orElse(0);
    double avgTasksWithout = trend.stream().filter(p -> p.habitsDone() == 0).mapToLong(DailyPoint::completedTasks).average().orElse(0);
    double delta = avgTasksWithHabits - avgTasksWithout;
    String interpretation = delta > .25 ? "Nos dias com hábitos cumpridos, você concluiu mais tarefas." : delta < -.25
        ? "Hábitos e execução não caminharam juntos nesta semana." : "Ainda não há diferença suficiente para indicar uma correlação.";
    return List.of(new HabitSignal("Impacto dos hábitos nas tarefas", Math.round(delta * 10d) / 10d, interpretation));
  }

  private int priorityScore(String priority) {
    if (priority == null) return 1;
    return switch (priority.toLowerCase(Locale.ROOT)) { case "alta" -> 3; case "média", "media" -> 2; default -> 1; };
  }
  private boolean contains(String value, String needle) {
    return value != null && needle != null && value.toLowerCase(Locale.ROOT).contains(needle.toLowerCase(Locale.ROOT));
  }
}
