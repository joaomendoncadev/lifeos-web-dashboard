package com.joaomendonca.lifeos.weeklyreview;
import java.time.LocalDate;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
public interface WeeklyReviewRepository extends JpaRepository<WeeklyReviewEntity, UUID> { Optional<WeeklyReviewEntity> findByWeekStart(LocalDate weekStart); }
