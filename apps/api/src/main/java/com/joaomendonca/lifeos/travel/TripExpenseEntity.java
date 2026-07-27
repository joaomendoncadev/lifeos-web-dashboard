package com.joaomendonca.lifeos.travel;
import jakarta.persistence.*; import java.math.BigDecimal; import java.time.LocalDate; import java.util.UUID; import lombok.*;
@Entity @Table(name="trip_expenses") @Getter @Setter @NoArgsConstructor
public class TripExpenseEntity { @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id; @Column(nullable=false) private UUID tripId; @Column(nullable=false,length=200) private String description; @Column(nullable=false,length=80) private String category="Outros"; @Column(nullable=false,precision=14,scale=2) private BigDecimal amount; @Column(nullable=false) private LocalDate expenseDate; @Column(nullable=false) private Boolean paid=true; }
