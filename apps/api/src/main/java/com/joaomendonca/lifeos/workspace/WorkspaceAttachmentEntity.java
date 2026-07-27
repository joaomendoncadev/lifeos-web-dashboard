package com.joaomendonca.lifeos.workspace;
import jakarta.persistence.*; import java.time.Instant; import java.util.UUID; import lombok.*;
@Entity @Table(name="workspace_attachments") @Getter @Setter @NoArgsConstructor
public class WorkspaceAttachmentEntity {
 @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
 @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="workspace_id") private WorkspaceEntity workspace;
 @Column(nullable=false,length=255) private String name;
 @Column(nullable=false,columnDefinition="text") private String url;
 private String contentType; private Long sizeBytes;
 @Column(nullable=false,updatable=false) private Instant createdAt=Instant.now();
}
