package com.joaomendonca.lifeos.agenda;

import com.joaomendonca.lifeos.goal.*;
import com.joaomendonca.lifeos.habit.*;
import com.joaomendonca.lifeos.task.*;
import com.joaomendonca.lifeos.workspace.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.*;
import java.time.temporal.ChronoUnit;
import java.util.*;
import org.springframework.http.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/calendar-blocks")
public class CalendarBlockController {
  private static final ZoneId LIFEOS_ZONE = ZoneId.of("America/Sao_Paulo");
  private final CalendarBlockRepository blocks; private final TaskRepository tasks; private final HabitRepository habits; private final HabitLogRepository habitLogs; private final GoalRepository goals; private final WorkspaceRepository workspaces; private final RoutineGenerationService routineGenerator;
  public CalendarBlockController(CalendarBlockRepository blocks, TaskRepository tasks, HabitRepository habits, HabitLogRepository habitLogs, GoalRepository goals, WorkspaceRepository workspaces, RoutineGenerationService routineGenerator) { this.blocks=blocks;this.tasks=tasks;this.habits=habits;this.habitLogs=habitLogs;this.goals=goals;this.workspaces=workspaces;this.routineGenerator=routineGenerator; }

  record Request(@NotBlank @Size(max=240) String title,@Size(max=4000) String description,@Pattern(regexp="FOCUS|MEETING|PERSONAL|ROUTINE|BREAK") String blockType,@NotNull Instant startAt,@NotNull Instant endAt,UUID taskId,UUID projectId,Boolean completed,@Pattern(regexp="PLANNED|DONE|CANCELLED") String lifecycleStatus,@Pattern(regexp="WORK|HEALTH|STUDY|PERSONAL") String domain) {}
  record Response(String id,String title,String description,String blockType,Instant startAt,Instant endAt,String taskId,String projectId,boolean completed,String lifecycleStatus,String domain) {}
  record WeeklySummary(long workMinutes,long healthMinutes,long studyMinutes,long personalMinutes,long plannedMinutes,long doneMinutes,long cancelledMinutes) {}
  record InboxResponse(String id,String title,String projectId,String project,String context,String duration,int durationMinutes,String status,String priority,LocalDate dueDate) {}
  @GetMapping List<Response> list(@RequestParam(required=false) Instant from,@RequestParam(required=false) Instant to){Instant start=from==null?LocalDate.now(LIFEOS_ZONE).minusDays(7).atStartOfDay(LIFEOS_ZONE).toInstant():from;Instant end=to==null?LocalDate.now(LIFEOS_ZONE).plusDays(30).atStartOfDay(LIFEOS_ZONE).toInstant():to;routineGenerator.ensureRange(start,end);return blocks.findByStartAtGreaterThanEqualAndStartAtLessThanOrderByStartAtAsc(start,end).stream().map(this::map).toList();}
  @GetMapping("/weekly-summary") WeeklySummary summary(@RequestParam Instant from,@RequestParam Instant to){var list=blocks.findByStartAtGreaterThanEqualAndStartAtLessThanOrderByStartAtAsc(from,to);long work=0,health=0,study=0,personal=0,planned=0,done=0,cancelled=0;for(var b:list){long m=Math.max(0,ChronoUnit.MINUTES.between(b.getStartAt(),b.getEndAt()));switch(b.getDomain()){case "WORK"->work+=m;case "HEALTH"->health+=m;case "STUDY"->study+=m;default->personal+=m;}switch(b.getLifecycleStatus()){case "DONE"->done+=m;case "CANCELLED"->cancelled+=m;default->planned+=m;}}return new WeeklySummary(work,health,study,personal,planned,done,cancelled);}
  @PostMapping @ResponseStatus(HttpStatus.CREATED) Response create(@Valid @RequestBody Request r){validatePeriod(r.startAt(),r.endAt());var e=new CalendarBlockEntity();apply(e,r);var saved=blocks.save(e);synchronizeLinkedItems(saved);return map(saved);}
  @PostMapping("/from-inbox/{taskId}") @ResponseStatus(HttpStatus.CREATED) @Transactional
  Response scheduleInboxTask(@PathVariable UUID taskId,@RequestBody Map<String,String> body){
    var task=tasks.findOneById(taskId).orElseThrow(()->new IllegalArgumentException("Tarefa da Inbox não encontrada."));
    Instant start=parseInstant(body.get("startAt"),"Informe o início do agendamento.");
    Instant end=parseInstant(body.get("endAt"),"Informe o fim do agendamento.");
    validatePeriod(start,end);
    var e=new CalendarBlockEntity();e.setTitle(task.getTitle());e.setDescription("Criado a partir da Inbox.");e.setBlockType("FOCUS");e.setStartAt(start);e.setEndAt(end);e.setProjectId(task.getWorkspace()==null?null:task.getWorkspace().getId());e.setTaskId(task.getId());e.setLifecycleStatus("PLANNED");e.setCompleted(false);e.setDomain(AgendaClassifier.domain(task.getTitle(),"FOCUS"));
    task.setConvertedToAgenda(true);tasks.save(task);
    var saved=blocks.save(e);
    return map(saved);
  }
  @PostMapping("/{id}/return-to-inbox") @Transactional
  InboxResponse returnToInbox(@PathVariable UUID id){
    var block=blocks.findById(id).orElseThrow(()->new IllegalArgumentException("Bloco de agenda não encontrado."));
    if(block.getRecurrenceKey()!=null)throw new IllegalArgumentException("Rotinas automáticas não podem ser devolvidas à Inbox; cancele ou edite apenas esta ocorrência.");
    var task=block.getTaskId()==null?new TaskEntity():tasks.findById(block.getTaskId()).orElseGet(TaskEntity::new);
    task.setTitle(block.getTitle());task.setStatus(TaskStatus.INBOX);task.setConvertedToAgenda(false);task.setContext(domainContext(block.getDomain()));task.setDurationMinutes((int)Math.max(5,ChronoUnit.MINUTES.between(block.getStartAt(),block.getEndAt())));task.setPriority(task.getPriority()==null?"Média":task.getPriority());
    if(block.getProjectId()!=null)task.setWorkspace(workspaces.findById(block.getProjectId()).orElse(null));
    task=tasks.save(task);blocks.delete(block);
    return new InboxResponse(task.getId().toString(),task.getTitle(),task.getWorkspace()==null?null:task.getWorkspace().getId().toString(),task.getWorkspace()==null?"Inbox":task.getWorkspace().getName(),task.getContext(),task.getDurationMinutes()+" min",task.getDurationMinutes(),task.getStatus().label,task.getPriority(),task.getDueDate());
  }
  @PutMapping("/{id}") Response update(@PathVariable UUID id,@Valid @RequestBody Request r){validatePeriod(r.startAt(),r.endAt());var e=blocks.findById(id).orElseThrow(()->new IllegalArgumentException("Bloco de agenda não encontrado."));apply(e,r);var saved=blocks.save(e);synchronizeLinkedItems(saved);return map(saved);}
  @PatchMapping("/{id}/complete") Response complete(@PathVariable UUID id,@RequestBody Map<String,Boolean> body){var e=blocks.findById(id).orElseThrow(()->new IllegalArgumentException("Bloco de agenda não encontrado."));boolean completed=Boolean.TRUE.equals(body.get("completed"));e.setCompleted(completed);e.setLifecycleStatus(completed?"DONE":"PLANNED");var saved=blocks.save(e);synchronizeLinkedItems(saved);return map(saved);}
  @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) @Transactional
  void delete(@PathVariable UUID id){
    var block=blocks.findById(id).orElseThrow(()->new IllegalArgumentException("Bloco de agenda não encontrado."));
    if(block.getRecurrenceKey()!=null && !block.getRecurrenceKey().isBlank()){
      // Mantém um tombstone invisível para que a rotina não recrie esta ocorrência ao recarregar a agenda.
      block.setSuppressed(true);
      blocks.save(block);
      return;
    }
    blocks.delete(block);
  }

  private void synchronizeLinkedItems(CalendarBlockEntity block){if(!"DONE".equals(block.getLifecycleStatus())||Boolean.TRUE.equals(block.getIntegrationSynced()))return;LocalDate date=block.getStartAt().atZone(LIFEOS_ZONE).toLocalDate();if(AgendaClassifier.isGym(block.getTitle())){habits.findByActiveTrueOrderByNameAsc().stream().filter(h->AgendaClassifier.isGym(h.getName())||AgendaClassifier.normalize(h.getName()).contains("muscul")).findFirst().ifPresent(h->checkHabit(h,date));}else if("ROUTINE".equals(block.getBlockType())){String n=AgendaClassifier.normalize(block.getTitle());habits.findByActiveTrueOrderByNameAsc().stream().filter(h->AgendaClassifier.normalize(h.getName()).equals(n)).findFirst().ifPresent(h->checkHabit(h,date));}if(AgendaClassifier.isEnglishStudy(block.getTitle()))goals.findAll().stream().filter(g->Boolean.TRUE.equals(g.getActive())&&(AgendaClassifier.normalize(g.getTitle()).contains("ingles")||AgendaClassifier.normalize(g.getTitle()).contains("english")||AgendaClassifier.normalize(g.getArea()).contains("estud"))).forEach(g->{g.setProgress(Math.min(100,g.getProgress()+5));goals.save(g);});block.setIntegrationSynced(true);blocks.save(block);}
  private void checkHabit(HabitEntity habit,LocalDate date){var log=habitLogs.findByHabitIdAndDate(habit.getId(),date).orElseGet(()->{var x=new HabitLogEntity();x.setHabit(habit);x.setDate(date);return x;});log.setDone(true);habitLogs.save(log);}
  private Instant parseInstant(String value,String message){try{return Instant.parse(value);}catch(Exception ex){throw new IllegalArgumentException(message);}}
  private String domainContext(String domain){return switch(domain){case "WORK"->"Trabalho";case "STUDY"->"Computador";case "HEALTH"->"Pessoal";default->"Pessoal";};}
  private void validatePeriod(Instant s,Instant e){if(!e.isAfter(s))throw new IllegalArgumentException("O fim deve ser posterior ao início.");}
  private void apply(CalendarBlockEntity e,Request r){e.setTitle(r.title().trim());e.setDescription(r.description()==null?"":r.description().trim());e.setBlockType(r.blockType()==null?"FOCUS":r.blockType());e.setStartAt(r.startAt());e.setEndAt(r.endAt());e.setProjectId(r.projectId());String status=r.lifecycleStatus()!=null?r.lifecycleStatus():(Boolean.TRUE.equals(r.completed())?"DONE":"PLANNED");e.setLifecycleStatus(status);e.setCompleted("DONE".equals(status));e.setDomain(r.domain()==null?AgendaClassifier.domain(r.title(),r.blockType()):r.domain());}
  private Response map(CalendarBlockEntity e){return new Response(e.getId().toString(),e.getTitle(),e.getDescription(),e.getBlockType(),e.getStartAt(),e.getEndAt(),e.getTaskId()==null?null:e.getTaskId().toString(),e.getProjectId()==null?null:e.getProjectId().toString(),e.getCompleted(),e.getLifecycleStatus(),e.getDomain());}
}
