package com.joaomendonca.lifeos.agenda;

import jakarta.persistence.*;
import java.time.*;
import java.util.UUID;
import lombok.*;

@Entity
@Table(name = "routine_definitions")
@Getter @Setter @NoArgsConstructor
public class RoutineDefinitionEntity {
  @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
  @Column(nullable=false, unique=true, length=80) private String code;
  @Column(nullable=false, length=240) private String title;
  @Column(nullable=false, columnDefinition="text") private String description="";
  @Column(nullable=false, length=20) private String blockType="ROUTINE";
  @Column(nullable=false, length=20) private String domain="PERSONAL";
  @Column(nullable=false, length=40) private String daysOfWeek;
  @Column(nullable=false) private LocalTime startTime;
  @Column(nullable=false) private LocalTime endTime;
  @Column(nullable=false) private Boolean active=true;
  @Column(nullable=false) private Integer sortOrder=0;
  @Column(nullable=false, updatable=false) private Instant createdAt=Instant.now();
  @Column(nullable=false) private Instant updatedAt=Instant.now();
  @PreUpdate void preUpdate(){updatedAt=Instant.now();}
}
