package com.joaomendonca.lifeos.brain;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
public interface TagRepository extends JpaRepository<TagEntity, UUID> { List<TagEntity> findAllByOrderByNameAsc(); Optional<TagEntity> findByNameIgnoreCase(String name); }
