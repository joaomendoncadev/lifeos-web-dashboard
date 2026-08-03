ALTER TABLE calendar_blocks
  ADD COLUMN IF NOT EXISTS recurrence_key VARCHAR(180);

CREATE UNIQUE INDEX IF NOT EXISTS ux_calendar_blocks_recurrence_key
  ON calendar_blocks(recurrence_key)
  WHERE recurrence_key IS NOT NULL;
