#!/usr/bin/env sh
set -eu
API_URL="${API_URL:-http://localhost:8082}"
WEB_URL="${WEB_URL:-http://localhost:3000}"
printf 'API health... '
curl -fsS "$API_URL/actuator/health" | grep -q '"status":"UP"'
echo OK
printf 'Tasks endpoint... '
curl -fsS "$API_URL/api/v1/tasks" >/dev/null
echo OK
printf 'Web... '
curl -fsS "$WEB_URL" >/dev/null
echo OK
echo 'LifeOS está respondendo corretamente.'
