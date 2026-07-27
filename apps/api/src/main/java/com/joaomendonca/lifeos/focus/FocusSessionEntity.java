package com.joaomendonca.lifeos.focus;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
import lombok.*;

@Entity
@Table(name = "focus_sessions")
@Getter @Setter @NoArgsConstructor
public class FocusSessionEntity {
  @Id @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;
  private UUID taskId;
  @Column(nullable = false)
  private String title;
  @Column(nullable = false)
  private Integer plannedMinutes = 25;
  @Column(nullable = false)
  private Integer actualMinutes = 0;
  @Column(nullable = false)
  private Boolean completed = false;
  @Column(nullable = false)
  private Instant startedAt = Instant.now();
  private Instant endedAt;
  @Column(nullable = false, updatable = false)
  private Instant createdAt = Instant.now();
}
