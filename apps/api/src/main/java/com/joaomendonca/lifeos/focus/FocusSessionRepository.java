package com.joaomendonca.lifeos.focus;

import java.time.Instant;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FocusSessionRepository extends JpaRepository<FocusSessionEntity, UUID> {
  List<FocusSessionEntity> findTop20ByOrderByStartedAtDesc();
  List<FocusSessionEntity> findByStartedAtBetween(Instant start, Instant end);
}
