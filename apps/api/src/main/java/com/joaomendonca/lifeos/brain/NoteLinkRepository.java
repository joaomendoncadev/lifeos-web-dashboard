package com.joaomendonca.lifeos.brain;
import java.util.*;
import org.springframework.data.jpa.repository.*;
public interface NoteLinkRepository extends JpaRepository<NoteLinkEntity, UUID> {
 @EntityGraph(attributePaths={"source","source.workspace","target","target.workspace"}) List<NoteLinkEntity> findAllByTargetIdOrderByCreatedAtDesc(UUID targetId);
 @EntityGraph(attributePaths={"source","source.workspace","target","target.workspace"}) List<NoteLinkEntity> findAllBySourceIdOrderByCreatedAtDesc(UUID sourceId);
 boolean existsBySourceIdAndTargetId(UUID sourceId, UUID targetId);
 void deleteBySourceIdAndTargetId(UUID sourceId, UUID targetId);
}
