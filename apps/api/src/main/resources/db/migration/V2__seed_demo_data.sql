INSERT INTO projects(id,name,area,description,progress,deadline,task_count,icon) VALUES
('11111111-1111-1111-1111-111111111111','LifeOS Web','Carreira','Construir o dashboard pessoal integrado à API própria.',42,CURRENT_DATE + 30,10,'Rocket'),
('22222222-2222-2222-2222-222222222222','Planejar Ushuaia','Viagens','Organizar roteiro, hospedagem e experiências.',20,CURRENT_DATE + 90,6,'Plane');
INSERT INTO tasks(id,title,status,project_name,context,duration_minutes,priority,created_at,updated_at) VALUES
('31111111-1111-1111-1111-111111111111','Definir arquitetura do monorepo','DONE','LifeOS Web','Computador',45,'Alta',NOW(),NOW()),
('32222222-2222-2222-2222-222222222222','Implementar autenticação','NEXT','LifeOS Web','Computador',90,'Alta',NOW(),NOW()),
('33333333-3333-3333-3333-333333333333','Pesquisar hospedagem em Ushuaia','INBOX','Planejar Ushuaia','Pessoal',30,'Média',NOW(),NOW());
INSERT INTO habits(id,name,description,frequency,streak,icon,active) VALUES
('41111111-1111-1111-1111-111111111111','Treino','Musculação ou cardio','Diário',8,'Dumbbell',TRUE),
('42222222-2222-2222-2222-222222222222','Estudar','Estudo técnico focado','Diário',4,'BookOpen',TRUE),
('43333333-3333-3333-3333-333333333333','Planejar o dia','Definir três prioridades','Diário',12,'ListChecks',TRUE);
