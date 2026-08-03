#!/usr/bin/env bash
set -Eeuo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

need() { command -v "$1" >/dev/null 2>&1 || { echo "Missing required command: $1" >&2; exit 1; }; }
need node
need npm
need java
need mvn

echo "[1/5] Checking forbidden merge markers and tracked build output"
if grep -RInE '^(<<<<<<<|=======|>>>>>>>)' apps .github scripts --exclude-dir=node_modules --exclude-dir=target; then
  echo "Merge conflict markers found." >&2
  exit 1
fi

find apps -type d \( -name node_modules -o -name target -o -name .next \) -prune -print | grep -q . && {
  echo "Generated dependency/build directories are present. Remove them before packaging." >&2
  exit 1
} || true

echo "[2/5] Frontend dependencies"
(cd apps/web && npm ci)

echo "[3/5] Frontend typecheck and production build"
(cd apps/web && npm run check)

echo "[4/5] Backend tests and package"
(cd apps/api && mvn --batch-mode clean verify)

echo "[5/5] Compose syntax"
if command -v podman >/dev/null 2>&1; then
  podman compose config >/dev/null
elif command -v docker >/dev/null 2>&1; then
  docker compose config >/dev/null
else
  echo "Neither Podman nor Docker found; skipping compose validation."
fi

echo "LifeOS final checks completed successfully."
