package com.joaomendonca.lifeos.brain;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
public interface AreaRepository extends JpaRepository<AreaEntity, UUID> { List<AreaEntity> findAllByOrderByNameAsc(); Optional<AreaEntity> findByNameIgnoreCase(String name); }
