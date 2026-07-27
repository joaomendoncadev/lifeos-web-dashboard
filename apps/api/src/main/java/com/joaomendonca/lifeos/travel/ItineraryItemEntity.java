package com.joaomendonca.lifeos.travel;
import jakarta.persistence.*; import java.time.*; import java.util.UUID; import lombok.*;
@Entity @Table(name="trip_itinerary_items") @Getter @Setter @NoArgsConstructor
public class ItineraryItemEntity { @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id; @Column(nullable=false) private UUID tripId; @Column(nullable=false) private LocalDate itemDate; private LocalTime startTime; @Column(nullable=false,length=200) private String title; @Column(nullable=false,length=220) private String location=""; @Column(nullable=false,columnDefinition="text") private String notes=""; @Column(nullable=false) private Boolean completed=false; }
