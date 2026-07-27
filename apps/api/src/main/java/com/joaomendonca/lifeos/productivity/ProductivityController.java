package com.joaomendonca.lifeos.productivity;
import com.joaomendonca.lifeos.agenda.*;
import com.joaomendonca.lifeos.brain.*;
import com.joaomendonca.lifeos.focus.*;
import com.joaomendonca.lifeos.habit.*;
import com.joaomendonca.lifeos.task.*;
import com.joaomendonca.lifeos.workspace.*;
import java.time.*;
import java.util.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/v1")
public class ProductivityController {
 private final TaskRepository tasks; private final WorkspaceRepository workspaces; private final NoteRepository notes;
 private final CalendarBlockRepository calendar; private final HabitRepository habits; private final FocusSessionRepository focus;
 private final ActivityEventRepository events; private final NoteLinkRepository links;
 public ProductivityController(TaskRepository tasks, WorkspaceRepository workspaces, NoteRepository notes, CalendarBlockRepository calendar, HabitRepository habits, FocusSessionRepository focus, ActivityEventRepository events, NoteLinkRepository links){this.tasks=tasks;this.workspaces=workspaces;this.notes=notes;this.calendar=calendar;this.habits=habits;this.focus=focus;this.events=events;this.links=links;}
 record CompactTask(String id,String title,String workspaceId,String workspace,String priority,LocalDate dueDate,String status){}
 record CompactNote(String id,String title,String workspaceId,String workspace,String excerpt,OffsetDateTime updatedAt){}
 record CompactWorkspace(String id,String name,String type,String icon,int progress,long openTasks,long overdueTasks){}
 record TodayResponse(LocalDate date,long overdueCount,long dueTodayCount,int focusMinutes,List<CompactTask> overdue,List<CompactTask> tasks,List<Map<String,Object>> agenda,List<Map<String,Object>> habits,List<CompactWorkspace> workspaces,List<CompactNote> notes){}
 record SearchItem(String id,String type,String title,String subtitle,String href){}
 record SearchResponse(String query,List<SearchItem> results){}
 record TimelineItem(String id,String entityType,String action,String description,OffsetDateTime createdAt){}
 record WorkspaceInsights(long totalTasks,long completedTasks,long openTasks,long overdueTasks,int progress,int focusMinutes,long notes,long activityLast7Days){}
 record LinkRequest(UUID targetNoteId){}

 @GetMapping("/today") @Transactional(readOnly=true) TodayResponse today(){
  LocalDate d=LocalDate.now(); ZoneId zone=ZoneId.systemDefault(); Instant start=d.atStartOfDay(zone).toInstant(), end=d.plusDays(1).atStartOfDay(zone).toInstant(); var all=tasks.findAllByOrderByCreatedAtDesc();
  var overdue=all.stream().filter(t->t.getStatus()!=TaskStatus.DONE&&t.getDueDate()!=null&&t.getDueDate().isBefore(d)).limit(8).map(this::task).toList();
  var today=all.stream().filter(t->t.getStatus()!=TaskStatus.DONE&&d.equals(t.getDueDate())).map(this::task).toList();
  var blocks=calendar.findByStartAtGreaterThanEqualAndStartAtLessThanOrderByStartAtAsc(start,end).stream().map(b->{Map<String,Object> m=new LinkedHashMap<>();m.put("id",b.getId().toString());m.put("title",b.getTitle());m.put("startAt",b.getStartAt());m.put("endAt",b.getEndAt());m.put("type",b.getBlockType());m.put("completed",b.getCompleted());return m;}).toList();
  var habitList=habits.findByActiveTrueOrderByNameAsc().stream().map(h->{Map<String,Object> m=new LinkedHashMap<>();m.put("id",h.getId().toString());m.put("name",h.getName());m.put("icon",h.getIcon());m.put("frequency",h.getFrequency());return m;}).toList();
  int minutes=focus.findByStartedAtBetween(start,end).stream().filter(f->Boolean.TRUE.equals(f.getCompleted())).mapToInt(f->Optional.ofNullable(f.getActualMinutes()).orElse(0)).sum();
  var ws=workspaces.findAllByArchivedFalseOrderByUpdatedAtDesc().stream().limit(5).map(this::workspace).toList();
  var recent=notes.search("",false).stream().limit(5).map(this::note).toList();
  return new TodayResponse(d,overdue.size(),today.size(),minutes,overdue,today,blocks,habitList,ws,recent);
 }

 @GetMapping("/search") @Transactional(readOnly=true) SearchResponse search(@RequestParam(defaultValue="") String q){
  String query=q.trim(); if(query.length()<2)return new SearchResponse(query,List.of()); String needle=query.toLowerCase(Locale.ROOT); List<SearchItem> result=new ArrayList<>();
  workspaces.findAllByArchivedFalseOrderByUpdatedAtDesc().stream().filter(w->contains(w.getName(),needle)||contains(w.getDescription(),needle)).limit(8).forEach(w->result.add(new SearchItem(w.getId().toString(),"WORKSPACE",w.getName(),w.getType().name(),"/workspaces?workspace="+w.getId())));
  tasks.findAllByOrderByCreatedAtDesc().stream().filter(t->contains(t.getTitle(),needle)||contains(t.getContext(),needle)).limit(10).forEach(t->result.add(new SearchItem(t.getId().toString(),"TASK",t.getTitle(),t.getProjectName(),t.getDueDate()==null?"/inbox":"/today")));
  notes.search(query,false).stream().limit(10).forEach(n->result.add(new SearchItem(n.getId().toString(),"NOTE",n.getTitle(),n.getWorkspace()==null?"Knowledge":n.getWorkspace().getName(),"/brain?note="+n.getId())));
  return new SearchResponse(query,result.stream().limit(24).toList());
 }

 @GetMapping("/workspaces/{id}/timeline") @Transactional(readOnly=true) List<TimelineItem> timeline(@PathVariable UUID id){return events.findAllByWorkspaceIdOrderByCreatedAtDesc(id).stream().limit(100).map(e->new TimelineItem(e.getId().toString(),e.getEntityType(),e.getAction(),e.getDescription(),e.getCreatedAt())).toList();}
 @GetMapping("/workspaces/{id}/insights") @Transactional(readOnly=true) WorkspaceInsights insights(@PathVariable UUID id){
  long total=tasks.countByWorkspaceId(id),done=tasks.countByWorkspaceIdAndStatus(id,TaskStatus.DONE),open=total-done,overdue=tasks.countOverdueByWorkspace(id,LocalDate.now());
  int progress=total==0?0:(int)Math.round(done*100d/total); long noteCount=notes.countByWorkspaceId(id); long recent=events.countByWorkspaceIdAndCreatedAtAfter(id,OffsetDateTime.now().minusDays(7));
  return new WorkspaceInsights(total,done,open,overdue,progress,0,noteCount,recent);
 }
 @GetMapping("/notes/{id}/backlinks") @Transactional(readOnly=true) List<CompactNote> backlinks(@PathVariable UUID id){return links.findAllByTargetIdOrderByCreatedAtDesc(id).stream().map(l->note(l.getSource())).toList();}
 @GetMapping("/notes/{id}/links") @Transactional(readOnly=true) List<CompactNote> outgoing(@PathVariable UUID id){return links.findAllBySourceIdOrderByCreatedAtDesc(id).stream().map(l->note(l.getTarget())).toList();}
 @PostMapping("/notes/{id}/links") @Transactional CompactNote link(@PathVariable UUID id,@RequestBody LinkRequest request){if(id.equals(request.targetNoteId()))throw new IllegalArgumentException("Uma nota não pode apontar para ela mesma."); if(!links.existsBySourceIdAndTargetId(id,request.targetNoteId())){var l=new NoteLinkEntity();l.setSource(findNote(id));l.setTarget(findNote(request.targetNoteId()));links.save(l);}return note(findNote(request.targetNoteId()));}
 @DeleteMapping("/notes/{id}/links/{targetId}") @Transactional void unlink(@PathVariable UUID id,@PathVariable UUID targetId){links.deleteBySourceIdAndTargetId(id,targetId);}
 private NoteEntity findNote(UUID id){return notes.findOneById(id).orElseThrow(()->new IllegalArgumentException("Nota não encontrada."));}
 private boolean contains(String value,String needle){return value!=null&&value.toLowerCase(Locale.ROOT).contains(needle);}
 private CompactTask task(TaskEntity t){return new CompactTask(t.getId().toString(),t.getTitle(),t.getWorkspace()==null?null:t.getWorkspace().getId().toString(),t.getProjectName(),t.getPriority(),t.getDueDate(),t.getStatus().label);}
 private CompactNote note(NoteEntity n){String c=n.getContent()==null?"":n.getContent().replaceAll("\\s+"," ");return new CompactNote(n.getId().toString(),n.getTitle(),n.getWorkspace()==null?null:n.getWorkspace().getId().toString(),n.getWorkspace()==null?"Knowledge":n.getWorkspace().getName(),c.substring(0,Math.min(c.length(),120)),n.getUpdatedAt());}
 private CompactWorkspace workspace(WorkspaceEntity w){long total=tasks.countByWorkspaceId(w.getId()),done=tasks.countByWorkspaceIdAndStatus(w.getId(),TaskStatus.DONE);int p=total==0?0:(int)Math.round(done*100d/total);return new CompactWorkspace(w.getId().toString(),w.getName(),w.getType().name(),w.getIcon(),p,total-done,tasks.countOverdueByWorkspace(w.getId(),LocalDate.now()));}
}
