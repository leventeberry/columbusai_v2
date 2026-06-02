#!/usr/bin/env bash
# Local pre-deploy checks (no VPS required). Run from repo root: ./infra/scripts/verify-prod-deploy.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

echo "==> Validating compose.prod.yml"
docker compose -f infra/docker/compose.prod.yml config --quiet

echo "==> Building API image"
docker build -f apps/api/Dockerfile -t columbus-api-verify .

echo "==> Building migrate image"
docker build -f infra/docker/Dockerfile.migrate -t columbus-migrate-verify .

echo "==> Building marketing (runtime)"
docker build -f apps/marketing/Dockerfile --target runtime -t columbus-marketing-verify \
  --build-arg VITE_API_URL="${VITE_API_URL:-https://api.columbusai.tech}" .

echo "==> Building portal (runtime)"
docker build -f apps/portal/Dockerfile --target runtime -t columbus-portal-verify .

echo "==> Smoke-test marketing container"
cid=$(docker run -d -p 127.0.0.1:3998:3000 columbus-marketing-verify)
trap 'docker rm -f "$cid" >/dev/null 2>&1 || true' EXIT
sleep 2
code=$(curl -sS -o /dev/null -w "%{http_code}" "http://127.0.0.1:3998/" || echo "000")
if [ "$code" != "200" ]; then
  echo "FAIL: marketing HTTP $code (expected 200)"
  docker logs "$cid" 2>&1 | tail -20
  exit 1
fi
echo "PASS: marketing HTTP 200"

echo ""
echo "Local verification complete."
echo "On VPS after DNS + .env: docker compose -f infra/docker/compose.prod.yml up -d --build"
echo "Then: curl -sf https://api.\${DOMAIN}/api/health && demo submit on https://\${DOMAIN}/contact"
