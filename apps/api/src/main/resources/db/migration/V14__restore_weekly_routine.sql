-- Restaura o planejamento semanal (rotina fixa) na tabela calendar_blocks.
-- Datas calculadas para a semana de 03 a 09/08/2026, horário de Brasília (UTC-3).
INSERT INTO calendar_blocks (id, title, description, block_type, start_at, end_at, completed, created_at, updated_at) VALUES
  (gen_random_uuid(), 'Trabalho', 'Rotina de trabalho', 'ROUTINE', '2026-08-03 08:00:00-03', '2026-08-03 17:00:00-03', false, now(), now()),
  (gen_random_uuid(), 'Trabalho', 'Rotina de trabalho', 'ROUTINE', '2026-08-04 08:00:00-03', '2026-08-04 17:00:00-03', false, now(), now()),
  (gen_random_uuid(), 'Trabalho', 'Rotina de trabalho', 'ROUTINE', '2026-08-05 08:00:00-03', '2026-08-05 17:00:00-03', false, now(), now()),
  (gen_random_uuid(), 'Trabalho', 'Rotina de trabalho', 'ROUTINE', '2026-08-06 08:00:00-03', '2026-08-06 17:00:00-03', false, now(), now()),
  (gen_random_uuid(), 'Trabalho', 'Rotina de trabalho', 'ROUTINE', '2026-08-07 08:00:00-03', '2026-08-07 17:00:00-03', false, now(), now()),

  (gen_random_uuid(), 'Conversação particular de inglês', 'Aula particular de conversação', 'MEETING', '2026-08-04 19:00:00-03', '2026-08-04 20:00:00-03', false, now(), now()),
  (gen_random_uuid(), 'Conversação em grupo de inglês', 'Aula em grupo de conversação', 'MEETING', '2026-08-06 19:00:00-03', '2026-08-06 20:00:00-03', false, now(), now()),
  (gen_random_uuid(), 'Aula de gramática de inglês', 'Estudo de gramática', 'FOCUS', '2026-08-08 10:00:00-03', '2026-08-08 11:00:00-03', false, now(), now()),

  (gen_random_uuid(), 'Musculação', 'Treino de musculação', 'ROUTINE', '2026-08-03 18:30:00-03', '2026-08-03 19:30:00-03', false, now(), now()),
  (gen_random_uuid(), 'Musculação', 'Treino de musculação', 'ROUTINE', '2026-08-05 18:30:00-03', '2026-08-05 19:30:00-03', false, now(), now()),
  (gen_random_uuid(), 'Musculação', 'Treino de musculação', 'ROUTINE', '2026-08-07 18:30:00-03', '2026-08-07 19:30:00-03', false, now(), now()),
  (gen_random_uuid(), 'Musculação', 'Treino de musculação', 'ROUTINE', '2026-08-08 18:30:00-03', '2026-08-08 19:30:00-03', false, now(), now()),

  (gen_random_uuid(), 'Futebol', 'Futebol semanal', 'ROUTINE', '2026-08-06 21:00:00-03', '2026-08-06 23:00:00-03', false, now(), now()),

  (gen_random_uuid(), 'Cardio', 'Treino cardiovascular', 'ROUTINE', '2026-08-04 07:00:00-03', '2026-08-04 07:45:00-03', false, now(), now()),
  (gen_random_uuid(), 'Cardio', 'Treino cardiovascular', 'ROUTINE', '2026-08-06 07:00:00-03', '2026-08-06 07:45:00-03', false, now(), now()),
  (gen_random_uuid(), 'Cardio', 'Treino cardiovascular', 'ROUTINE', '2026-08-09 07:00:00-03', '2026-08-09 07:45:00-03', false, now(), now());
