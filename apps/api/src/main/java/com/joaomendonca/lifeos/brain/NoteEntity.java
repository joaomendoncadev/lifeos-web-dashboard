package com.joaomendonca.lifeos.brain;

import com.joaomendonca.lifeos.project.ProjectEntity;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.*;
import lombok.*;

@Entity
@Table(name = "notes")
@Getter @Setter @NoArgsConstructor
public class NoteEntity {
  @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
  @Column(nullable = false, length = 220) private String title;
  @Column(nullable = false, columnDefinition = "text") private String content = "";
  @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "area_id") private AreaEntity area;
  @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "project_id") private ProjectEntity project;
  @ManyToMany(fetch = FetchType.LAZY)
  @JoinTable(name = "note_tags", joinColumns = @JoinColumn(name = "note_id"), inverseJoinColumns = @JoinColumn(name = "tag_id"))
  private Set<TagEntity> tags = new LinkedHashSet<>();
  @Column(nullable = false) private Boolean favorite = false;
  @Column(nullable = false) private Boolean archived = false;
  @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();
  @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt = OffsetDateTime.now();
  @PreUpdate void touch() { updatedAt = OffsetDateTime.now(); }
}
