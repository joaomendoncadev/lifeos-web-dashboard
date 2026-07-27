CREATE TABLE focus_sessions (
  id UUID PRIMARY KEY,
  task_id UUID NULL REFERENCES tasks(id) ON DELETE SET NULL,
  title VARCHAR(240) NOT NULL,
  planned_minutes INTEGER NOT NULL DEFAULT 25,
  actual_minutes INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_focus_sessions_started_at ON focus_sessions(started_at);

CREATE TABLE daily_reviews (
  id UUID PRIMARY KEY,
  review_date DATE NOT NULL UNIQUE,
  wins TEXT NOT NULL DEFAULT '',
  blockers TEXT NOT NULL DEFAULT '',
  tomorrow TEXT NOT NULL DEFAULT '',
  mood INTEGER NOT NULL DEFAULT 3 CHECK (mood BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
