package com.joaomendonca.lifeos.dashboard;

import com.joaomendonca.lifeos.habit.*;
import com.joaomendonca.lifeos.focus.FocusSessionRepository;
import com.joaomendonca.lifeos.workspace.WorkspaceRepository;
import com.joaomendonca.lifeos.task.*;
import java.time.LocalDate;
import java.util.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {
  private final TaskRepository tasks;
  private final WorkspaceRepository workspaces;
  private final HabitRepository habits;
  private final HabitLogRepository logs;
  private final FocusSessionRepository focusSessions;

  public DashboardController(TaskRepository tasks, WorkspaceRepository workspaces, HabitRepository habits, HabitLogRepository logs, FocusSessionRepository focusSessions) {
    this.tasks = tasks; this.workspaces = workspaces; this.habits = habits; this.logs = logs; this.focusSessions = focusSessions;
  }

  record DashboardResponse(long openTasks, long completedTasks, long activeProjects, long habitsDone,
                           long habitsTotal, int plannedMinutes, long overdueTasks, long dueToday, int focusMinutesToday,
                           List<TaskItem> priorities) {}
  record TaskItem(String id, String title, String context, String duration, String priority) {}

  @GetMapping
  DashboardResponse summary() {
    var allTasks = tasks.findAllByOrderByCreatedAtDesc();
    var priorities = allTasks.stream().filter(t -> t.getStatus() != TaskStatus.DONE)
        .sorted(Comparator.comparingInt(t -> priorityWeight(t.getPriority())))
        .limit(4)
        .map(t -> new TaskItem(t.getId().toString(), t.getTitle(), t.getContext(), t.getDurationMinutes() + " min", t.getPriority()))
        .toList();
    long habitTotal = habits.findByActiveTrueOrderByNameAsc().size();
    long habitDone = logs.findByDate(LocalDate.now()).stream().filter(HabitLogEntity::getDone).count();
    int planned = allTasks.stream().filter(t -> t.getStatus() != TaskStatus.DONE).mapToInt(TaskEntity::getDurationMinutes).sum();
    var today = LocalDate.now();
    long overdue = allTasks.stream().filter(t -> t.getStatus() != TaskStatus.DONE && t.getDueDate() != null && t.getDueDate().isBefore(today)).count();
    long dueToday = allTasks.stream().filter(t -> t.getStatus() != TaskStatus.DONE && today.equals(t.getDueDate())).count();
    var start = today.atStartOfDay(java.time.ZoneId.systemDefault()).toInstant();
    var end = today.plusDays(1).atStartOfDay(java.time.ZoneId.systemDefault()).toInstant();
    int focused = focusSessions.findByStartedAtBetween(start, end).stream().filter(f -> Boolean.TRUE.equals(f.getCompleted())).mapToInt(f -> f.getActualMinutes()).sum();
    return new DashboardResponse(tasks.countByStatusNot(TaskStatus.DONE), tasks.countByStatus(TaskStatus.DONE),
        workspaces.countByArchivedFalse(), habitDone, habitTotal, planned, overdue, dueToday, focused, priorities);
  }

  private int priorityWeight(String priority) {
    if (priority == null) return 3;
    return switch (priority.toLowerCase()) { case "alta" -> 0; case "média", "media" -> 1; default -> 2; };
  }
}
