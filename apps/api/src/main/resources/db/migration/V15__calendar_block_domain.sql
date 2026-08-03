-- Área da vida de cada bloco de agenda, para classificação visual mais específica
-- que os 5 tipos genéricos existentes (Foco/Reunião/Pessoal/Rotina/Pausa).
ALTER TABLE calendar_blocks ADD COLUMN domain VARCHAR(20) NOT NULL DEFAULT 'PESSOAL';

UPDATE calendar_blocks SET domain = 'TRABALHO' WHERE title = 'Trabalho';
UPDATE calendar_blocks SET domain = 'ESTUDO' WHERE title ILIKE '%inglês%' OR title ILIKE '%gramática%';
UPDATE calendar_blocks SET domain = 'SAUDE' WHERE title IN ('Musculação', 'Futebol', 'Cardio');
