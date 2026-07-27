package com.joaomendonca.lifeos.review;

import jakarta.persistence.*;
import java.time.*;
import java.util.UUID;
import lombok.*;

@Entity
@Table(name = "daily_reviews")
@Getter @Setter @NoArgsConstructor
public class DailyReviewEntity {
  @Id @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;
  @Column(nullable = false, unique = true)
  private LocalDate reviewDate;
  @Column(nullable = false, columnDefinition = "text")
  private String wins = "";
  @Column(nullable = false, columnDefinition = "text")
  private String blockers = "";
  @Column(nullable = false, columnDefinition = "text")
  private String tomorrow = "";
  @Column(nullable = false)
  private Integer mood = 3;
  @Column(nullable = false, updatable = false)
  private Instant createdAt = Instant.now();
  @Column(nullable = false)
  private Instant updatedAt = Instant.now();
  @PrePersist @PreUpdate void timestamps() { updatedAt = Instant.now(); }
}
