-- Migração aditiva: nenhum compromisso ou horário da agenda é removido.
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS converted_to_agenda BOOLEAN NOT NULL DEFAULT FALSE;

-- Oculta da Inbox as tarefas antigas que já possuem representação na agenda.
UPDATE tasks SET converted_to_agenda = TRUE
WHERE id IN (SELECT task_id FROM calendar_blocks WHERE task_id IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_tasks_converted_to_agenda ON tasks(converted_to_agenda);
