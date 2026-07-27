package com.joaomendonca.lifeos.goal;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GoalRepository extends JpaRepository<GoalEntity, UUID> {
  List<GoalEntity> findByActiveTrueOrderByDeadlineAsc();
}
