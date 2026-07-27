package com.joaomendonca.lifeos.workspace; import java.util.*; import org.springframework.data.jpa.repository.JpaRepository;
public interface WorkspaceChecklistItemRepository extends JpaRepository<WorkspaceChecklistItemEntity,UUID>{List<WorkspaceChecklistItemEntity> findAllByWorkspaceIdOrderByPositionAscCreatedAtAsc(UUID workspaceId);}
