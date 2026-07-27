package com.joaomendonca.lifeos.travel;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.*;
import org.springframework.http.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/trips")
public class TravelController {
  private final TripRepository trips; private final ItineraryItemRepository itinerary; private final ReservationRepository reservations;
  private final TravelDocumentRepository documents; private final TripChecklistItemRepository checklist; private final TripExpenseRepository expenses;
  public TravelController(TripRepository trips, ItineraryItemRepository itinerary, ReservationRepository reservations, TravelDocumentRepository documents, TripChecklistItemRepository checklist, TripExpenseRepository expenses){this.trips=trips;this.itinerary=itinerary;this.reservations=reservations;this.documents=documents;this.checklist=checklist;this.expenses=expenses;}

  record TripRequest(@NotBlank @Size(max=180) String name,@NotBlank @Size(max=180) String destination,LocalDate startDate,LocalDate endDate,@Size(max=30) String status,@Pattern(regexp="[A-Z]{3}") String currency,@DecimalMin("0") BigDecimal budget,String notes,@Size(max=16) String coverEmoji){}
  record TripResponse(String id,String name,String destination,LocalDate startDate,LocalDate endDate,String status,String currency,BigDecimal budget,BigDecimal spent,String notes,String coverEmoji,int itineraryCount,int reservationCount,int documentCount,int checklistDone,int checklistTotal){}
  record ItineraryRequest(@NotNull LocalDate itemDate,LocalTime startTime,@NotBlank @Size(max=200) String title,@Size(max=220) String location,String notes,Boolean completed){}
  record ReservationRequest(@NotBlank String reservationType,@NotBlank @Size(max=160) String provider,@Size(max=100) String confirmationCode,OffsetDateTime startAt,OffsetDateTime endAt,@DecimalMin("0") BigDecimal amount,String notes){}
  record DocumentRequest(@NotBlank @Size(max=180) String name,@NotBlank @Size(max=50) String documentType,@Size(max=240) String reference,LocalDate expiryDate,Boolean ready){}
  record ChecklistRequest(@NotBlank @Size(max=200) String title,@Size(max=80) String category,Boolean completed){}
  record ExpenseRequest(@NotBlank @Size(max=200) String description,@Size(max=80) String category,@NotNull @DecimalMin("0.01") BigDecimal amount,@NotNull LocalDate expenseDate,Boolean paid){}
  record TripDetails(TripResponse trip,List<ItineraryItemEntity> itinerary,List<ReservationEntity> reservations,List<TravelDocumentEntity> documents,List<TripChecklistItemEntity> checklist,List<TripExpenseEntity> expenses){}

  @GetMapping List<TripResponse> list(){return trips.findAllByOrderByStartDateAscCreatedAtDesc().stream().map(this::map).toList();}
  @GetMapping("/{id}") TripDetails details(@PathVariable UUID id){var t=findTrip(id);return new TripDetails(map(t),itinerary.findByTripIdOrderByItemDateAscStartTimeAsc(id),reservations.findByTripIdOrderByStartAtAsc(id),documents.findByTripIdOrderByReadyAscNameAsc(id),checklist.findByTripIdOrderByCompletedAscCategoryAscTitleAsc(id),expenses.findByTripIdOrderByExpenseDateDesc(id));}
  @PostMapping @ResponseStatus(HttpStatus.CREATED) TripResponse create(@Valid @RequestBody TripRequest r){var e=new TripEntity();apply(e,r);return map(trips.save(e));}
  @PutMapping("/{id}") TripResponse update(@PathVariable UUID id,@Valid @RequestBody TripRequest r){var e=findTrip(id);apply(e,r);return map(trips.save(e));}
  @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) void delete(@PathVariable UUID id){trips.delete(findTrip(id));}

  @PostMapping("/{tripId}/itinerary") @ResponseStatus(HttpStatus.CREATED) ItineraryItemEntity addItinerary(@PathVariable UUID tripId,@Valid @RequestBody ItineraryRequest r){ensureTrip(tripId);var e=new ItineraryItemEntity();e.setTripId(tripId);e.setItemDate(r.itemDate());e.setStartTime(r.startTime());e.setTitle(r.title().trim());e.setLocation(text(r.location(),""));e.setNotes(text(r.notes(),""));e.setCompleted(Boolean.TRUE.equals(r.completed()));return itinerary.save(e);}
  @PatchMapping("/{tripId}/itinerary/{id}/toggle") ItineraryItemEntity toggleItinerary(@PathVariable UUID tripId,@PathVariable UUID id){var e=itinerary.findById(id).filter(x->x.getTripId().equals(tripId)).orElseThrow(()->new IllegalArgumentException("Item do roteiro não encontrado."));e.setCompleted(!Boolean.TRUE.equals(e.getCompleted()));return itinerary.save(e);}
  @DeleteMapping("/{tripId}/itinerary/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) void deleteItinerary(@PathVariable UUID tripId,@PathVariable UUID id){itinerary.delete(itinerary.findById(id).filter(x->x.getTripId().equals(tripId)).orElseThrow(()->new IllegalArgumentException("Item do roteiro não encontrado.")));}

  @PostMapping("/{tripId}/reservations") @ResponseStatus(HttpStatus.CREATED) ReservationEntity addReservation(@PathVariable UUID tripId,@Valid @RequestBody ReservationRequest r){ensureTrip(tripId);var e=new ReservationEntity();e.setTripId(tripId);e.setReservationType(r.reservationType().trim());e.setProvider(r.provider().trim());e.setConfirmationCode(text(r.confirmationCode(),""));e.setStartAt(r.startAt());e.setEndAt(r.endAt());e.setAmount(r.amount()==null?BigDecimal.ZERO:r.amount());e.setNotes(text(r.notes(),""));return reservations.save(e);}
  @DeleteMapping("/{tripId}/reservations/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) void deleteReservation(@PathVariable UUID tripId,@PathVariable UUID id){reservations.delete(reservations.findById(id).filter(x->x.getTripId().equals(tripId)).orElseThrow(()->new IllegalArgumentException("Reserva não encontrada.")));}

  @PostMapping("/{tripId}/documents") @ResponseStatus(HttpStatus.CREATED) TravelDocumentEntity addDocument(@PathVariable UUID tripId,@Valid @RequestBody DocumentRequest r){ensureTrip(tripId);var e=new TravelDocumentEntity();e.setTripId(tripId);e.setName(r.name().trim());e.setDocumentType(r.documentType().trim());e.setReference(text(r.reference(),""));e.setExpiryDate(r.expiryDate());e.setReady(Boolean.TRUE.equals(r.ready()));return documents.save(e);}
  @PatchMapping("/{tripId}/documents/{id}/toggle") TravelDocumentEntity toggleDocument(@PathVariable UUID tripId,@PathVariable UUID id){var e=documents.findById(id).filter(x->x.getTripId().equals(tripId)).orElseThrow(()->new IllegalArgumentException("Documento não encontrado."));e.setReady(!Boolean.TRUE.equals(e.getReady()));return documents.save(e);}
  @DeleteMapping("/{tripId}/documents/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) void deleteDocument(@PathVariable UUID tripId,@PathVariable UUID id){documents.delete(documents.findById(id).filter(x->x.getTripId().equals(tripId)).orElseThrow(()->new IllegalArgumentException("Documento não encontrado.")));}

  @PostMapping("/{tripId}/checklist") @ResponseStatus(HttpStatus.CREATED) TripChecklistItemEntity addChecklist(@PathVariable UUID tripId,@Valid @RequestBody ChecklistRequest r){ensureTrip(tripId);var e=new TripChecklistItemEntity();e.setTripId(tripId);e.setTitle(r.title().trim());e.setCategory(text(r.category(),"Geral"));e.setCompleted(Boolean.TRUE.equals(r.completed()));return checklist.save(e);}
  @PatchMapping("/{tripId}/checklist/{id}/toggle") TripChecklistItemEntity toggleChecklist(@PathVariable UUID tripId,@PathVariable UUID id){var e=checklist.findById(id).filter(x->x.getTripId().equals(tripId)).orElseThrow(()->new IllegalArgumentException("Item da checklist não encontrado."));e.setCompleted(!Boolean.TRUE.equals(e.getCompleted()));return checklist.save(e);}
  @DeleteMapping("/{tripId}/checklist/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) void deleteChecklist(@PathVariable UUID tripId,@PathVariable UUID id){checklist.delete(checklist.findById(id).filter(x->x.getTripId().equals(tripId)).orElseThrow(()->new IllegalArgumentException("Item da checklist não encontrado.")));}

  @PostMapping("/{tripId}/expenses") @ResponseStatus(HttpStatus.CREATED) TripExpenseEntity addExpense(@PathVariable UUID tripId,@Valid @RequestBody ExpenseRequest r){ensureTrip(tripId);var e=new TripExpenseEntity();e.setTripId(tripId);e.setDescription(r.description().trim());e.setCategory(text(r.category(),"Outros"));e.setAmount(r.amount());e.setExpenseDate(r.expenseDate());e.setPaid(r.paid()==null||r.paid());return expenses.save(e);}
  @DeleteMapping("/{tripId}/expenses/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) void deleteExpense(@PathVariable UUID tripId,@PathVariable UUID id){expenses.delete(expenses.findById(id).filter(x->x.getTripId().equals(tripId)).orElseThrow(()->new IllegalArgumentException("Despesa não encontrada.")));}

  private void apply(TripEntity e,TripRequest r){if(r.startDate()!=null&&r.endDate()!=null&&r.endDate().isBefore(r.startDate()))throw new IllegalArgumentException("A data final deve ser posterior à data inicial.");e.setName(r.name().trim());e.setDestination(r.destination().trim());e.setStartDate(r.startDate());e.setEndDate(r.endDate());e.setStatus(text(r.status(),"PLANNING").toUpperCase());e.setCurrency(text(r.currency(),"BRL").toUpperCase());e.setBudget(r.budget()==null?BigDecimal.ZERO:r.budget());e.setNotes(text(r.notes(),""));e.setCoverEmoji(text(r.coverEmoji(),"✈️"));}
  private TripResponse map(TripEntity e){var id=e.getId();var all=checklist.findByTripIdOrderByCompletedAscCategoryAscTitleAsc(id);return new TripResponse(id.toString(),e.getName(),e.getDestination(),e.getStartDate(),e.getEndDate(),e.getStatus(),e.getCurrency(),e.getBudget(),expenses.totalByTripId(id),e.getNotes(),e.getCoverEmoji(),itinerary.findByTripIdOrderByItemDateAscStartTimeAsc(id).size(),reservations.findByTripIdOrderByStartAtAsc(id).size(),documents.findByTripIdOrderByReadyAscNameAsc(id).size(),(int)all.stream().filter(x->Boolean.TRUE.equals(x.getCompleted())).count(),all.size());}
  private TripEntity findTrip(UUID id){return trips.findById(id).orElseThrow(()->new IllegalArgumentException("Viagem não encontrada."));}
  private void ensureTrip(UUID id){findTrip(id);} private String text(String v,String fallback){return v==null||v.isBlank()?fallback:v.trim();}
}
