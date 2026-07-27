# LifeOS 3.0 — Foundation & Complete Workspaces

Esta entrega consolida as fases 4 e 5 do roadmap.

## Entregue
- remoção do backend legado de `Project` e migration que elimina `projects`/`tasks.project_id`;
- endpoint agregado `GET /api/v1/workspaces/{id}/detail`;
- serviço de aplicação `WorkspaceDetailService`, retirando a agregação do controller;
- rota `/workspaces/[id]` com Overview, Board, Lista, Calendar, Timeline, Knowledge, Files e Settings;
- checklist persistente por workspace;
- anexos por URL persistentes por workspace;
- acesso direto da central de Workspaces para o ambiente individual;
- layout responsivo e estados integrados ao padrão visual existente.

## Migration
`V13__workspace_complete.sql` cria `workspace_checklist_items` e `workspace_attachments`, remove a coluna legada `project_id` e elimina a tabela `projects`.

## Observação
Anexos nesta versão são referências por URL. Upload binário exige storage dedicado e fica fora desta fundação single-user.
