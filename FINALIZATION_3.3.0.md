# LifeOS 3.3.0 — Agenda integrada final

Esta atualização é **aditiva**. A migration V15 adiciona colunas com valores padrão e classifica os registros existentes; nenhum bloco da agenda é apagado.

## Entregue
- versões raiz, frontend e backend alinhadas em 3.3.0;
- status Planejado, Realizado e Cancelado;
- domínios Trabalho, Saúde, Estudo e Pessoal;
- resumo semanal de horas por domínio e por execução;
- alerta de conflito ao salvar ou arrastar;
- tarefas pendentes arrastáveis diretamente para a agenda;
- musculação reconhecida por aliases (musculação, academia, treino, gym, workout);
- estudos de inglês alimentam metas relacionadas de forma idempotente;
- testes frontend com Vitest e testes backend do classificador;
- preservação integral dos eventos existentes.

## Atualização segura
Execute o compose normalmente. O Flyway aplicará apenas `V15__agenda_lifecycle_and_domain.sql`.
