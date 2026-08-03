package com.joaomendonca.lifeos.agenda;

import java.time.Instant;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CalendarBlockRepository extends JpaRepository<CalendarBlockEntity, UUID> {
  @Query("""
      select b from CalendarBlockEntity b
      where b.startAt >= :from and b.startAt < :to
        and b.suppressed = false
      order by b.startAt asc
      """)
  List<CalendarBlockEntity> findByStartAtGreaterThanEqualAndStartAtLessThanOrderByStartAtAsc(
      @Param("from") Instant from, @Param("to") Instant to);
  Optional<CalendarBlockEntity> findFirstByTitleIgnoreCaseAndStartAtGreaterThanEqualAndStartAtLessThan(String title, Instant from, Instant to);
  boolean existsByRecurrenceKey(String recurrenceKey);

  @Modifying(flushAutomatically = true, clearAutomatically = true)
  @Query(value = """
      INSERT INTO calendar_blocks (
        id, title, description, block_type, start_at, end_at, task_id, project_id,
        recurrence_key, completed, lifecycle_status, domain, integration_synced,
        created_at, updated_at
      ) VALUES (
        :id, :title, :description, :blockType, :startAt, :endAt, NULL, NULL,
        :recurrenceKey, FALSE, 'PLANNED', :domain, FALSE, NOW(), NOW()
      )
      ON CONFLICT DO NOTHING
      """, nativeQuery = true)
  int insertRoutineBlockIfAbsent(
      @Param("id") UUID id,
      @Param("title") String title,
      @Param("description") String description,
      @Param("blockType") String blockType,
      @Param("startAt") Instant startAt,
      @Param("endAt") Instant endAt,
      @Param("recurrenceKey") String recurrenceKey,
      @Param("domain") String domain);
}
