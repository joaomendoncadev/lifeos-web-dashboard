-- Configurable weekly routine. Additive migration: existing calendar blocks are preserved.
create table if not exists routine_definitions (
  id uuid primary key default gen_random_uuid(),
  code varchar(80) not null unique,
  title varchar(240) not null,
  description text not null default '',
  block_type varchar(20) not null default 'ROUTINE',
  domain varchar(20) not null default 'PERSONAL',
  days_of_week varchar(40) not null,
  start_time time not null,
  end_time time not null,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ck_routine_time check (end_time > start_time)
);

create index if not exists idx_routine_definitions_active_sort on routine_definitions(active, sort_order, title);

insert into routine_definitions(code,title,description,block_type,domain,days_of_week,start_time,end_time,sort_order) values
 ('work','Trabalho','Rotina de trabalho','ROUTINE','WORK','1,2,3,4,5','08:00','17:00',10),
 ('english-private','Conversação particular de inglês','Aula particular de conversação','MEETING','STUDY','2','19:00','20:00',20),
 ('english-group','Conversação em grupo de inglês','Aula em grupo de conversação','MEETING','STUDY','4','19:00','20:00',30),
 ('english-grammar','Aula de gramática de inglês','Estudo de gramática','FOCUS','STUDY','6','10:00','11:00',40),
 ('gym','Musculação','Treino de musculação quatro vezes por semana','ROUTINE','HEALTH','1,3,5,6','18:30','19:30',50),
 ('football','Futebol','Futebol semanal','ROUTINE','HEALTH','4','21:00','23:00',60),
 ('cardio','Cardio','Treino cardiovascular três vezes por semana','ROUTINE','HEALTH','2,4,7','07:00','07:45',70)
on conflict (code) do nothing;
