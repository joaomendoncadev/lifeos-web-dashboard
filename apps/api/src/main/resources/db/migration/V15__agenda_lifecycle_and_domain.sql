-- Evolução aditiva: preserva todos os blocos existentes.
ALTER TABLE calendar_blocks ADD COLUMN IF NOT EXISTS lifecycle_status VARCHAR(20) NOT NULL DEFAULT 'PLANNED';
ALTER TABLE calendar_blocks ADD COLUMN IF NOT EXISTS domain VARCHAR(20) NOT NULL DEFAULT 'PERSONAL';
ALTER TABLE calendar_blocks ADD COLUMN IF NOT EXISTS integration_synced BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE calendar_blocks SET lifecycle_status = CASE WHEN completed THEN 'DONE' ELSE 'PLANNED' END;
UPDATE calendar_blocks SET domain = CASE
  WHEN lower(title) LIKE '%trabalho%' THEN 'WORK'
  WHEN lower(title) LIKE '%muscula%' OR lower(title) LIKE '%academia%' OR lower(title) LIKE '%treino%' THEN 'HEALTH'
  WHEN lower(title) LIKE '%ingl%' OR lower(title) LIKE '%gramática%' OR lower(title) LIKE '%estud%' OR lower(title) LIKE '%aula%' THEN 'STUDY'
  ELSE 'PERSONAL' END;
CREATE INDEX IF NOT EXISTS idx_calendar_blocks_lifecycle ON calendar_blocks(lifecycle_status);
CREATE INDEX IF NOT EXISTS idx_calendar_blocks_domain ON calendar_blocks(domain);
