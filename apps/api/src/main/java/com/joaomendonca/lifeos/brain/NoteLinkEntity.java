package com.joaomendonca.lifeos.brain;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.*;
@Entity @Table(name="note_links", uniqueConstraints=@UniqueConstraint(columnNames={"source_note_id","target_note_id"}))
@Getter @Setter @NoArgsConstructor
public class NoteLinkEntity {
 @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
 @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="source_note_id") private NoteEntity source;
 @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="target_note_id") private NoteEntity target;
 @Column(name="created_at", nullable=false, updatable=false) private OffsetDateTime createdAt=OffsetDateTime.now();
}
