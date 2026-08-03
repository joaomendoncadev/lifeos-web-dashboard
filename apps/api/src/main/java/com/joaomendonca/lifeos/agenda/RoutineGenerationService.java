package com.joaomendonca.lifeos.agenda;

import java.time.*;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RoutineGenerationService {
  private static final ZoneId ZONE = ZoneId.of("America/Sao_Paulo");
  private final RoutineDefinitionRepository routines;
  private final CalendarBlockRepository blocks;

  public RoutineGenerationService(RoutineDefinitionRepository routines, CalendarBlockRepository blocks) {
    this.routines = routines;
    this.blocks = blocks;
  }

  /**
   * Materializa as rotinas no intervalo solicitado de forma idempotente.
   *
   * A inserção usa ON CONFLICT DO NOTHING porque a agenda pode ser carregada por
   * mais de uma requisição ao mesmo tempo. Uma consulta seguida de save não é
   * suficiente para evitar a corrida entre essas requisições.
   */
  @Transactional
  public int ensureRange(Instant from, Instant to) {
    if (from == null || to == null || !to.isAfter(from)) return 0;

    LocalDate first = from.atZone(ZONE).toLocalDate();
    LocalDate last = to.minusMillis(1).atZone(ZONE).toLocalDate();
    int created = 0;

    for (var routine : routines.findByActiveTrueOrderBySortOrderAscTitleAsc()) {
      Set<Integer> days = parseDays(routine.getDaysOfWeek());
      for (LocalDate date = first; !date.isAfter(last); date = date.plusDays(1)) {
        if (!days.contains(date.getDayOfWeek().getValue())) continue;

        Instant dayStart = date.atStartOfDay(ZONE).toInstant();
        Instant dayEnd = date.plusDays(1).atStartOfDay(ZONE).toInstant();
        String recurrenceKey = "routine:" + routine.getCode() + ":" + date;

        // Preserva ocorrências antigas, criadas antes de existir recurrence_key.
        if (blocks.findFirstByTitleIgnoreCaseAndStartAtGreaterThanEqualAndStartAtLessThan(
            routine.getTitle(), dayStart, dayEnd).isPresent()) {
          continue;
        }

        Instant start = ZonedDateTime.of(date, routine.getStartTime(), ZONE).toInstant();
        Instant end = ZonedDateTime.of(date, routine.getEndTime(), ZONE).toInstant();

        created += blocks.insertRoutineBlockIfAbsent(
            UUID.randomUUID(),
            routine.getTitle(),
            Optional.ofNullable(routine.getDescription()).orElse(""),
            routine.getBlockType(),
            start,
            end,
            recurrenceKey,
            routine.getDomain());
      }
    }
    return created;
  }

  private Set<Integer> parseDays(String value) {
    Set<Integer> result = new LinkedHashSet<>();
    if (value == null) return result;
    for (String part : value.split(",")) {
      try {
        int day = Integer.parseInt(part.trim());
        if (day >= 1 && day <= 7) result.add(day);
      } catch (NumberFormatException ignored) {
        // Uma definição inválida não impede a geração das demais rotinas.
      }
    }
    return result;
  }
}
