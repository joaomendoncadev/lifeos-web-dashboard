package com.joaomendonca.lifeos.travel; import java.util.*; import org.springframework.data.jpa.repository.JpaRepository;
public interface TripRepository extends JpaRepository<TripEntity,UUID>{ List<TripEntity> findAllByOrderByStartDateAscCreatedAtDesc(); }
