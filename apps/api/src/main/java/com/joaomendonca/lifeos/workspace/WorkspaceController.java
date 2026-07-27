package com.joaomendonca.lifeos.workspace;

import com.joaomendonca.lifeos.task.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import org.springframework.http.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
public class WorkspaceController {
 private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM", new Locale("pt", "BR"));
 private final WorkspaceRepository workspaces; private final WorkspaceTemplateRepository templates; private final TaskRepository tasks; private final ActivityEventRepository events;
 public WorkspaceController(WorkspaceRepository workspaces, WorkspaceTemplateRepository templates, TaskRepository tasks, ActivityEventRepository events){this.workspaces=workspaces;this.templates=templates;this.tasks=tasks;this.events=events;}
 record WorkspaceRequest(@NotBlank @Size(max=160) String name, String description, String type, String area, String icon, String color, String status, LocalDate startDate, LocalDate dueDate, String metadata){}
 record WorkspaceResponse(String id,String name,String area,String description,int progress,String deadline,LocalDate deadlineDate,long tasks,String icon,String type,String color,String status,LocalDate startDate,String metadata,boolean archived){}
 record TemplateResponse(String id,String code,String name,String description,String type,String icon,String color,String defaultMetadata){}
 @GetMapping("/workspaces") @Transactional(readOnly=true) List<WorkspaceResponse> list(){return workspaces.findAllByArchivedFalseOrderByUpdatedAtDesc().stream().map(this::map).toList();}
 @GetMapping("/workspaces/{id}") @Transactional(readOnly=true) WorkspaceResponse get(@PathVariable UUID id){return map(find(id));}
 @PostMapping("/workspaces") @ResponseStatus(HttpStatus.CREATED) @Transactional WorkspaceResponse create(@Valid @RequestBody WorkspaceRequest request){var e=new WorkspaceEntity();apply(e,request);e=workspaces.save(e);record(e,"WORKSPACE_CREATED","Workspace criado");return map(e);}
 @PostMapping("/workspaces/from-template/{code}") @ResponseStatus(HttpStatus.CREATED) @Transactional WorkspaceResponse createFromTemplate(@PathVariable String code,@Valid @RequestBody WorkspaceRequest request){var t=templates.findByCodeAndActiveTrue(code).orElseThrow(()->new IllegalArgumentException("Template não encontrado."));var e=new WorkspaceEntity();apply(e,request);e.setType(t.getWorkspaceType());e.setIcon(blank(request.icon())?t.getIcon():request.icon());e.setColor(blank(request.color())?t.getColor():request.color());e.setMetadata(blank(request.metadata())?t.getDefaultMetadata():request.metadata());e=workspaces.save(e);record(e,"WORKSPACE_CREATED","Workspace criado pelo template "+t.getName());return map(e);}
 @PutMapping("/workspaces/{id}") @Transactional WorkspaceResponse update(@PathVariable UUID id,@Valid @RequestBody WorkspaceRequest request){var e=find(id);apply(e,request);e=workspaces.save(e);record(e,"WORKSPACE_UPDATED","Workspace atualizado");return map(e);}
 @DeleteMapping("/workspaces/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) @Transactional void archive(@PathVariable UUID id){var e=find(id);e.setArchived(true);workspaces.save(e);record(e,"WORKSPACE_ARCHIVED","Workspace arquivado");}
 @GetMapping("/workspace-templates") List<TemplateResponse> templateList(){return templates.findAllByActiveTrueOrderBySortOrderAsc().stream().map(t->new TemplateResponse(t.getId().toString(),t.getCode(),t.getName(),t.getDescription(),t.getWorkspaceType().name(),t.getIcon(),t.getColor(),t.getDefaultMetadata())).toList();}
 private WorkspaceEntity find(UUID id){return workspaces.findById(id).orElseThrow(()->new IllegalArgumentException("Workspace não encontrado."));}
 private void apply(WorkspaceEntity e,WorkspaceRequest r){e.setName(r.name().trim());e.setDescription(def(r.description(),""));try{e.setType(WorkspaceType.valueOf(def(r.type(),"PROJECT").toUpperCase()));}catch(Exception ex){throw new IllegalArgumentException("Tipo de workspace inválido.");}e.setArea(def(r.area(),"Pessoal"));e.setIcon(def(r.icon(),"FolderKanban"));e.setColor(def(r.color(),"green"));e.setStatus(def(r.status(),"ACTIVE"));e.setStartDate(r.startDate());e.setDueDate(r.dueDate());e.setMetadata(def(r.metadata(),"{}"));}
 private WorkspaceResponse map(WorkspaceEntity e){long total=tasks.countByWorkspaceId(e.getId());long done=tasks.countByWorkspaceIdAndStatus(e.getId(),TaskStatus.DONE);int progress=total==0?0:(int)Math.round(done*100d/total);return new WorkspaceResponse(e.getId().toString(),e.getName(),e.getArea(),e.getDescription(),progress,e.getDueDate()==null?"Sem prazo":formatter.format(e.getDueDate()),e.getDueDate(),total,e.getIcon(),e.getType().name(),e.getColor(),e.getStatus(),e.getStartDate(),e.getMetadata(),Boolean.TRUE.equals(e.getArchived()));}
 private void record(WorkspaceEntity w,String action,String description){var e=new ActivityEventEntity();e.setWorkspace(w);e.setEntityType("WORKSPACE");e.setEntityId(w.getId());e.setAction(action);e.setDescription(description);events.save(e);}
 private String def(String value,String fallback){return blank(value)?fallback:value.trim();} private boolean blank(String value){return value==null||value.isBlank();}
}
