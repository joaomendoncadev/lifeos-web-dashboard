package com.joaomendonca.lifeos.workspace;

import jakarta.persistence.*;
import java.time.*;
import java.util.UUID;
import lombok.*;

@Entity
@Table(name = "workspaces")
@Getter @Setter @NoArgsConstructor
public class WorkspaceEntity {
  @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
  @Column(nullable = false, length = 160) private String name;
  @Column(nullable = false, columnDefinition = "text") private String description = "";
  @Enumerated(EnumType.STRING) @Column(nullable = false) private WorkspaceType type = WorkspaceType.PROJECT;
  @Column(nullable = false, length = 100) private String area = "Pessoal";
  @Column(nullable = false, length = 80) private String icon = "FolderKanban";
  @Column(nullable = false, length = 30) private String color = "green";
  @Column(nullable = false, length = 30) private String status = "ACTIVE";
  private LocalDate startDate;
  private LocalDate dueDate;
  @Column(nullable = false, columnDefinition = "jsonb") private String metadata = "{}";
  @Column(nullable = false) private Boolean archived = false;
  @Column(nullable = false, updatable = false) private OffsetDateTime createdAt = OffsetDateTime.now();
  @Column(nullable = false) private OffsetDateTime updatedAt = OffsetDateTime.now();
  @PreUpdate void touch(){ updatedAt = OffsetDateTime.now(); }
}
