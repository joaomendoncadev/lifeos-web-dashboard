# LifeOS v1.0.0

Sistema operacional pessoal local e de usuário único, construído com Next.js, Spring Boot e PostgreSQL. Esta versão não possui autenticação porque foi projetada para execução privada na máquina do proprietário.

## Módulos concluídos

- Dashboard com indicadores reais.
- Tarefas e projetos relacionados.
- Hábitos com check-in diário e sequência.
- Metas com progresso e prazo.
- Sessões de foco persistentes.
- Revisões diária e semanal.
- Agenda semanal e time blocking.
- Second Brain com notas Markdown, áreas, tags, favoritos, arquivo, pesquisa e associação a projetos.

Não existem mais fallbacks ou dados mockados no frontend. Quando a API estiver indisponível, a interface exibe o erro e oferece uma nova tentativa.

## Arquitetura

- `apps/web`: Next.js 15, React 19 e TypeScript.
- `apps/api`: Java 21, Spring Boot 3.5, JPA, Validation, Actuator e Flyway.
- `compose.yml`: PostgreSQL 17, API e frontend.
- `docs/adr`: decisões arquiteturais.

## Executar

```bash
cp .env.example .env
podman compose down
podman compose up --build
```

Acessos:

- Web: `http://localhost:3000`
- API: `http://localhost:8081/api/v1`
- Health: `http://localhost:8081/actuator/health`
- Second Brain: `http://localhost:3000/brain`

A porta externa da API pode ser alterada por `API_PORT` no `.env`.

## Desenvolvimento separado

```bash
# banco
podman compose up postgres

# API
cd apps/api
mvn spring-boot:run

# frontend
cd apps/web
cp .env.example .env.local
npm install
npm run typecheck
npm run dev
```

## Migrações

O Flyway aplica automaticamente as migrações V1 a V7. Não apague o volume do PostgreSQL ao atualizar uma instalação existente.

## Limites atuais

Esta é a fundação funcional do produto, não o encerramento definitivo do roadmap. Ainda podem ser adicionados módulos de viagens, finanças, saúde, carreira, IA, integrações, anexos, backlinks e aplicativos móveis. Essas expansões não são necessárias para usar os módulos atuais.


## Viagens (v1.1.0)

O módulo `/trips` centraliza:

- viagens e destinos;
- datas e orçamento em moeda configurável;
- roteiro diário;
- reservas e códigos de confirmação;
- documentos e validade;
- checklist por categoria;
- despesas e saldo disponível.

A migração `V8__travel_planner.sql` é aplicada automaticamente pelo Flyway.

Também foi corrigido o carregamento lazy de projetos no endpoint de tarefas usando `EntityGraph` e transações de leitura/escrita.

## Personalização inicial (v1.2.0)

A migração `V9__personalize_joao_lifeos.sql` cadastra uma base inicial de projetos, tarefas, hábitos, metas, notas e viagens. Ela preserva o volume existente e pode ser ajustada posteriormente pela interface.
