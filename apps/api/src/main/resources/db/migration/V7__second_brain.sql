CREATE TABLE areas (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  icon VARCHAR(40) NOT NULL DEFAULT 'folder',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tags (
  id UUID PRIMARY KEY,
  name VARCHAR(80) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE notes (
  id UUID PRIMARY KEY,
  title VARCHAR(220) NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  area_id UUID REFERENCES areas(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  favorite BOOLEAN NOT NULL DEFAULT FALSE,
  archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE note_tags (
  note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (note_id, tag_id)
);

CREATE INDEX idx_notes_updated_at ON notes(updated_at DESC);
CREATE INDEX idx_notes_area_id ON notes(area_id);
CREATE INDEX idx_notes_project_id ON notes(project_id);
CREATE INDEX idx_notes_search ON notes USING GIN (to_tsvector('portuguese', coalesce(title, '') || ' ' || coalesce(content, '')));

INSERT INTO areas (id, name, icon) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Pessoal', 'user'),
  ('10000000-0000-0000-0000-000000000002', 'Carreira', 'briefcase'),
  ('10000000-0000-0000-0000-000000000003', 'Estudos', 'book'),
  ('10000000-0000-0000-0000-000000000004', 'Saúde', 'heart'),
  ('10000000-0000-0000-0000-000000000005', 'Viagens', 'plane')
ON CONFLICT (name) DO NOTHING;
