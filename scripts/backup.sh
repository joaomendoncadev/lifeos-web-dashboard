#!/usr/bin/env bash
set -euo pipefail
mkdir -p backups
stamp="$(date +%Y%m%d-%H%M%S)"
file="backups/lifeos-${stamp}.sql.gz"
echo "Criando backup em ${file}..."
docker compose exec -T postgres sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB"' | gzip > "$file"
echo "Backup concluído: ${file}"
