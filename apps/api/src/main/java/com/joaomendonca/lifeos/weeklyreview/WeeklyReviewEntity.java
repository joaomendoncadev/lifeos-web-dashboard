package com.joaomendonca.lifeos.weeklyreview;

import jakarta.persistence.*;
import java.time.*;
import java.util.UUID;
import lombok.*;

@Entity
@Table(name="weekly_reviews")
@Getter @Setter @NoArgsConstructor
public class WeeklyReviewEntity {
  @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
  @Column(nullable=false, unique=true) private LocalDate weekStart;
  @Column(nullable=false, columnDefinition="text") private String highlights="";
  @Column(nullable=false, columnDefinition="text") private String challenges="";
  @Column(nullable=false, columnDefinition="text") private String lessons="";
  @Column(nullable=false, columnDefinition="text") private String nextWeekPriorities="";
  @Column(nullable=false) private Integer energy=3;
  @Column(nullable=false, updatable=false) private Instant createdAt=Instant.now();
  @Column(nullable=false) private Instant updatedAt=Instant.now();
  @PreUpdate void preUpdate(){updatedAt=Instant.now();}
}
