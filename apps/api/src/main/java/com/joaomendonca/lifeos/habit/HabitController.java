package com.joaomendonca.lifeos.habit;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/habits")
public class HabitController {
  private final HabitRepository habits;
  private final HabitLogRepository logs;

  public HabitController(HabitRepository habits, HabitLogRepository logs) {
    this.habits = habits;
    this.logs = logs;
  }

  record HabitRequest(@NotBlank @Size(max = 140) String name,
                      @Size(max = 300) String description,
                      @Size(max = 60) String frequency,
                      @Size(max = 60) String icon) {}
  record HabitResponse(String id, String name, String description, String frequency, int streak,
                       String icon, boolean done) {}
  record CheckInRequest(boolean done) {}

  @GetMapping
  List<HabitResponse> list() {
    return habits.findByActiveTrueOrderByNameAsc().stream().map(this::map).toList();
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  HabitResponse create(@Valid @RequestBody HabitRequest request) {
    var entity = new HabitEntity();
    apply(entity, request);
    return map(habits.save(entity));
  }

  @PutMapping("/{id}")
  HabitResponse update(@PathVariable UUID id, @Valid @RequestBody HabitRequest request) {
    var entity = find(id);
    apply(entity, request);
    return map(habits.save(entity));
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  void delete(@PathVariable UUID id) {
    var entity = find(id);
    entity.setActive(false);
    habits.save(entity);
  }

  @PostMapping("/{id}/check-in")
  @Transactional
  Map<String, Boolean> checkIn(@PathVariable UUID id, @RequestBody CheckInRequest request) {
    var habit = find(id);
    var today = LocalDate.now();
    var log = logs.findByHabitIdAndDate(id, today).orElseGet(() -> {
      var created = new HabitLogEntity();
      created.setHabit(habit);
      created.setDate(today);
      return created;
    });
    boolean wasDone = Boolean.TRUE.equals(log.getDone());
    log.setDone(request.done());
    logs.save(log);
    if (!wasDone && request.done()) habit.setStreak(Math.max(0, habit.getStreak()) + 1);
    if (wasDone && !request.done()) habit.setStreak(Math.max(0, habit.getStreak() - 1));
    habits.save(habit);
    return Map.of("ok", true);
  }

  private HabitEntity find(UUID id) {
    return habits.findById(id).filter(h -> Boolean.TRUE.equals(h.getActive()))
        .orElseThrow(() -> new IllegalArgumentException("Hábito não encontrado."));
  }

  private void apply(HabitEntity entity, HabitRequest request) {
    entity.setName(request.name().trim());
    entity.setDescription(defaultText(request.description(), ""));
    entity.setFrequency(defaultText(request.frequency(), "Diário"));
    entity.setIcon(defaultText(request.icon(), "✓"));
    entity.setActive(true);
  }

  private String defaultText(String value, String fallback) {
    return value == null || value.isBlank() ? fallback : value.trim();
  }

  private HabitResponse map(HabitEntity habit) {
    boolean done = logs.findByHabitIdAndDate(habit.getId(), LocalDate.now())
        .map(HabitLogEntity::getDone).orElse(false);
    return new HabitResponse(habit.getId().toString(), habit.getName(), habit.getDescription(),
        habit.getFrequency(), habit.getStreak(), habit.getIcon(), done);
  }
}
