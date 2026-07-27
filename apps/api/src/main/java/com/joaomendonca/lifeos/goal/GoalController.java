package com.joaomendonca.lifeos.goal;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/goals")
public class GoalController {
  private final GoalRepository goals;

  public GoalController(GoalRepository goals) { this.goals = goals; }

  record GoalRequest(@NotBlank @Size(max = 180) String title, @Size(max = 100) String area,
                     @Size(max = 1200) String description, @Min(0) @Max(100) Integer progress,
                     LocalDate deadline) {}
  record GoalResponse(String id, String title, String area, String description, int progress,
                      LocalDate deadline) {}

  @GetMapping
  List<GoalResponse> list() { return goals.findByActiveTrueOrderByDeadlineAsc().stream().map(this::map).toList(); }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  GoalResponse create(@Valid @RequestBody GoalRequest request) {
    var entity = new GoalEntity(); apply(entity, request); return map(goals.save(entity));
  }

  @PutMapping("/{id}")
  GoalResponse update(@PathVariable UUID id, @Valid @RequestBody GoalRequest request) {
    var entity = find(id); apply(entity, request); return map(goals.save(entity));
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  void delete(@PathVariable UUID id) { var entity = find(id); entity.setActive(false); goals.save(entity); }

  private GoalEntity find(UUID id) {
    return goals.findById(id).filter(g -> Boolean.TRUE.equals(g.getActive()))
        .orElseThrow(() -> new IllegalArgumentException("Meta não encontrada."));
  }

  private void apply(GoalEntity entity, GoalRequest request) {
    entity.setTitle(request.title().trim());
    entity.setArea(text(request.area(), "Pessoal"));
    entity.setDescription(text(request.description(), ""));
    entity.setProgress(request.progress() == null ? 0 : request.progress());
    entity.setDeadline(request.deadline());
    entity.setActive(true);
  }

  private String text(String value, String fallback) { return value == null || value.isBlank() ? fallback : value.trim(); }
  private GoalResponse map(GoalEntity entity) { return new GoalResponse(entity.getId().toString(), entity.getTitle(), entity.getArea(), entity.getDescription(), entity.getProgress(), entity.getDeadline()); }
}
