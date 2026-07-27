CREATE TABLE calendar_blocks (
  id UUID PRIMARY KEY,
  title VARCHAR(240) NOT NULL,
  description TEXT,
  block_type VARCHAR(40) NOT NULL DEFAULT 'FOCUS',
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  task_id UUID NULL REFERENCES tasks(id) ON DELETE SET NULL,
  project_id UUID NULL REFERENCES projects(id) ON DELETE SET NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT calendar_blocks_valid_period CHECK (end_at > start_at)
);
CREATE INDEX idx_calendar_blocks_start_at ON calendar_blocks(start_at);
CREATE INDEX idx_calendar_blocks_project_id ON calendar_blocks(project_id);

CREATE TABLE weekly_reviews (
  id UUID PRIMARY KEY,
  week_start DATE NOT NULL UNIQUE,
  highlights TEXT NOT NULL DEFAULT '',
  challenges TEXT NOT NULL DEFAULT '',
  lessons TEXT NOT NULL DEFAULT '',
  next_week_priorities TEXT NOT NULL DEFAULT '',
  energy INTEGER NOT NULL DEFAULT 3 CHECK (energy BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
