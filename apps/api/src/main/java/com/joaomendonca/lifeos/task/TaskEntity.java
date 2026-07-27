package com.joaomendonca.lifeos.task;

import com.joaomendonca.lifeos.project.ProjectEntity;
import jakarta.persistence.*;
import java.time.*;
import java.util.UUID;
import lombok.*;

@Entity
@Table(name = "tasks")
@Getter @Setter @NoArgsConstructor
public class TaskEntity {
  @Id @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;
  @Column(nullable = false)
  private String title;
  @Enumerated(EnumType.STRING) @Column(nullable = false)
  private TaskStatus status = TaskStatus.INBOX;
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "project_id")
  private ProjectEntity project;
  @Column(name = "project_name")
  private String projectName = "Inbox";
  private String context = "Pessoal";
  private Integer durationMinutes = 30;
  private String priority = "Média";
  private LocalDate dueDate;
  @Column(nullable = false, updatable = false)
  private Instant createdAt = Instant.now();
  @Column(nullable = false)
  private Instant updatedAt = Instant.now();

  @PrePersist @PreUpdate
  void sync() {
    updatedAt = Instant.now();
    projectName = project == null ? "Inbox" : project.getName();
  }
}
