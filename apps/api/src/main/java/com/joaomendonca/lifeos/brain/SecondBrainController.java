package com.joaomendonca.lifeos.brain;

import com.joaomendonca.lifeos.project.ProjectRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.OffsetDateTime;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
public class SecondBrainController {
  private final NoteRepository notes;
  private final AreaRepository areas;
  private final TagRepository tags;
  private final ProjectRepository projects;

  public SecondBrainController(NoteRepository notes, AreaRepository areas, TagRepository tags, ProjectRepository projects) {
    this.notes = notes;
    this.areas = areas;
    this.tags = tags;
    this.projects = projects;
  }

  public record AreaResponse(String id, String name, String icon) {}
  public record TagResponse(String id, String name) {}
  public record NoteRequest(
      @NotBlank @Size(max = 220) String title,
      String content,
      UUID areaId,
      UUID projectId,
      Set<@Size(max = 80) String> tags,
      Boolean favorite,
      Boolean archived) {}
  public record NoteResponse(
      String id,
      String title,
      String content,
      AreaResponse area,
      String projectId,
      String projectName,
      List<TagResponse> tags,
      boolean favorite,
      boolean archived,
      OffsetDateTime createdAt,
      OffsetDateTime updatedAt) {}

  @GetMapping("/areas")
  List<AreaResponse> listAreas() {
    return areas.findAllByOrderByNameAsc().stream().map(this::map).toList();
  }

  @PostMapping("/areas")
  @ResponseStatus(HttpStatus.CREATED)
  AreaResponse createArea(@RequestBody Map<String, String> body) {
    var name = Optional.ofNullable(body.get("name")).orElse("").trim();
    if (name.isBlank()) throw new IllegalArgumentException("Informe o nome da área.");
    if (name.length() > 100) throw new IllegalArgumentException("O nome da área deve ter até 100 caracteres.");
    return areas.findByNameIgnoreCase(name).map(this::map).orElseGet(() -> {
      var area = new AreaEntity();
      area.setName(name);
      area.setIcon(Optional.ofNullable(body.get("icon")).filter(v -> !v.isBlank()).orElse("folder"));
      return map(areas.save(area));
    });
  }

  @GetMapping("/tags")
  List<TagResponse> listTags() {
    return tags.findAllByOrderByNameAsc().stream().map(this::map).toList();
  }

  @GetMapping("/notes")
  @Transactional(readOnly = true)
  List<NoteResponse> listNotes(@RequestParam(defaultValue = "") String query,
                               @RequestParam(defaultValue = "false") boolean archived) {
    return notes.search(query.trim(), archived).stream().map(this::map).toList();
  }

  @GetMapping("/notes/{id}")
  @Transactional(readOnly = true)
  NoteResponse getNote(@PathVariable UUID id) { return map(find(id)); }

  @PostMapping("/notes")
  @ResponseStatus(HttpStatus.CREATED)
  @Transactional
  NoteResponse createNote(@Valid @RequestBody NoteRequest request) {
    var note = new NoteEntity();
    apply(note, request);
    return map(notes.save(note));
  }

  @PutMapping("/notes/{id}")
  @Transactional
  NoteResponse updateNote(@PathVariable UUID id, @Valid @RequestBody NoteRequest request) {
    var note = find(id);
    apply(note, request);
    return map(notes.save(note));
  }

  @PatchMapping("/notes/{id}/favorite")
  @Transactional
  NoteResponse favorite(@PathVariable UUID id, @RequestBody Map<String, Boolean> body) {
    var note = find(id);
    note.setFavorite(Boolean.TRUE.equals(body.get("favorite")));
    return map(notes.save(note));
  }

  @PatchMapping("/notes/{id}/archive")
  @Transactional
  NoteResponse archive(@PathVariable UUID id, @RequestBody Map<String, Boolean> body) {
    var note = find(id);
    note.setArchived(Boolean.TRUE.equals(body.get("archived")));
    return map(notes.save(note));
  }

  @DeleteMapping("/notes/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  void delete(@PathVariable UUID id) { notes.delete(find(id)); }

  private NoteEntity find(UUID id) {
    return notes.findOneById(id).orElseThrow(() -> new IllegalArgumentException("Nota não encontrada."));
  }

  private void apply(NoteEntity note, NoteRequest request) {
    note.setTitle(request.title().trim());
    note.setContent(Optional.ofNullable(request.content()).orElse(""));
    note.setArea(request.areaId() == null ? null : areas.findById(request.areaId())
        .orElseThrow(() -> new IllegalArgumentException("Área não encontrada.")));
    note.setProject(request.projectId() == null ? null : projects.findById(request.projectId())
        .orElseThrow(() -> new IllegalArgumentException("Projeto não encontrado.")));
    note.setFavorite(Boolean.TRUE.equals(request.favorite()));
    note.setArchived(Boolean.TRUE.equals(request.archived()));
    note.setTags(resolveTags(request.tags()));
  }

  private Set<TagEntity> resolveTags(Set<String> names) {
    var resolved = new LinkedHashSet<TagEntity>();
    if (names == null) return resolved;
    names.stream().filter(Objects::nonNull).map(String::trim).filter(v -> !v.isBlank()).map(v -> v.replaceFirst("^#", ""))
        .map(String::toLowerCase).distinct().limit(20).forEach(name -> resolved.add(tags.findByNameIgnoreCase(name).orElseGet(() -> {
          var tag = new TagEntity(); tag.setName(name); return tags.save(tag);
        })));
    return resolved;
  }

  private AreaResponse map(AreaEntity area) { return new AreaResponse(area.getId().toString(), area.getName(), area.getIcon()); }
  private TagResponse map(TagEntity tag) { return new TagResponse(tag.getId().toString(), tag.getName()); }
  private NoteResponse map(NoteEntity note) {
    return new NoteResponse(
        note.getId().toString(), note.getTitle(), note.getContent(), note.getArea() == null ? null : map(note.getArea()),
        note.getProject() == null ? null : note.getProject().getId().toString(),
        note.getProject() == null ? null : note.getProject().getName(),
        note.getTags().stream().sorted(Comparator.comparing(TagEntity::getName)).map(this::map).toList(),
        Boolean.TRUE.equals(note.getFavorite()), Boolean.TRUE.equals(note.getArchived()), note.getCreatedAt(), note.getUpdatedAt());
  }
}
