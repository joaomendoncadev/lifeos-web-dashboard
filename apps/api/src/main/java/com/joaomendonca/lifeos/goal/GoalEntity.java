package com.joaomendonca.lifeos.goal;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.UUID;
import lombok.*;

@Entity
@Table(name = "goals")
@Getter @Setter @NoArgsConstructor
public class GoalEntity {
  @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
  @Column(nullable = false, length = 180) private String title;
  @Column(length = 100) private String area = "Pessoal";
  @Column(length = 1200) private String description = "";
  @Column(nullable = false) private Integer progress = 0;
  private LocalDate deadline;
  @Column(nullable = false) private Boolean active = true;
}
