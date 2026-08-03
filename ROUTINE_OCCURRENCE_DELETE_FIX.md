# Exclusão de ocorrências recorrentes — v3.4.2

## Problema
Ao excluir um cardio (ou outra rotina) da Agenda, o registro era removido e recriado imediatamente por `RoutineGenerationService` durante o recarregamento. Visualmente parecia que o botão **Excluir** não fazia nada.

## Correção
- Ocorrências recorrentes agora são marcadas como `suppressed = true` em vez de removidas fisicamente.
- Registros suprimidos não aparecem na Agenda, no resumo semanal, no Dashboard ou nos Insights.
- O `recurrence_key` permanece no banco como tombstone, impedindo a recriação daquela ocorrência específica.
- Eventos manuais continuam sendo excluídos fisicamente.

## Preservação de dados
A migration `V18__suppress_deleted_routine_occurrences.sql` é apenas aditiva. Ela não apaga nem modifica horários já cadastrados.
