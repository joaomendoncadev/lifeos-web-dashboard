# LifeOS v3.2.0 — Agenda integrada

## Preservação dos dados

Esta atualização é aditiva. Nenhuma migration foi criada, removida ou alterada e nenhuma tabela foi recriada. Os registros existentes de `calendar_blocks` permanecem intactos.

## Integrações implementadas

- Eventos podem ser vinculados a uma tarefa e a um workspace usando os campos já existentes `task_id` e `project_id`.
- Ao concluir um evento vinculado a uma tarefa, a tarefa é marcada como concluída.
- Blocos concluídos da categoria `FOCUS` passam a compor o foco do dia no Dashboard e no Today Hub.
- Blocos concluídos de foco vinculados a um workspace passam a compor os insights daquele workspace nos últimos 30 dias.
- Rotinas concluídas cujo título seja igual ao nome de um hábito fazem o check-in do hábito na data do evento.
- O editor da agenda agora permite selecionar workspace e tarefa relacionados.

## Regra de segurança

Desmarcar um evento não reabre automaticamente tarefas nem remove check-ins. Isso evita perda ou reversão acidental de dados já confirmados em outros módulos.

## Validação recomendada

Execute `npm run typecheck:web`, `npm run build:web` e `mvn test` em `apps/api` antes do deploy.
