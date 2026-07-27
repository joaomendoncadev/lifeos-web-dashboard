package com.joaomendonca.lifeos.workspace;
import java.time.OffsetDateTime;
import java.util.*;
import org.springframework.data.jpa.repository.*;
public interface ActivityEventRepository extends JpaRepository<ActivityEventEntity, UUID> {
 @EntityGraph(attributePaths="workspace") List<ActivityEventEntity> findAllByWorkspaceIdOrderByCreatedAtDesc(UUID workspaceId);
 long countByWorkspaceIdAndCreatedAtAfter(UUID workspaceId, OffsetDateTime createdAt);
}
