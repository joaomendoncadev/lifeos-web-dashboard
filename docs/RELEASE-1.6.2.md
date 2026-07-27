# LifeOS 1.6.2 — Global UX Review

Esta versão corrige inconsistências visuais observadas na 1.6.1 e consolida o workspace de projetos.

## Correções principais

- remove ações duplicadas e botões de cabeçalho sem comportamento;
- substitui nomes de ícones (`Rocket`, `Plane`, etc.) por ícones Lucide reais;
- corrige a navegação da Inbox, que antes voltava ao primeiro projeto;
- limita e organiza textos longos na barra de projetos;
- melhora hierarquia, espaçamento e alinhamento de cabeçalhos;
- melhora cards de tarefas, estados de hover e ações em dispositivos touch;
- ajusta workspace para notebook, tablet e celular;
- adiciona seletor de ícones consistente ao editor de projetos;
- preserva tarefas, projetos, banco e migrações existentes.

## Podman

```bash
podman compose down
podman compose build web --no-cache
podman compose up -d
podman compose logs -f web
```
