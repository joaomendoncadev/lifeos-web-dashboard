-- Personalização inicial do LifeOS para uso individual do João.
-- Os IDs são fixos para garantir uma única carga via Flyway.

-- Ajusta os dados de demonstração para refletirem o uso real.
UPDATE projects
SET name = 'LifeOS',
    area = 'Projetos pessoais',
    description = 'Construir e evoluir um sistema operacional pessoal para tarefas, projetos, hábitos, conhecimento, viagens e planejamento.',
    icon = 'Rocket'
WHERE id = '11111111-1111-1111-1111-111111111111';

UPDATE projects
SET name = 'Viagem de aniversário — Ushuaia',
    area = 'Viagens',
    description = 'Planejar roteiro, voos, hospedagem e experiências para a viagem de aniversário no fim de outubro.',
    deadline = DATE '2026-10-30',
    icon = 'Plane'
WHERE id = '22222222-2222-2222-2222-222222222222';

UPDATE tasks
SET title = 'Consolidar arquitetura e estabilidade do LifeOS',
    project_name = 'LifeOS',
    context = 'Computador',
    duration_minutes = 90,
    priority = 'Alta',
    project_id = '11111111-1111-1111-1111-111111111111',
    updated_at = NOW()
WHERE id = '31111111-1111-1111-1111-111111111111';

UPDATE tasks
SET title = 'Revisar os módulos e registrar melhorias do LifeOS',
    status = 'NEXT',
    project_name = 'LifeOS',
    context = 'Computador',
    duration_minutes = 45,
    priority = 'Alta',
    project_id = '11111111-1111-1111-1111-111111111111',
    updated_at = NOW()
WHERE id = '32222222-2222-2222-2222-222222222222';

UPDATE tasks
SET title = 'Pesquisar voos e hospedagem para Ushuaia',
    project_name = 'Viagem de aniversário — Ushuaia',
    context = 'Pessoal',
    duration_minutes = 45,
    priority = 'Média',
    due_date = DATE '2026-08-15',
    project_id = '22222222-2222-2222-2222-222222222222',
    updated_at = NOW()
WHERE id = '33333333-3333-3333-3333-333333333333';

-- Projetos pessoais adicionais.
INSERT INTO projects (id, name, area, description, progress, deadline, task_count, icon) VALUES
('90000000-0000-0000-0000-000000000001', 'Evolução profissional', 'Carreira', 'Organizar estudos, certificações, arquitetura de software e evolução como engenheiro Java.', 25, NULL, 0, 'Briefcase'),
('90000000-0000-0000-0000-000000000002', 'Rotina de saúde e treino', 'Saúde', 'Manter consistência em musculação, cardio e acompanhamento da composição corporal.', 20, NULL, 0, 'HeartPulse'),
('90000000-0000-0000-0000-000000000003', 'Organização financeira pessoal', 'Finanças', 'Registrar despesas, acompanhar orçamento e estruturar metas financeiras.', 10, NULL, 0, 'Wallet'),
('90000000-0000-0000-0000-000000000004', 'Próxima viagem internacional', 'Viagens', 'Pesquisar e preparar uma futura experiência internacional, incluindo Japão como destino desejado.', 5, NULL, 0, 'Globe2')
ON CONFLICT (id) DO NOTHING;

-- Tarefas iniciais acionáveis.
INSERT INTO tasks (id, title, status, project_name, project_id, context, duration_minutes, priority, due_date, created_at, updated_at) VALUES
('91000000-0000-0000-0000-000000000001', 'Criar rotina semanal de estudos técnicos', 'NEXT', 'Evolução profissional', '90000000-0000-0000-0000-000000000001', 'Computador', 45, 'Alta', NULL, NOW(), NOW()),
('91000000-0000-0000-0000-000000000002', 'Organizar trilha Java, Spring Boot, AWS e arquitetura', 'INBOX', 'Evolução profissional', '90000000-0000-0000-0000-000000000001', 'Computador', 60, 'Alta', NULL, NOW(), NOW()),
('91000000-0000-0000-0000-000000000003', 'Registrar medidas e objetivo físico atual', 'INBOX', 'Rotina de saúde e treino', '90000000-0000-0000-0000-000000000002', 'Pessoal', 20, 'Média', NULL, NOW(), NOW()),
('91000000-0000-0000-0000-000000000004', 'Definir orçamento mensal pessoal', 'INBOX', 'Organização financeira pessoal', '90000000-0000-0000-0000-000000000003', 'Computador', 30, 'Média', NULL, NOW(), NOW()),
('91000000-0000-0000-0000-000000000005', 'Criar lista de destinos e experiências para o Japão', 'INBOX', 'Próxima viagem internacional', '90000000-0000-0000-0000-000000000004', 'Pessoal', 45, 'Média', NULL, NOW(), NOW()),
('91000000-0000-0000-0000-000000000006', 'Fazer uma revisão semanal no LifeOS', 'NEXT', 'LifeOS', '11111111-1111-1111-1111-111111111111', 'Computador', 25, 'Alta', NULL, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Hábitos: atualiza os existentes e adiciona uma rotina inicial.
UPDATE habits SET streak = 0 WHERE id IN (
'41111111-1111-1111-1111-111111111111',
'42222222-2222-2222-2222-222222222222',
'43333333-3333-3333-3333-333333333333'
);

INSERT INTO habits (id, name, description, frequency, streak, icon, active) VALUES
('92000000-0000-0000-0000-000000000001', 'Estudar inglês', 'Praticar vocabulário, conversação ou compreensão.', 'Diário', 0, 'BookOpen', TRUE),
('92000000-0000-0000-0000-000000000002', 'Registrar despesas', 'Registrar os gastos do dia para manter o orçamento atualizado.', 'Diário', 0, 'ListChecks', TRUE),
('92000000-0000-0000-0000-000000000003', 'Revisão diária', 'Registrar vitórias, bloqueios e prioridades para amanhã.', 'Diário', 0, 'ListChecks', TRUE),
('92000000-0000-0000-0000-000000000004', 'Beber água', 'Manter uma hidratação consistente ao longo do dia.', 'Diário', 0, 'Droplets', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Metas pessoais.
UPDATE goals
SET title = 'Consolidar o LifeOS como sistema pessoal',
    area = 'Projetos pessoais',
    description = 'Usar o LifeOS diariamente e continuar evoluindo os módulos mais importantes.',
    deadline = DATE '2026-12-31'
WHERE id = '7ed23ccd-8667-445d-a8b3-9a8b496e8221';

UPDATE goals
SET title = 'Manter consistência nos treinos',
    area = 'Saúde',
    description = 'Manter musculação e cardio como parte da rotina semanal.',
    deadline = DATE '2026-12-31'
WHERE id = 'ab68952f-b9dc-43da-bf35-8e9a50a63a04';

INSERT INTO goals (id, title, area, description, progress, deadline, active) VALUES
('93000000-0000-0000-0000-000000000001', 'Evoluir como engenheiro de software', 'Carreira', 'Aprofundar Java, Spring Boot, cloud, mensageria, Kubernetes, observabilidade e arquitetura.', 30, DATE '2026-12-31', TRUE),
('93000000-0000-0000-0000-000000000002', 'Organizar finanças e patrimônio', 'Finanças', 'Criar uma rotina de registro, orçamento e acompanhamento financeiro.', 10, DATE '2026-12-31', TRUE),
('93000000-0000-0000-0000-000000000003', 'Melhorar o inglês', 'Estudos', 'Manter contato frequente com inglês e aproveitar a experiência do intercâmbio.', 45, DATE '2026-12-31', TRUE),
('93000000-0000-0000-0000-000000000004', 'Planejar uma próxima viagem internacional', 'Viagens', 'Escolher o destino e organizar orçamento, documentos e roteiro.', 10, NULL, TRUE)
ON CONFLICT (id) DO NOTHING;

-- Áreas complementares do Second Brain.
INSERT INTO areas (id, name, icon) VALUES
('94000000-0000-0000-0000-000000000001', 'Finanças', 'wallet'),
('94000000-0000-0000-0000-000000000002', 'Relacionamentos', 'users'),
('94000000-0000-0000-0000-000000000003', 'Projetos pessoais', 'rocket')
ON CONFLICT (name) DO NOTHING;

-- Tags iniciais.
INSERT INTO tags (id, name) VALUES
('95000000-0000-0000-0000-000000000001', 'java'),
('95000000-0000-0000-0000-000000000002', 'spring'),
('95000000-0000-0000-0000-000000000003', 'aws'),
('95000000-0000-0000-0000-000000000004', 'arquitetura'),
('95000000-0000-0000-0000-000000000005', 'lifeos'),
('95000000-0000-0000-0000-000000000006', 'viagens'),
('95000000-0000-0000-0000-000000000007', 'inglês'),
('95000000-0000-0000-0000-000000000008', 'saúde')
ON CONFLICT (name) DO NOTHING;

-- Notas pessoais iniciais.
INSERT INTO notes (id, title, content, area_id, project_id, favorite, archived, created_at, updated_at) VALUES
('96000000-0000-0000-0000-000000000001', 'Visão do LifeOS', '# Visão do LifeOS\n\nConstruir um sistema operacional pessoal para centralizar tarefas, projetos, hábitos, metas, agenda, conhecimento, viagens, carreira, saúde e finanças.\n\n## Princípios\n\n- Ser simples o suficiente para usar todos os dias\n- Manter os dados em uma base própria\n- Evoluir em módulos sem perder estabilidade\n- Usar IA futuramente para gerar insights e planejamento', '94000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', TRUE, FALSE, NOW(), NOW()),
('96000000-0000-0000-0000-000000000002', 'Stack e interesses técnicos', '# Stack principal\n\n- Java 8, 11, 17 e 21\n- Spring Boot\n- APIs REST e microsserviços\n- Kafka, RabbitMQ e SQS\n- AWS e Azure\n- Docker, Kubernetes e OpenShift\n- PostgreSQL, Oracle, MySQL, MongoDB e Redis\n- Observabilidade, performance e arquitetura\n\n## Objetivo\n\nContinuar evoluindo como engenheiro de software com foco em sistemas distribuídos e liderança técnica.', '10000000-0000-0000-0000-000000000002', '90000000-0000-0000-0000-000000000001', TRUE, FALSE, NOW(), NOW()),
('96000000-0000-0000-0000-000000000003', 'Certificações', '# Certificações concluídas\n\n- Microsoft Azure AZ-900\n- AWS Certified Cloud Practitioner\n\n## Próximos caminhos possíveis\n\n- AWS Solutions Architect Associate\n- Kubernetes\n- Arquitetura de software\n- Observabilidade', '10000000-0000-0000-0000-000000000003', '90000000-0000-0000-0000-000000000001', FALSE, FALSE, NOW(), NOW()),
('96000000-0000-0000-0000-000000000004', 'Experiência internacional — Toronto', '# Toronto 2026\n\nIntercâmbio de inglês realizado entre 20 de junho e 19 de julho de 2026.\n\n## Memórias e aprendizados\n\n- Experiência em homestay\n- Rotina de aulas na ILSC\n- Uso diário de inglês\n- Exploração de Toronto e região\n- Viagem com o irmão Luis', '10000000-0000-0000-0000-000000000005', NULL, FALSE, FALSE, NOW(), NOW()),
('96000000-0000-0000-0000-000000000005', 'Viagem para Nova York', '# Nova York 2026\n\nViagem realizada durante o intercâmbio no Canadá.\n\n## Lugares e experiências\n\n- DUMBO e Brooklyn Bridge\n- Wall Street e região do 9/11\n- High Line e Chelsea Market\n- Times Square\n- Passeio de barco e skyline', '10000000-0000-0000-0000-000000000005', NULL, FALSE, FALSE, NOW(), NOW()),
('96000000-0000-0000-0000-000000000006', 'Base atual de saúde', '# Informações iniciais\n\n- Altura: 1,83 m\n- Peso de referência: 86 kg\n- Rotina desejada: musculação e cardio\n\n> Estes valores podem ser atualizados diretamente pelo LifeOS conforme a evolução.', '10000000-0000-0000-0000-000000000004', '90000000-0000-0000-0000-000000000002', FALSE, FALSE, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO note_tags (note_id, tag_id) VALUES
('96000000-0000-0000-0000-000000000001', '95000000-0000-0000-0000-000000000005'),
('96000000-0000-0000-0000-000000000002', '95000000-0000-0000-0000-000000000001'),
('96000000-0000-0000-0000-000000000002', '95000000-0000-0000-0000-000000000002'),
('96000000-0000-0000-0000-000000000002', '95000000-0000-0000-0000-000000000003'),
('96000000-0000-0000-0000-000000000002', '95000000-0000-0000-0000-000000000004'),
('96000000-0000-0000-0000-000000000003', '95000000-0000-0000-0000-000000000003'),
('96000000-0000-0000-0000-000000000004', '95000000-0000-0000-0000-000000000006'),
('96000000-0000-0000-0000-000000000004', '95000000-0000-0000-0000-000000000007'),
('96000000-0000-0000-0000-000000000005', '95000000-0000-0000-0000-000000000006'),
('96000000-0000-0000-0000-000000000006', '95000000-0000-0000-0000-000000000008')
ON CONFLICT DO NOTHING;

-- Viagens concluídas, planejadas e desejadas.
INSERT INTO trips (id, name, destination, start_date, end_date, status, currency, budget, notes, cover_emoji, created_at, updated_at) VALUES
('97000000-0000-0000-0000-000000000001', 'Intercâmbio em Toronto', 'Toronto, Canadá', DATE '2026-06-20', DATE '2026-07-19', 'COMPLETED', 'CAD', 0, 'Intercâmbio de inglês na ILSC com hospedagem em homestay.', '🇨🇦', NOW(), NOW()),
('97000000-0000-0000-0000-000000000002', 'Nova York durante o intercâmbio', 'Nova York, Estados Unidos', NULL, NULL, 'COMPLETED', 'USD', 0, 'Viagem de quatro dias durante o período no Canadá.', '🗽', NOW(), NOW()),
('97000000-0000-0000-0000-000000000003', 'Aniversário em Ushuaia', 'Ushuaia, Argentina', DATE '2026-10-30', DATE '2026-11-03', 'PLANNING', 'ARS', 0, 'Possibilidade de viagem internacional aproveitando o aniversário e o feriado de 2 de novembro.', '🏔️', NOW(), NOW()),
('97000000-0000-0000-0000-000000000004', 'Japão', 'Japão', NULL, NULL, 'WISHLIST', 'JPY', 0, 'Destino futuro desejado e também relacionado a pessoas importantes conhecidas no intercâmbio.', '🇯🇵', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Itens úteis para a viagem em planejamento.
INSERT INTO trip_checklist_items (id, trip_id, title, category, completed) VALUES
('98000000-0000-0000-0000-000000000001', '97000000-0000-0000-0000-000000000003', 'Pesquisar passagens aéreas', 'Reservas', FALSE),
('98000000-0000-0000-0000-000000000002', '97000000-0000-0000-0000-000000000003', 'Escolher hospedagem', 'Reservas', FALSE),
('98000000-0000-0000-0000-000000000003', '97000000-0000-0000-0000-000000000003', 'Definir roupas adequadas ao frio', 'Mala', FALSE),
('98000000-0000-0000-0000-000000000004', '97000000-0000-0000-0000-000000000003', 'Montar roteiro por dia', 'Roteiro', FALSE),
('98000000-0000-0000-0000-000000000005', '97000000-0000-0000-0000-000000000004', 'Definir época ideal da viagem', 'Planejamento', FALSE),
('98000000-0000-0000-0000-000000000006', '97000000-0000-0000-0000-000000000004', 'Criar lista de cidades e experiências', 'Roteiro', FALSE),
('98000000-0000-0000-0000-000000000007', '97000000-0000-0000-0000-000000000004', 'Estimar orçamento inicial', 'Finanças', FALSE)
ON CONFLICT (id) DO NOTHING;

-- Documentos de referência, sem números sensíveis.
INSERT INTO trip_documents (id, trip_id, name, document_type, reference, expiry_date, ready) VALUES
('99000000-0000-0000-0000-000000000001', '97000000-0000-0000-0000-000000000003', 'Passaporte', 'PASSAPORTE', '', NULL, TRUE),
('99000000-0000-0000-0000-000000000002', '97000000-0000-0000-0000-000000000004', 'Passaporte', 'PASSAPORTE', '', NULL, TRUE)
ON CONFLICT (id) DO NOTHING;
