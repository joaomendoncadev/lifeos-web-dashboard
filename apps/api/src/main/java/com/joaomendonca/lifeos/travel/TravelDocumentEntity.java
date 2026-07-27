package com.joaomendonca.lifeos.travel;
import jakarta.persistence.*; import java.time.LocalDate; import java.util.UUID; import lombok.*;
@Entity @Table(name="trip_documents") @Getter @Setter @NoArgsConstructor
public class TravelDocumentEntity { @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id; @Column(nullable=false) private UUID tripId; @Column(nullable=false,length=180) private String name; @Column(nullable=false,length=50) private String documentType; @Column(nullable=false,length=240) private String reference=""; private LocalDate expiryDate; @Column(nullable=false) private Boolean ready=false; }
