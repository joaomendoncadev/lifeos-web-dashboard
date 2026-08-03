# Agenda render fix 3.1.4

Correção exclusivamente no frontend. Nenhuma migration, entidade, repository, controller ou dado persistido foi alterado.

- Eventos simultâneos são distribuídos em colunas, sem sobreposição.
- Eventos de 30 minutos usam apresentação compacta.
- Eventos médios escondem metadados secundários quando não há altura suficiente.
- Horários e títulos continuam disponíveis no tooltip e ao clicar para editar.
