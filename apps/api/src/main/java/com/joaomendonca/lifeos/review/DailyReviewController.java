package com.joaomendonca.lifeos.review;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.util.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/reviews")
public class DailyReviewController {
  private final DailyReviewRepository reviews;
  public DailyReviewController(DailyReviewRepository reviews) { this.reviews = reviews; }

  record Request(LocalDate reviewDate, @Size(max = 4000) String wins, @Size(max = 4000) String blockers,
                 @Size(max = 4000) String tomorrow, @Min(1) @Max(5) Integer mood) {}
  record Response(String id, LocalDate reviewDate, String wins, String blockers, String tomorrow, int mood) {}

  @GetMapping("/today")
  Response today() { return reviews.findByReviewDate(LocalDate.now()).map(this::map).orElse(null); }

  @GetMapping
  List<Response> list() { return reviews.findTop14ByOrderByReviewDateDesc().stream().map(this::map).toList(); }

  @PutMapping("/today")
  Response save(@Valid @RequestBody Request request) {
    var date = request.reviewDate() == null ? LocalDate.now() : request.reviewDate();
    var entity = reviews.findByReviewDate(date).orElseGet(DailyReviewEntity::new);
    entity.setReviewDate(date);
    entity.setWins(text(request.wins()));
    entity.setBlockers(text(request.blockers()));
    entity.setTomorrow(text(request.tomorrow()));
    entity.setMood(request.mood() == null ? 3 : request.mood());
    return map(reviews.save(entity));
  }

  private String text(String value) { return value == null ? "" : value.trim(); }
  private Response map(DailyReviewEntity e) { return new Response(e.getId().toString(), e.getReviewDate(), e.getWins(), e.getBlockers(), e.getTomorrow(), e.getMood()); }
}
