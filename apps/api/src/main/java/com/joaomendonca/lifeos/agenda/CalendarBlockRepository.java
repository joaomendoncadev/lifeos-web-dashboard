package com.joaomendonca.lifeos.agenda;

import java.time.Instant;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CalendarBlockRepository extends JpaRepository<CalendarBlockEntity, UUID> {
  List<CalendarBlockEntity> findByStartAtGreaterThanEqualAndStartAtLessThanOrderByStartAtAsc(Instant from, Instant to);
  List<CalendarBlockEntity> findByTaskId(UUID taskId);
}
