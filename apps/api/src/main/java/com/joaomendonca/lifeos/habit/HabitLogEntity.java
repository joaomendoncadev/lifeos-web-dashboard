package com.joaomendonca.lifeos.habit;
import jakarta.persistence.*; import java.time.LocalDate; import java.util.UUID; import lombok.*;
@Entity @Table(name="habit_logs",uniqueConstraints=@UniqueConstraint(columnNames={"habit_id","log_date"})) @Getter @Setter @NoArgsConstructor public class HabitLogEntity { @Id @GeneratedValue(strategy=GenerationType.UUID) UUID id; @ManyToOne(optional=false) @JoinColumn(name="habit_id") HabitEntity habit; @Column(name="log_date",nullable=false) LocalDate date; @Column(nullable=false) Boolean done=false; }
