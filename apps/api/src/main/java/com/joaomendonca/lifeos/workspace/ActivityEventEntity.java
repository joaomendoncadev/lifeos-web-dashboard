package com.joaomendonca.lifeos.workspace;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.*;
@Entity @Table(name="activity_events") @Getter @Setter @NoArgsConstructor
public class ActivityEventEntity {
 @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
 @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="workspace_id") private WorkspaceEntity workspace;
 private String entityType; private UUID entityId; private String action; private String description;
 @Column(columnDefinition="jsonb") private String metadata="{}"; private OffsetDateTime createdAt=OffsetDateTime.now();
}
