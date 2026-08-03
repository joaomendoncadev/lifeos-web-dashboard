# Correção de concorrência na geração de rotinas — v3.4.1

A agenda podia receber duas requisições simultâneas para materializar a mesma semana. O fluxo anterior fazia uma consulta e depois `save`, deixando uma janela de corrida. Além disso, o `save` era efetivamente enviado ao banco durante o auto-flush da consulta seguinte, fora do `try/catch` original.

A geração agora usa uma inserção atômica no PostgreSQL com `ON CONFLICT DO NOTHING`, respeitando o índice único `ux_calendar_blocks_recurrence_key`.

## Garantias

- nenhuma migration foi criada ou alterada;
- nenhum evento existente é removido ou atualizado;
- a base atual da agenda é preservada;
- múltiplas requisições podem gerar a mesma semana sem erro 500;
- ocorrências antigas sem `recurrence_key` continuam sendo reconhecidas pelo título e data.
