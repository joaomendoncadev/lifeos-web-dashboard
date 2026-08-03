package com.joaomendonca.lifeos.agenda;

import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoutineDefinitionRepository extends JpaRepository<RoutineDefinitionEntity, UUID> {
  List<RoutineDefinitionEntity> findAllByOrderBySortOrderAscTitleAsc();
  List<RoutineDefinitionEntity> findByActiveTrueOrderBySortOrderAscTitleAsc();
  boolean existsByCodeIgnoreCase(String code);
}
