# LifeOS 1.6.3 — TypeScript Build Fix

## Correção

- Removida a propriedade obsoleta `action` do `PageHeader` em `settings-view.tsx`.
- A assinatura atual de `PageHeader` aceita apenas `eyebrow`, `title` e `subtitle`.
- Versão do frontend atualizada para 1.6.3.

## Validação

O erro TS2322 relatado em `components/settings-view.tsx:72` foi corrigido.
