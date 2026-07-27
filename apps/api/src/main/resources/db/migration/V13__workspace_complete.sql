CREATE TABLE workspace_checklist_items (
 id UUID PRIMARY KEY,
 workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
 title VARCHAR(220) NOT NULL,
 completed BOOLEAN NOT NULL DEFAULT FALSE,
 position INTEGER NOT NULL DEFAULT 0,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_workspace_checklist_workspace ON workspace_checklist_items(workspace_id, position);

CREATE TABLE workspace_attachments (
 id UUID PRIMARY KEY,
 workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
 name VARCHAR(255) NOT NULL,
 url TEXT NOT NULL,
 content_type VARCHAR(120),
 size_bytes BIGINT,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_workspace_attachments_workspace ON workspace_attachments(workspace_id, created_at DESC);

ALTER TABLE tasks DROP COLUMN IF EXISTS project_id;
DROP TABLE IF EXISTS projects CASCADE;
