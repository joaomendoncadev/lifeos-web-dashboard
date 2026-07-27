CREATE TABLE goals (
  id UUID PRIMARY KEY,
  title VARCHAR(180) NOT NULL,
  area VARCHAR(100) NOT NULL DEFAULT 'Pessoal',
  description VARCHAR(1200) NOT NULL DEFAULT '',
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  deadline DATE,
  active BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE INDEX idx_goals_active_deadline ON goals(active, deadline);

INSERT INTO goals (id, title, area, description, progress, deadline, active) VALUES
('7ed23ccd-8667-445d-a8b3-9a8b496e8221', 'Consolidar o LifeOS', 'Projetos', 'Transformar o LifeOS em uma ferramenta usada diariamente.', 35, CURRENT_DATE + INTERVAL '90 days', TRUE),
('ab68952f-b9dc-43da-bf35-8e9a50a63a04', 'Manter uma rotina saudável', 'Saúde', 'Treino, sono e alimentação consistentes.', 50, CURRENT_DATE + INTERVAL '120 days', TRUE);
