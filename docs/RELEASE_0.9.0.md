# LifeOS v0.9.0 — Second Brain

## Entrega

- notas persistentes em PostgreSQL;
- editor Markdown com visualização;
- pesquisa por título, conteúdo e tags;
- áreas no estilo PARA;
- tags criadas automaticamente;
- associação opcional com projetos;
- favoritas, arquivo e exclusão definitiva;
- ordenação por favoritas e última atualização;
- índice PostgreSQL full-text preparado para evolução da busca.

## Migração

`V7__second_brain.sql` cria `areas`, `tags`, `notes` e `note_tags`.
