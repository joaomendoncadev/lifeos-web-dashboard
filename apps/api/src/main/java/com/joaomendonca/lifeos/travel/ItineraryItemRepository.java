package com.joaomendonca.lifeos.travel; import java.util.*; import org.springframework.data.jpa.repository.JpaRepository;
public interface ItineraryItemRepository extends JpaRepository<ItineraryItemEntity,UUID>{ List<ItineraryItemEntity> findByTripIdOrderByItemDateAscStartTimeAsc(UUID tripId); }
