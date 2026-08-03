# Agenda automatizada — v3.1.3

A agenda agora cria automaticamente, ao abrir cada semana:

- Trabalho, de segunda a sexta, das 08:00 às 17:00.
- Conversação particular de inglês, terça, 19:00–20:00.
- Conversação em grupo de inglês, quinta, 19:00–20:00.
- Gramática de inglês, sábado, 10:00–11:00.
- Quatro sessões de musculação: segunda, quarta e sexta às 18:30 e sábado às 11:30.

Os horários iniciais são sugestões. Cada ocorrência é um bloco real e pode ser arrastada para outro dia ou horário sem alterar as semanas seguintes. A grade arredonda movimentos para intervalos de 30 minutos e preserva a duração do evento.

A migration `V14__recurring_calendar_routines.sql` adiciona uma chave de recorrência única para impedir duplicações.
