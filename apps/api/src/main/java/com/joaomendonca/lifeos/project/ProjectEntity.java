package com.joaomendonca.lifeos.project;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.UUID;
import lombok.*;

@Entity
@Table(name = "projects")
@Getter @Setter @NoArgsConstructor
public class ProjectEntity {
  @Id @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;
  @Column(nullable = false)
  private String name;
  private String area;
  @Column(columnDefinition = "text")
  private String description;
  private Integer progress = 0;
  private LocalDate deadline;
  private Integer taskCount = 0;
  private String icon = "FolderKanban";
}
