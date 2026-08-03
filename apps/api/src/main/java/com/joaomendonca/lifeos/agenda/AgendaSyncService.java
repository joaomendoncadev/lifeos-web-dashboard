package com.joaomendonca.lifeos.agenda;

import com.joaomendonca.lifeos.habit.HabitLogEntity;
import com.joaomendonca.lifeos.habit.HabitLogRepository;
import com.joaomendonca.lifeos.habit.HabitRepository;
import com.joaomendonca.lifeos.task.TaskEntity;
import com.joaomendonca.lifeos.task.TaskRepository;
import com.joaomendonca.lifeos.task.TaskStatus;
import java.time.LocalDate;
import org.springframework.stereotype.Service;

/**
 * Keeps calendar blocks, their linked task and any habit sharing the block's name
 * in sync whenever one side's completion state changes.
 */
@Service
public class AgendaSyncService {
  private final CalendarBlockRepository blocks;
  private final TaskRepository tasks;
  private final HabitRepository habits;
  private final HabitLogRepository habitLogs;

  public AgendaSyncService(CalendarBlockRepository blocks, TaskRepository tasks, HabitRepository habits, HabitLogRepository habitLogs) {
    this.blocks = blocks; this.tasks = tasks; this.habits = habits; this.habitLogs = habitLogs;
  }

  /** Called after a calendar block is saved: propagates its completion to the linked task and a matching habit. */
  public void fromBlock(CalendarBlockEntity block) {
    boolean completed = Boolean.TRUE.equals(block.getCompleted());
    if (block.getTaskId() != null) {
      tasks.findOneById(block.getTaskId()).ifPresent(task -> {
        boolean taskDone = task.getStatus() == TaskStatus.DONE;
        if (completed && !taskDone) { task.setStatus(TaskStatus.DONE); tasks.save(task); }
        else if (!completed && taskDone) { task.setStatus(TaskStatus.NEXT); tasks.save(task); }
      });
    }
    syncHabit(block.getTitle(), completed);
  }

  /** Called after a task's status changes: propagates completion to every calendar block linked to it. */
  public void fromTask(TaskEntity task) {
    boolean completed = task.getStatus() == TaskStatus.DONE;
    for (var block : blocks.findByTaskId(task.getId())) {
      if (Boolean.TRUE.equals(block.getCompleted()) == completed) continue;
      block.setCompleted(completed);
      blocks.save(block);
      syncHabit(block.getTitle(), completed);
    }
  }

  private void syncHabit(String title, boolean completed) {
    habits.findByActiveTrueAndNameIgnoreCase(title.trim()).ifPresent(habit -> {
      var today = LocalDate.now();
      var log = habitLogs.findByHabitIdAndDate(habit.getId(), today).orElseGet(() -> {
        var created = new HabitLogEntity();
        created.setHabit(habit);
        created.setDate(today);
        return created;
      });
      boolean wasDone = Boolean.TRUE.equals(log.getDone());
      if (wasDone == completed) return;
      log.setDone(completed);
      habitLogs.save(log);
      habit.setStreak(Math.max(0, habit.getStreak() + (completed ? 1 : -1)));
      habits.save(habit);
    });
  }
}
