# LifeOS 3.3.0 — Inbox e Agenda como dois caminhos de entrada

- Criar pela Agenda gera diretamente um bloco planejado.
- Criar pela Inbox gera uma pendência sem data.
- Arrastar da Inbox para a Agenda **move** o item: cria o bloco e oculta a pendência na mesma transação; o vínculo técnico interno permite desfazer sem perda de dados.
- “Mover para Inbox” faz o caminho inverso: restaura a pendência original sem data e remove o bloco. Para itens criados diretamente na agenda, cria uma nova entrada na Inbox.
- Não há seletor nem vínculo manual entre tarefa e evento.
- Blocos antigos e todos os horários existentes são preservados.
- Itens antigos que já estavam vinculados não aparecem duplicados na Inbox.
- Rotinas automáticas não podem ser movidas à Inbox, para não quebrar a recorrência semanal.

A coluna `converted_to_agenda` é aditiva. Ela mantém a reversibilidade e impede duplicidade visual, sem excluir tarefas ou eventos existentes.
