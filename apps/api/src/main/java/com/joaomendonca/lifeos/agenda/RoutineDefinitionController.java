package com.joaomendonca.lifeos.agenda;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.*;
import java.util.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/routines")
public class RoutineDefinitionController {
  private static final ZoneId ZONE=ZoneId.of("America/Sao_Paulo");
  private final RoutineDefinitionRepository routines;
  private final RoutineGenerationService generator;
  public RoutineDefinitionController(RoutineDefinitionRepository routines,RoutineGenerationService generator){this.routines=routines;this.generator=generator;}

  record Request(@NotBlank @Size(max=240) String title,@Size(max=4000) String description,
    @Pattern(regexp="FOCUS|MEETING|PERSONAL|ROUTINE|BREAK") String blockType,
    @Pattern(regexp="WORK|HEALTH|STUDY|PERSONAL") String domain,
    @NotEmpty Set<@Min(1) @Max(7) Integer> daysOfWeek,@NotNull LocalTime startTime,@NotNull LocalTime endTime,Boolean active,Integer sortOrder){}
  record Response(String id,String code,String title,String description,String blockType,String domain,Set<Integer> daysOfWeek,LocalTime startTime,LocalTime endTime,boolean active,int sortOrder){}
  record GenerationResponse(int created,LocalDate weekStart,LocalDate weekEnd){}

  @GetMapping List<Response> list(){return routines.findAllByOrderBySortOrderAscTitleAsc().stream().map(this::map).toList();}
  @PostMapping @ResponseStatus(HttpStatus.CREATED) Response create(@Valid @RequestBody Request request){var entity=new RoutineDefinitionEntity();entity.setCode(uniqueCode(request.title()));apply(entity,request);return map(routines.save(entity));}
  @PutMapping("/{id}") Response update(@PathVariable UUID id,@Valid @RequestBody Request request){var entity=routines.findById(id).orElseThrow(()->new IllegalArgumentException("Rotina não encontrada."));apply(entity,request);return map(routines.save(entity));}
  @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) void delete(@PathVariable UUID id){var entity=routines.findById(id).orElseThrow(()->new IllegalArgumentException("Rotina não encontrada."));entity.setActive(false);routines.save(entity);}
  @PostMapping("/generate-week") GenerationResponse generate(@RequestParam LocalDate weekStart){LocalDate monday=weekStart.with(DayOfWeek.MONDAY);LocalDate end=monday.plusDays(7);int created=generator.ensureRange(monday.atStartOfDay(ZONE).toInstant(),end.atStartOfDay(ZONE).toInstant());return new GenerationResponse(created,monday,end.minusDays(1));}

  private void apply(RoutineDefinitionEntity e,Request r){if(!r.endTime().isAfter(r.startTime()))throw new IllegalArgumentException("O horário final deve ser posterior ao inicial.");e.setTitle(r.title().trim());e.setDescription(r.description()==null?"":r.description().trim());e.setBlockType(r.blockType()==null?"ROUTINE":r.blockType());e.setDomain(r.domain()==null?AgendaClassifier.domain(r.title(),r.blockType()):r.domain());e.setDaysOfWeek(r.daysOfWeek().stream().sorted().map(String::valueOf).reduce((a,b)->a+","+b).orElseThrow());e.setStartTime(r.startTime());e.setEndTime(r.endTime());e.setActive(r.active()==null||r.active());e.setSortOrder(r.sortOrder()==null?0:r.sortOrder());}
  private Response map(RoutineDefinitionEntity e){Set<Integer> days=new LinkedHashSet<>();for(String value:e.getDaysOfWeek().split(","))days.add(Integer.parseInt(value));return new Response(e.getId().toString(),e.getCode(),e.getTitle(),e.getDescription(),e.getBlockType(),e.getDomain(),days,e.getStartTime(),e.getEndTime(),Boolean.TRUE.equals(e.getActive()),e.getSortOrder());}
  private String uniqueCode(String title){String base=AgendaClassifier.normalize(title).replaceAll("[^a-z0-9]+","-").replaceAll("(^-|-$)","");if(base.isBlank())base="routine";String code=base;int n=2;while(routines.existsByCodeIgnoreCase(code))code=base+"-"+(n++);return code;}
}
