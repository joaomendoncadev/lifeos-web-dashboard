package com.joaomendonca.lifeos.agenda;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
import lombok.*;

@Entity
@Table(name = "calendar_blocks")
@Getter @Setter @NoArgsConstructor
public class CalendarBlockEntity {
  @Id @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;
  @Column(nullable = false) private String title;
  @Column(columnDefinition = "text") private String description = "";
  @Column(nullable = false) private String blockType = "FOCUS";
  @Column(nullable = false) private Instant startAt;
  @Column(nullable = false) private Instant endAt;
  private UUID taskId;
  private UUID projectId;
  @Column(unique = true) private String recurrenceKey;
  @Column(nullable = false) private Boolean completed = false;
  @Column(nullable = false) private String lifecycleStatus = "PLANNED";
  @Column(nullable = false) private String domain = "PERSONAL";
  @Column(nullable = false) private Boolean integrationSynced = false;
  @Column(nullable = false) private Boolean suppressed = false;
  @Column(nullable = false, updatable = false) private Instant createdAt = Instant.now();
  @Column(nullable = false) private Instant updatedAt = Instant.now();
  @PreUpdate void preUpdate() { updatedAt = Instant.now(); }
}
