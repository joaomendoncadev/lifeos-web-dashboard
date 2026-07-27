# LifeOS 0.8.0

## Escopo entregue

### Agenda
- visão semanal de segunda a domingo;
- navegação por semana e retorno à semana atual;
- cinco categorias de bloco;
- horários armazenados com timezone (`TIMESTAMPTZ`);
- ações de criar, concluir/reabrir e excluir;
- validação de período no banco e na API.

### Revisão semanal
- um registro por semana, identificado pela segunda-feira;
- energia média de 1 a 5;
- avanços, desafios, aprendizados e prioridades;
- operação idempotente de leitura e atualização da semana corrente.

## Banco de dados

A migração V6 é incremental e não exige a exclusão do volume PostgreSQL existente.

## Limitações conhecidas

- edição visual de blocos ainda não foi adicionada;
- drag and drop será uma melhoria posterior;
- integração com Google Calendar permanece opcional e futura.
