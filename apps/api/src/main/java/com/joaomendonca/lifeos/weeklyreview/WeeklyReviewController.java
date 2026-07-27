package com.joaomendonca.lifeos.weeklyreview;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.*;
import java.time.temporal.TemporalAdjusters;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/weekly-reviews")
public class WeeklyReviewController {
  private final WeeklyReviewRepository reviews;
  public WeeklyReviewController(WeeklyReviewRepository reviews){this.reviews=reviews;}
  record Request(@Size(max=8000) String highlights,@Size(max=8000) String challenges,@Size(max=8000) String lessons,@Size(max=8000) String nextWeekPriorities,@Min(1) @Max(5) Integer energy){}
  record Response(String id, LocalDate weekStart,String highlights,String challenges,String lessons,String nextWeekPriorities,int energy){}

  @GetMapping("/current") Response current(){ return reviews.findByWeekStart(currentWeek()).map(this::map).orElse(null); }
  @PutMapping("/current") Response save(@Valid @RequestBody Request r){
    var e=reviews.findByWeekStart(currentWeek()).orElseGet(WeeklyReviewEntity::new); e.setWeekStart(currentWeek());
    e.setHighlights(clean(r.highlights())); e.setChallenges(clean(r.challenges())); e.setLessons(clean(r.lessons())); e.setNextWeekPriorities(clean(r.nextWeekPriorities())); e.setEnergy(r.energy()==null?3:r.energy());
    return map(reviews.save(e));
  }
  private LocalDate currentWeek(){return LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));}
  private String clean(String value){return value==null?"":value.trim();}
  private Response map(WeeklyReviewEntity e){return new Response(e.getId().toString(),e.getWeekStart(),e.getHighlights(),e.getChallenges(),e.getLessons(),e.getNextWeekPriorities(),e.getEnergy());}
}
