# LifeOS 1.2.0 — Personalização inicial

Esta versão adiciona a migração `V9__personalize_joao_lifeos.sql` com uma carga inicial baseada nas informações fornecidas pelo usuário.

## Dados incluídos

- Projetos pessoais de LifeOS, carreira, saúde, finanças e viagens.
- Tarefas iniciais acionáveis.
- Hábitos de treino, estudos, planejamento, inglês, finanças, revisão e hidratação.
- Metas para 2026.
- Áreas e tags do Second Brain.
- Notas de visão do produto, stack, certificações, viagens e saúde.
- Viagens de Toronto, Nova York, Ushuaia e Japão.
- Checklists iniciais sem informações documentais sensíveis.

A migração usa UUIDs fixos e `ON CONFLICT` para preservar os dados já existentes. Dados pessoais podem ser alterados normalmente pela interface.
