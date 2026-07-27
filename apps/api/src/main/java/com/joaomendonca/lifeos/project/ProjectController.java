package com.joaomendonca.lifeos.project;

import com.joaomendonca.lifeos.task.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/projects")
public class ProjectController {
  private final ProjectRepository projects;
  private final TaskRepository tasks;
  private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM", new Locale("pt", "BR"));

  public ProjectController(ProjectRepository projects, TaskRepository tasks) {
    this.projects = projects;
    this.tasks = tasks;
  }

  record ProjectRequest(@NotBlank @Size(max = 160) String name, @Size(max = 100) String area,
                        @Size(max = 2000) String description, LocalDate deadline, String icon) {}
  record ProjectResponse(String id, String name, String area, String description, int progress,
                         String deadline, LocalDate deadlineDate, long tasks, String icon) {}

  @GetMapping
  List<ProjectResponse> list() {
    return projects.findAllByOrderByDeadlineAsc().stream().map(this::map).toList();
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  ProjectResponse create(@Valid @RequestBody ProjectRequest request) {
    var entity = new ProjectEntity();
    apply(entity, request);
    return map(projects.save(entity));
  }

  @PutMapping("/{id}")
  ProjectResponse update(@PathVariable UUID id, @Valid @RequestBody ProjectRequest request) {
    var entity = find(id);
    apply(entity, request);
    return map(projects.save(entity));
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  void delete(@PathVariable UUID id) {
    projects.delete(find(id));
  }

  private ProjectEntity find(UUID id) {
    return projects.findById(id).orElseThrow(() -> new IllegalArgumentException("Projeto não encontrado."));
  }

  private void apply(ProjectEntity entity, ProjectRequest request) {
    entity.setName(request.name().trim());
    entity.setArea(defaultText(request.area(), "Pessoal"));
    entity.setDescription(defaultText(request.description(), ""));
    entity.setDeadline(request.deadline());
    entity.setIcon(defaultText(request.icon(), "FolderKanban"));
  }

  private String defaultText(String value, String fallback) {
    return value == null || value.isBlank() ? fallback : value.trim();
  }

  private ProjectResponse map(ProjectEntity entity) {
    long total = tasks.countByProjectId(entity.getId());
    long done = tasks.countByProjectIdAndStatus(entity.getId(), TaskStatus.DONE);
    int progress = total == 0 ? 0 : (int) Math.round(done * 100.0 / total);
    return new ProjectResponse(entity.getId().toString(), entity.getName(), entity.getArea(), entity.getDescription(),
        progress, entity.getDeadline() == null ? "Sem prazo" : formatter.format(entity.getDeadline()),
        entity.getDeadline(), total, entity.getIcon());
  }
}
