# LifeOS 2.2.0 — Intelligence Layer

## Entregas
- Insights gerais com tendência semanal de tarefas, foco e hábitos.
- Health score por workspace com estados Saudável, Em risco e Parado.
- Recomendações determinísticas, sem dependência de IA externa.
- Sugestões de blocos de agenda baseadas em prioridade, prazo e ocupação do dia.
- Sinais de progresso de metas com base na execução registrada.
- Correlação exploratória entre hábitos cumpridos e tarefas concluídas.
- Endpoints `/api/v1/intelligence/overview` e `/api/v1/intelligence/workspaces/{id}/health`.
- Migração V12 para snapshots futuros de métricas diárias e por workspace.

## Observação
As correlações são descritivas e não representam causalidade. As recomendações são regras transparentes calculadas localmente.
