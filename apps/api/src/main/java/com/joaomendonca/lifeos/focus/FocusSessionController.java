package com.joaomendonca.lifeos.focus;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.Instant;
import java.util.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/focus-sessions")
public class FocusSessionController {
  private final FocusSessionRepository sessions;
  public FocusSessionController(FocusSessionRepository sessions) { this.sessions = sessions; }

  record Request(@NotBlank @Size(max = 240) String title, UUID taskId, @Min(1) @Max(240) Integer plannedMinutes) {}
  record CompleteRequest(@Min(1) @Max(240) Integer actualMinutes) {}
  record Response(String id, String title, String taskId, int plannedMinutes, int actualMinutes, boolean completed, Instant startedAt, Instant endedAt) {}

  @GetMapping
  List<Response> list() { return sessions.findTop20ByOrderByStartedAtDesc().stream().map(this::map).toList(); }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  Response create(@Valid @RequestBody Request request) {
    var entity = new FocusSessionEntity();
    entity.setTitle(request.title().trim());
    entity.setTaskId(request.taskId());
    entity.setPlannedMinutes(request.plannedMinutes() == null ? 25 : request.plannedMinutes());
    entity.setStartedAt(Instant.now());
    return map(sessions.save(entity));
  }

  @PatchMapping("/{id}/complete")
  Response complete(@PathVariable UUID id, @Valid @RequestBody CompleteRequest request) {
    var entity = sessions.findById(id).orElseThrow(() -> new IllegalArgumentException("Sessão de foco não encontrada."));
    entity.setActualMinutes(request.actualMinutes() == null ? entity.getPlannedMinutes() : request.actualMinutes());
    entity.setCompleted(true);
    entity.setEndedAt(Instant.now());
    return map(sessions.save(entity));
  }

  private Response map(FocusSessionEntity e) {
    return new Response(e.getId().toString(), e.getTitle(), e.getTaskId() == null ? null : e.getTaskId().toString(),
        e.getPlannedMinutes(), e.getActualMinutes(), e.getCompleted(), e.getStartedAt(), e.getEndedAt());
  }
}
