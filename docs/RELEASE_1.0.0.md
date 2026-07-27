# Release 1.0.0 — Base consolidada

## Melhorias finais

- Remoção completa dos mocks e do modo demonstração no frontend.
- Tarefas, projetos e hábitos agora iniciam vazios e dependem exclusivamente da API.
- Tratamento uniforme de carregamento, erro e nova tentativa.
- Remoção de bloqueios de escrita baseados em uma fonte fictícia de dados.
- Versões do monorepo, frontend e backend alinhadas em 1.0.0.
- Inclusão de `.dockerignore` para builds menores e mais previsíveis.
- README reescrito para refletir todos os módulos existentes.

## Validação disponível nesta sessão

- JSON dos manifests validado.
- YAML do Compose e da aplicação validado.
- XML do Maven validado.
- Busca estática confirmou a remoção de imports e referências aos mocks.

O build integral ainda depende do download das dependências npm e Maven.
