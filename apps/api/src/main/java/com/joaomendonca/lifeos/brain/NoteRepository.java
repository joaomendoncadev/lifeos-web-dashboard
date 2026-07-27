package com.joaomendonca.lifeos.brain;
import java.util.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
public interface NoteRepository extends JpaRepository<NoteEntity, UUID> {
  @EntityGraph(attributePaths = {"area", "project", "tags"})
  @Query("select distinct n from NoteEntity n left join n.tags t where n.archived = :archived and (:query = '' or lower(n.title) like lower(concat('%', :query, '%')) or lower(n.content) like lower(concat('%', :query, '%')) or lower(t.name) like lower(concat('%', :query, '%'))) order by n.favorite desc, n.updatedAt desc")
  List<NoteEntity> search(@Param("query") String query, @Param("archived") boolean archived);
  @EntityGraph(attributePaths = {"area", "project", "tags"}) Optional<NoteEntity> findOneById(UUID id);
}
