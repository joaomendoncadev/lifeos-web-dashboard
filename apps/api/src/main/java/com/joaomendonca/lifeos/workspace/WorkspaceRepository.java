package com.joaomendonca.lifeos.workspace;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
public interface WorkspaceRepository extends JpaRepository<WorkspaceEntity, UUID> {
  List<WorkspaceEntity> findAllByArchivedFalseOrderByUpdatedAtDesc();
  long countByArchivedFalse();
}
