package com.joaomendonca.lifeos.workspace; import java.util.*; import org.springframework.data.jpa.repository.JpaRepository;
public interface WorkspaceAttachmentRepository extends JpaRepository<WorkspaceAttachmentEntity,UUID>{List<WorkspaceAttachmentEntity> findAllByWorkspaceIdOrderByCreatedAtDesc(UUID workspaceId);}
