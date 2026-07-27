package com.joaomendonca.lifeos.travel; import java.util.*; import org.springframework.data.jpa.repository.JpaRepository;
public interface TripChecklistItemRepository extends JpaRepository<TripChecklistItemEntity,UUID>{ List<TripChecklistItemEntity> findByTripIdOrderByCompletedAscCategoryAscTitleAsc(UUID tripId); }
