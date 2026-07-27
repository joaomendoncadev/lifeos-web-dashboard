-- LifeOS v2.2: structures reserved for materialized intelligence snapshots and future recommendations.
create table if not exists daily_stats (
  id uuid primary key default gen_random_uuid(),
  stat_date date not null unique,
  completed_tasks integer not null default 0,
  focus_minutes integer not null default 0,
  habits_done integer not null default 0,
  active_workspaces integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists workspace_metrics (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  metric_date date not null,
  health_score integer not null default 100,
  progress integer not null default 0,
  open_tasks integer not null default 0,
  overdue_tasks integer not null default 0,
  activity_count integer not null default 0,
  created_at timestamptz not null default now(),
  unique(workspace_id, metric_date)
);

create index if not exists idx_workspace_metrics_workspace_date on workspace_metrics(workspace_id, metric_date desc);
