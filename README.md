# LifeOS v3.1.0 — Stable UX

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


## UX 1.3

A versão 1.3 introduz edição em painel lateral para tarefas e projetos, confirmações internas, notificações globais, atalhos e paleta de comandos com `⌘K`/`Ctrl+K`.


## Estabilização e acabamento (v1.4.0)

- Drawers de edição completos em tarefas, projetos, hábitos, metas e viagens.
- Confirmações internas em vez de `window.confirm`.
- Toasts consistentes para sucesso e erro.
- Edição de notas com confirmação segura e indicador de salvamento.
- Estados vazios com ações claras em hábitos e metas.
- Backup e restauração do PostgreSQL.

### Backup

```bash
./scripts/backup.sh
```

Os arquivos são salvos em `backups/` e não exigem parar a aplicação.

### Restauração

```bash
./scripts/restore.sh backups/lifeos-AAAAMMDD-HHMMSS.sql.gz
```

A restauração pede confirmação explícita. Faça um backup novo antes de restaurar outro arquivo.

### Atualização segura

```bash
docker compose down
docker compose up --build -d
docker compose ps
docker compose logs -f api web
```

Nunca use `docker compose down -v` durante uma atualização, pois isso remove o volume do PostgreSQL.

## LifeOS 1.5.0 — estabilidade final

A tela **Configurações** permite exportar e importar os principais dados em JSON. A importação é aditiva e não remove registros existentes.

Validações locais:

```bash
cd apps/web && npm install && npm run check
cd ../api && mvn test package
```

O pipeline `.github/workflows/ci.yml` executa essas verificações automaticamente no GitHub.

Teste rápido depois de subir os containers:

```bash
./scripts/smoke-test.sh
```

## LifeOS 2.0 — Workspace Foundation

A navegação principal usa `/workspaces`. A rota legada `/projects` redireciona automaticamente.

A captura rápida pode ser aberta com `Q` (fora de campos de texto) ou `⌘/Ctrl + Shift + Espaço`.

Ao iniciar esta versão sobre um banco existente, o Flyway preserva os IDs dos projetos e cria os Workspaces equivalentes. Faça backup antes da primeira inicialização:

```bash
./scripts/backup.sh
podman compose down
podman compose up --build -d
```


## Intelligence Layer

A página Insights consolida produtividade semanal, foco, hábitos, saúde dos workspaces, recomendações, agenda sugerida e sinais de metas. Os cálculos são locais e baseados em regras transparentes.
