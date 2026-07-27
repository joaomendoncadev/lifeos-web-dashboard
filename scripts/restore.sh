#!/usr/bin/env bash
set -euo pipefail
file="${1:-}"
if [[ -z "$file" || ! -f "$file" ]]; then
  echo "Uso: ./scripts/restore.sh backups/lifeos-AAAAMMDD-HHMMSS.sql.gz" >&2
  exit 1
fi
read -r -p "Restaurar ${file}? Os dados atuais serão substituídos. Digite RESTAURAR: " answer
[[ "$answer" == "RESTAURAR" ]] || { echo "Cancelado."; exit 1; }
gunzip -c "$file" | docker compose exec -T postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
echo "Restauração concluída."
