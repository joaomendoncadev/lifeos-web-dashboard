package com.joaomendonca.lifeos.habit;
import jakarta.persistence.*; import java.util.UUID; import lombok.*;
@Entity @Table(name="habits") @Getter @Setter @NoArgsConstructor public class HabitEntity { @Id @GeneratedValue(strategy=GenerationType.UUID) UUID id; @Column(nullable=false) String name; String description; String frequency="Diário"; Integer streak=0; String icon="CircleCheck"; Boolean active=true; }
