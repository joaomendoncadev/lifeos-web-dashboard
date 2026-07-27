package com.joaomendonca.lifeos.workspace;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
public interface WorkspaceTemplateRepository extends JpaRepository<WorkspaceTemplateEntity, UUID> {
 List<WorkspaceTemplateEntity> findAllByActiveTrueOrderBySortOrderAsc();
 Optional<WorkspaceTemplateEntity> findByCodeAndActiveTrue(String code);
}
