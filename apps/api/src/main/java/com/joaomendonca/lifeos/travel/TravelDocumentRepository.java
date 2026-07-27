package com.joaomendonca.lifeos.travel; import java.util.*; import org.springframework.data.jpa.repository.JpaRepository;
public interface TravelDocumentRepository extends JpaRepository<TravelDocumentEntity,UUID>{ List<TravelDocumentEntity> findByTripIdOrderByReadyAscNameAsc(UUID tripId); }
