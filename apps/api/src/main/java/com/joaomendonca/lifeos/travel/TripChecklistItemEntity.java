package com.joaomendonca.lifeos.travel;
import jakarta.persistence.*; import java.util.UUID; import lombok.*;
@Entity @Table(name="trip_checklist_items") @Getter @Setter @NoArgsConstructor
public class TripChecklistItemEntity { @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id; @Column(nullable=false) private UUID tripId; @Column(nullable=false,length=200) private String title; @Column(nullable=false,length=80) private String category="Geral"; @Column(nullable=false) private Boolean completed=false; }
