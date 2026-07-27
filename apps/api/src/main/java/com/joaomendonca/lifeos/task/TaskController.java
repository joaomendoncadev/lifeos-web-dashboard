package com.joaomendonca.lifeos.task;

import com.joaomendonca.lifeos.project.ProjectRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.util.*;
import org.springframework.http.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/tasks")
public class TaskController {
  private final TaskRepository tasks;
  private final ProjectRepository projects;

  public TaskController(TaskRepository tasks, ProjectRepository projects) {
    this.tasks = tasks;
    this.projects = projects;
  }

  record TaskRequest(
      @NotBlank @Size(max = 240) String title,
      String status,
      UUID projectId,
      @Size(max = 80) String context,
      @Min(5) @Max(1440) Integer durationMinutes,
      @Size(max = 30) String priority,
      LocalDate dueDate) {}
  record UpdateStatusRequest(@NotBlank String status) {}
  record TaskResponse(String id, String title, String projectId, String project, String context,
                      String duration, int durationMinutes, String status, String priority, LocalDate dueDate) {}

  @GetMapping
  @Transactional(readOnly = true)
  List<TaskResponse> list() {
    return tasks.findAllByOrderByCreatedAtDesc().stream().map(this::map).toList();
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  @Transactional
  TaskResponse create(@Valid @RequestBody TaskRequest request) {
    var entity = new TaskEntity();
    apply(entity, request);
    return map(tasks.save(entity));
  }

  @PutMapping("/{id}")
  @Transactional
  TaskResponse update(@PathVariable UUID id, @Valid @RequestBody TaskRequest request) {
    var entity = find(id);
    apply(entity, request);
    return map(tasks.save(entity));
  }

  @PatchMapping("/{id}/status")
  @Transactional
  TaskResponse status(@PathVariable UUID id, @Valid @RequestBody UpdateStatusRequest request) {
    var entity = find(id);
    entity.setStatus(TaskStatus.fromLabel(request.status()));
    return map(tasks.save(entity));
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  void delete(@PathVariable UUID id) {
    tasks.delete(find(id));
  }

  private TaskEntity find(UUID id) {
    return tasks.findOneById(id).orElseThrow(() -> new IllegalArgumentException("Tarefa não encontrada."));
  }

  private void apply(TaskEntity entity, TaskRequest request) {
    entity.setTitle(request.title().trim());
    entity.setStatus(request.status() == null || request.status().isBlank() ? TaskStatus.INBOX : TaskStatus.fromLabel(request.status()));
    entity.setProject(request.projectId() == null ? null : projects.findById(request.projectId())
        .orElseThrow(() -> new IllegalArgumentException("Projeto não encontrado.")));
    entity.setContext(defaultText(request.context(), "Pessoal"));
    entity.setDurationMinutes(request.durationMinutes() == null ? 30 : request.durationMinutes());
    entity.setPriority(defaultText(request.priority(), "Média"));
    entity.setDueDate(request.dueDate());
  }

  private String defaultText(String value, String fallback) {
    return value == null || value.isBlank() ? fallback : value.trim();
  }

  private TaskResponse map(TaskEntity entity) {
    var project = entity.getProject();
    return new TaskResponse(
        entity.getId().toString(), entity.getTitle(), project == null ? null : project.getId().toString(),
        project == null ? "Inbox" : project.getName(), entity.getContext(), entity.getDurationMinutes() + " min",
        entity.getDurationMinutes(), entity.getStatus().label, entity.getPriority(), entity.getDueDate());
  }
}
