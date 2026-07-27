# LifeOS 2.0 — Workspace Foundation

Esta release transforma Workspace no núcleo do produto.

## Entregas
- entidade `Workspace` e API `/api/v1/workspaces`;
- migração automática dos projetos existentes, preservando IDs;
- `workspace_id` em tarefas e notas;
- templates para Projeto, Viagem, Saúde, Finanças, Estudos, Carreira, Pessoal e Em branco;
- eventos estruturados de criação, atualização e arquivamento;
- rota principal `/workspaces` e compatibilidade por redirecionamento de `/projects`;
- Quick Capture global por `Q` ou `⌘/Ctrl + Shift + Espaço`;
- criação rápida de tarefa, nota ou workspace;
- base compartilhada de drawer, command palette e AppShell.

## Compatibilidade
Os campos `projectId` e `projectName` continuam presentes nos contratos de tarefa e nota nesta versão para evitar quebra do frontend. Internamente, passam a referenciar Workspaces.
