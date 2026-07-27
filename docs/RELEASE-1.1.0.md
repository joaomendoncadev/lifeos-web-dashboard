# LifeOS 1.1.0

## Correções

- Corrige `LazyInitializationException` ao listar tarefas associadas a projetos.
- O repositório de tarefas agora carrega `project` por `EntityGraph`.
- Operações de tarefas que mapeiam relacionamentos executam dentro de transação.

## Travel Planner

- CRUD de viagens.
- Roteiro diário com conclusão.
- Reservas.
- Documentos.
- Checklist.
- Despesas e orçamento.
- Nova rota web `/trips`.
- Migração Flyway V8.
