package com.joaomendonca.lifeos.task;

import java.util.*;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<TaskEntity, UUID> {
  @EntityGraph(attributePaths = "project")
  List<TaskEntity> findAllByOrderByCreatedAtDesc();

  @EntityGraph(attributePaths = "project")
  Optional<TaskEntity> findOneById(UUID id);

  long countByStatusNot(TaskStatus status);
  long countByStatus(TaskStatus status);
  long countByProjectId(UUID projectId);
  long countByProjectIdAndStatus(UUID projectId, TaskStatus status);
}
