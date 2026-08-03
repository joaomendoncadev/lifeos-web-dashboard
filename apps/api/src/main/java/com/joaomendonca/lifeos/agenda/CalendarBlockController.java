package com.joaomendonca.lifeos.agenda;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.*;
import java.util.*;
import org.springframework.http.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/calendar-blocks")
public class CalendarBlockController {
  private final CalendarBlockRepository blocks;
  private final AgendaSyncService sync;

  public CalendarBlockController(CalendarBlockRepository blocks, AgendaSyncService sync) {
    this.blocks = blocks; this.sync = sync;
  }

  record Request(@NotBlank @Size(max=240) String title, @Size(max=4000) String description,
      @Pattern(regexp="FOCUS|MEETING|PERSONAL|ROUTINE|BREAK") String blockType,
      @NotNull Instant startAt, @NotNull Instant endAt, UUID taskId, UUID projectId, Boolean completed) {}
  record Response(String id, String title, String description, String blockType, Instant startAt, Instant endAt,
      String taskId, String projectId, boolean completed) {}

  @GetMapping
  List<Response> list(@RequestParam(required=false) Instant from, @RequestParam(required=false) Instant to) {
    Instant start = from == null ? LocalDate.now().minusDays(7).atStartOfDay(ZoneId.systemDefault()).toInstant() : from;
    Instant end = to == null ? LocalDate.now().plusDays(30).atStartOfDay(ZoneId.systemDefault()).toInstant() : to;
    return blocks.findByStartAtGreaterThanEqualAndStartAtLessThanOrderByStartAtAsc(start, end).stream().map(this::map).toList();
  }

  @PostMapping @ResponseStatus(HttpStatus.CREATED)
  @Transactional
  Response create(@Valid @RequestBody Request request) {
    validatePeriod(request.startAt(), request.endAt());
    var entity = new CalendarBlockEntity();
    apply(entity, request);
    entity = blocks.save(entity);
    sync.fromBlock(entity);
    return map(entity);
  }

  @PutMapping("/{id}")
  @Transactional
  Response update(@PathVariable UUID id, @Valid @RequestBody Request request) {
    validatePeriod(request.startAt(), request.endAt());
    var entity = blocks.findById(id).orElseThrow(() -> new IllegalArgumentException("Bloco de agenda não encontrado."));
    apply(entity, request);
    entity = blocks.save(entity);
    sync.fromBlock(entity);
    return map(entity);
  }

  @PatchMapping("/{id}/complete")
  @Transactional
  Response complete(@PathVariable UUID id, @RequestBody Map<String, Boolean> body) {
    var entity = blocks.findById(id).orElseThrow(() -> new IllegalArgumentException("Bloco de agenda não encontrado."));
    entity.setCompleted(Boolean.TRUE.equals(body.get("completed")));
    entity = blocks.save(entity);
    sync.fromBlock(entity);
    return map(entity);
  }

  @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
  void delete(@PathVariable UUID id) { if (!blocks.existsById(id)) throw new IllegalArgumentException("Bloco de agenda não encontrado."); blocks.deleteById(id); }

  private void validatePeriod(Instant start, Instant end) { if (!end.isAfter(start)) throw new IllegalArgumentException("O fim deve ser posterior ao início."); }
  private void apply(CalendarBlockEntity e, Request r) {
    e.setTitle(r.title().trim()); e.setDescription(r.description() == null ? "" : r.description().trim());
    e.setBlockType(r.blockType() == null ? "FOCUS" : r.blockType()); e.setStartAt(r.startAt()); e.setEndAt(r.endAt());
    e.setTaskId(r.taskId()); e.setProjectId(r.projectId()); if (r.completed() != null) e.setCompleted(r.completed());
  }

  private Response map(CalendarBlockEntity e) { return new Response(e.getId().toString(), e.getTitle(), e.getDescription(), e.getBlockType(), e.getStartAt(), e.getEndAt(), e.getTaskId()==null?null:e.getTaskId().toString(), e.getProjectId()==null?null:e.getProjectId().toString(), e.getCompleted()); }
}
