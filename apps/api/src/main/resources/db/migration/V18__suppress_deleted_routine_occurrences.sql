-- Permite excluir apenas uma ocorrência recorrente sem que ela seja recriada no próximo carregamento.
-- A alteração é aditiva e não remove nenhum compromisso existente.
ALTER TABLE calendar_blocks
  ADD COLUMN IF NOT EXISTS suppressed BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_calendar_blocks_visible_range
  ON calendar_blocks(start_at, end_at)
  WHERE suppressed = FALSE;
