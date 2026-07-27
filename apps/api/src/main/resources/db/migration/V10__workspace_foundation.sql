create table workspaces (
  id uuid primary key,
  name varchar(160) not null,
  description text not null default '',
  type varchar(30) not null default 'PROJECT',
  area varchar(100) not null default 'Pessoal',
  icon varchar(80) not null default 'FolderKanban',
  color varchar(30) not null default 'green',
  status varchar(30) not null default 'ACTIVE',
  start_date date,
  due_date date,
  metadata jsonb not null default '{}'::jsonb,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into workspaces (id, name, description, type, area, icon, due_date)
select id, name, coalesce(description, ''), 'PROJECT', coalesce(area, 'Pessoal'), coalesce(icon, 'FolderKanban'), deadline
from projects;

create table workspace_templates (
  id uuid primary key,
  code varchar(40) not null unique,
  name varchar(100) not null,
  description varchar(500) not null,
  workspace_type varchar(30) not null,
  icon varchar(80) not null,
  color varchar(30) not null,
  default_metadata jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  active boolean not null default true
);

insert into workspace_templates (id, code, name, description, workspace_type, icon, color, default_metadata, sort_order) values
(gen_random_uuid(), 'project', 'Projeto', 'Planeje e execute um resultado com tarefas e prazo.', 'PROJECT', 'Rocket', 'green', '{"views":["overview","board","list","calendar","knowledge"]}', 10),
(gen_random_uuid(), 'travel', 'Viagem', 'Organize roteiro, reservas, documentos e orçamento.', 'TRAVEL', 'Plane', 'blue', '{"views":["overview","checklist","calendar","knowledge"]}', 20),
(gen_random_uuid(), 'health', 'Saúde', 'Acompanhe treinos, medidas, hábitos e objetivos.', 'HEALTH', 'HeartPulse', 'red', '{"views":["overview","list","calendar","knowledge"]}', 30),
(gen_random_uuid(), 'finance', 'Finanças', 'Centralize orçamento, decisões e metas financeiras.', 'FINANCE', 'WalletCards', 'amber', '{"views":["overview","list","knowledge"]}', 40),
(gen_random_uuid(), 'study', 'Estudos', 'Estruture matérias, leituras, entregas e revisão.', 'STUDY', 'GraduationCap', 'purple', '{"views":["overview","board","calendar","knowledge"]}', 50),
(gen_random_uuid(), 'career', 'Carreira', 'Gerencie evolução profissional, vagas e planos.', 'CAREER', 'BriefcaseBusiness', 'slate', '{"views":["overview","board","knowledge"]}', 60),
(gen_random_uuid(), 'personal', 'Pessoal', 'Um espaço flexível para qualquer área da vida.', 'PERSONAL', 'Sparkles', 'pink', '{"views":["overview","list","knowledge"]}', 70),
(gen_random_uuid(), 'blank', 'Em branco', 'Comece do zero e personalize depois.', 'BLANK', 'LayoutGrid', 'gray', '{"views":["overview","list"]}', 80);

alter table tasks add column workspace_id uuid references workspaces(id) on delete set null;
update tasks set workspace_id = project_id where project_id is not null;
create index idx_tasks_workspace_id on tasks(workspace_id);

alter table notes add column workspace_id uuid references workspaces(id) on delete set null;
update notes set workspace_id = project_id where project_id is not null;
create index idx_notes_workspace_id on notes(workspace_id);

create table activity_events (
  id uuid primary key,
  workspace_id uuid references workspaces(id) on delete cascade,
  entity_type varchar(40) not null,
  entity_id uuid,
  action varchar(50) not null,
  description varchar(500) not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index idx_activity_workspace_created on activity_events(workspace_id, created_at desc);
