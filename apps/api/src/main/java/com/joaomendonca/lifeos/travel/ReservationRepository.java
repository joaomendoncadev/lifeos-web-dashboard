package com.joaomendonca.lifeos.travel; import java.util.*; import org.springframework.data.jpa.repository.JpaRepository;
public interface ReservationRepository extends JpaRepository<ReservationEntity,UUID>{ List<ReservationEntity> findByTripIdOrderByStartAtAsc(UUID tripId); }
