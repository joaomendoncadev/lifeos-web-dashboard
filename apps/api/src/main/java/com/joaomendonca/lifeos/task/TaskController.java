package com.joaomendonca.lifeos.task;

import com.joaomendonca.lifeos.workspace.WorkspaceRepository;
import com.joaomendonca.lifeos.workspace.ActivityEventEntity;
import com.joaomendonca.lifeos.workspace.ActivityEventRepository;
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
  private final WorkspaceRepository workspaces;
  private final ActivityEventRepository events;

  public TaskController(TaskRepository tasks, WorkspaceRepository workspaces, ActivityEventRepository events) {
    this.tasks = tasks;
    this.workspaces = workspaces;
    this.events = events;
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
  public record TaskResponse(String id, String title, String projectId, String project, String context,
                      String duration, int durationMinutes, String status, String priority, LocalDate dueDate) {}

  @GetMapping
  @Transactional(readOnly = true)
  List<TaskResponse> list() {
    return tasks.findAllByOrderByCreatedAtDesc().stream().filter(task->!Boolean.TRUE.equals(task.getConvertedToAgenda())).map(this::map).toList();
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  @Transactional
  TaskResponse create(@Valid @RequestBody TaskRequest request) {
    var entity = new TaskEntity();
    apply(entity, request);
    entity = tasks.save(entity);
    record(entity, "TASK_CREATED", "Tarefa criada: " + entity.getTitle());
    return map(entity);
  }

  @PutMapping("/{id}")
  @Transactional
  TaskResponse update(@PathVariable UUID id, @Valid @RequestBody TaskRequest request) {
    var entity = find(id);
    apply(entity, request);
    entity = tasks.save(entity);
    record(entity, "TASK_UPDATED", "Tarefa atualizada: " + entity.getTitle());
    return map(entity);
  }

  @PatchMapping("/{id}/status")
  @Transactional
  TaskResponse status(@PathVariable UUID id, @Valid @RequestBody UpdateStatusRequest request) {
    var entity = find(id);
    entity.setStatus(TaskStatus.fromLabel(request.status()));
    entity = tasks.save(entity);
    record(entity, entity.getStatus() == TaskStatus.DONE ? "TASK_COMPLETED" : "TASK_STATUS_CHANGED", "Status alterado para " + entity.getStatus().label + ": " + entity.getTitle());
    return map(entity);
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
    entity.setWorkspace(request.projectId() == null ? null : workspaces.findById(request.projectId())
        .orElseThrow(() -> new IllegalArgumentException("Workspace não encontrado.")));
    entity.setContext(defaultText(request.context(), "Pessoal"));
    entity.setDurationMinutes(request.durationMinutes() == null ? 30 : request.durationMinutes());
    entity.setPriority(defaultText(request.priority(), "Média"));
    entity.setDueDate(request.dueDate());
  }

  private void record(TaskEntity task, String action, String description) {
    if (task.getWorkspace() == null) return;
    var event = new ActivityEventEntity();
    event.setWorkspace(task.getWorkspace());
    event.setEntityType("TASK");
    event.setEntityId(task.getId());
    event.setAction(action);
    event.setDescription(description);
    events.save(event);
  }

  private String defaultText(String value, String fallback) {
    return value == null || value.isBlank() ? fallback : value.trim();
  }

  private TaskResponse map(TaskEntity entity) {
    var project = entity.getWorkspace();
    return new TaskResponse(
        entity.getId().toString(), entity.getTitle(), project == null ? null : project.getId().toString(),
        project == null ? "Inbox" : project.getName(), entity.getContext(), entity.getDurationMinutes() + " min",
        entity.getDurationMinutes(), entity.getStatus().label, entity.getPriority(), entity.getDueDate());
  }
}
