package com.joaomendonca.lifeos.brain;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.*;

@Entity
@Table(name = "areas")
@Getter @Setter @NoArgsConstructor
public class AreaEntity {
  @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
  @Column(nullable = false, unique = true, length = 100) private String name;
  @Column(nullable = false, length = 40) private String icon = "folder";
  @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();
}
