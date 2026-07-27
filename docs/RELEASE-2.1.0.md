# LifeOS v2.1.0 — Connected Productivity

## Entregas

- Hub Hoje agregado pelo backend: tarefas de hoje, atrasos, agenda, hábitos, foco, workspaces e notas recentes.
- Busca global em workspaces, tarefas e notas pela paleta `⌘/Ctrl + K`.
- Timeline e indicadores por workspace.
- Registro de atividades de criação, edição, mudança de status e conclusão de tarefas.
- Base de Knowledge conectado com links entre notas e backlinks.
- Migração Flyway `V11__connected_productivity.sql` com índices de produtividade e tabela `note_links`.

## Novos endpoints

- `GET /api/v1/today`
- `GET /api/v1/search?q=`
- `GET /api/v1/workspaces/{id}/timeline`
- `GET /api/v1/workspaces/{id}/insights`
- `GET /api/v1/notes/{id}/backlinks`
- `GET|POST /api/v1/notes/{id}/links`
- `DELETE /api/v1/notes/{id}/links/{targetId}`
