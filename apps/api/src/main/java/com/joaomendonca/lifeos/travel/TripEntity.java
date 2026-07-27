package com.joaomendonca.lifeos.travel;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.UUID;
import lombok.*;

@Entity @Table(name="trips")
@Getter @Setter @NoArgsConstructor
public class TripEntity {
  @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
  @Column(nullable=false,length=180) private String name;
  @Column(nullable=false,length=180) private String destination;
  private LocalDate startDate;
  private LocalDate endDate;
  @Column(nullable=false,length=30) private String status="PLANNING";
  @Column(nullable=false,length=3) private String currency="BRL";
  @Column(nullable=false,precision=14,scale=2) private BigDecimal budget=BigDecimal.ZERO;
  @Column(nullable=false,columnDefinition="text") private String notes="";
  @Column(nullable=false,length=16) private String coverEmoji="✈️";
  @Column(nullable=false,updatable=false) private OffsetDateTime createdAt=OffsetDateTime.now();
  @Column(nullable=false) private OffsetDateTime updatedAt=OffsetDateTime.now();
  @PreUpdate void touch(){updatedAt=OffsetDateTime.now();}
}
