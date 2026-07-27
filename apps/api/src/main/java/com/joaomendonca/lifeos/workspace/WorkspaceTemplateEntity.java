package com.joaomendonca.lifeos.workspace;
import jakarta.persistence.*;
import java.util.UUID;
import lombok.*;
@Entity @Table(name="workspace_templates") @Getter @Setter @NoArgsConstructor
public class WorkspaceTemplateEntity {
 @Id private UUID id; @Column(nullable=false,unique=true) private String code; @Column(nullable=false) private String name;
 @Column(nullable=false,length=500) private String description; @Enumerated(EnumType.STRING) private WorkspaceType workspaceType;
 private String icon; private String color; @Column(columnDefinition="jsonb") private String defaultMetadata; private Integer sortOrder; private Boolean active;
}
