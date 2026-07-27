package com.joaomendonca.lifeos.task;

import java.util.*;
import java.time.LocalDate;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

public interface TaskRepository extends JpaRepository<TaskEntity, UUID> {
  @EntityGraph(attributePaths = "workspace")
  List<TaskEntity> findAllByOrderByCreatedAtDesc();

  @EntityGraph(attributePaths = "workspace")
  Optional<TaskEntity> findOneById(UUID id);

  long countByStatusNot(TaskStatus status);
  long countByStatus(TaskStatus status);
  @Query(value="select count(*) from tasks where project_id = :projectId", nativeQuery=true)
  long countByProjectId(@Param("projectId") UUID projectId);
  @Query(value="select count(*) from tasks where project_id = :projectId and status = :#{#status.name()}", nativeQuery=true)
  long countByProjectIdAndStatus(@Param("projectId") UUID projectId, @Param("status") TaskStatus status);
  List<TaskEntity> findAllByWorkspaceIdOrderByCreatedAtDesc(UUID workspaceId);
  long countByWorkspaceId(UUID workspaceId);
  long countByWorkspaceIdAndStatus(UUID workspaceId, TaskStatus status);
  @Query("select count(t) from TaskEntity t where t.workspace.id = :workspaceId and t.status <> com.joaomendonca.lifeos.task.TaskStatus.DONE and t.dueDate < :today")
  long countOverdueByWorkspace(@Param("workspaceId") UUID workspaceId, @Param("today") LocalDate today);
}
