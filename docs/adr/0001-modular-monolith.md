# ADR 0001 — Monólito modular

## Decisão
Começar com um backend Spring Boot único, dividido por módulos de domínio (`task`, `project`, `habit`).

## Motivos
- Menor custo operacional e cognitivo.
- Transações e evolução de schema simples.
- Separação suficiente para extrair serviços no futuro.

## Consequências
Os módulos não devem acessar diretamente detalhes internos uns dos outros. Novos domínios seguem o mesmo padrão: controller, service quando necessário, repository e entidades.
