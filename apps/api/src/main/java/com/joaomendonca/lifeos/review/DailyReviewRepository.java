package com.joaomendonca.lifeos.review;

import java.time.LocalDate;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DailyReviewRepository extends JpaRepository<DailyReviewEntity, UUID> {
  Optional<DailyReviewEntity> findByReviewDate(LocalDate reviewDate);
  List<DailyReviewEntity> findTop14ByOrderByReviewDateDesc();
}
