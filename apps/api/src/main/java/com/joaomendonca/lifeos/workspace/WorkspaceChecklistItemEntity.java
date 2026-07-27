package com.joaomendonca.lifeos.workspace;
import jakarta.persistence.*; import java.time.Instant; import java.util.UUID; import lombok.*;
@Entity @Table(name="workspace_checklist_items") @Getter @Setter @NoArgsConstructor
public class WorkspaceChecklistItemEntity {
 @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
 @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="workspace_id") private WorkspaceEntity workspace;
 @Column(nullable=false,length=220) private String title;
 @Column(nullable=false) private Boolean completed=false;
 @Column(nullable=false) private Integer position=0;
 @Column(nullable=false,updatable=false) private Instant createdAt=Instant.now();
 @Column(nullable=false) private Instant updatedAt=Instant.now();
 @PreUpdate void touch(){updatedAt=Instant.now();}
}
