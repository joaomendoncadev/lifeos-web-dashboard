create table if not exists note_links (
  id uuid primary key,
  source_note_id uuid not null references notes(id) on delete cascade,
  target_note_id uuid not null references notes(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint uk_note_links unique(source_note_id, target_note_id),
  constraint ck_note_links_not_self check(source_note_id <> target_note_id)
);
create index if not exists idx_note_links_source on note_links(source_note_id);
create index if not exists idx_note_links_target on note_links(target_note_id);
create index if not exists idx_activity_workspace_created on activity_events(workspace_id, created_at desc);
create index if not exists idx_tasks_due_status on tasks(due_date, status);
create index if not exists idx_notes_workspace_updated on notes(workspace_id, updated_at desc);
