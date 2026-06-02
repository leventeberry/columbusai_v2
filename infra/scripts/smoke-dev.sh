#!/usr/bin/env bash
# HTTP smoke tests for the local Docker dev stack.
# Usage: ./infra/scripts/smoke-dev.sh
set -euo pipefail

API_URL="${API_URL:-http://localhost:4000}"
MARKETING_URL="${MARKETING_URL:-http://localhost:3000}"
PORTAL_URL="${PORTAL_URL:-http://localhost:3001}"
ADMIN_URL="${ADMIN_URL:-http://localhost:3002}"
N8N_URL="${N8N_URL:-http://localhost:5678}"

fail=0

retry_curl() {
  local url="$1"
  local attempts="${2:-12}"
  local code="000"
  local i
  for ((i = 1; i <= attempts; i++)); do
    code=$(curl -sS -o /dev/null -w "%{http_code}" --connect-timeout 5 "$url" 2>/dev/null || echo "000")
    if [[ "$code" != "000" ]]; then
      echo "$code"
      return 0
    fi
    sleep 2
  done
  echo "$code"
}

check() {
  local name="$1"
  local url="$2"
  local expect="${3:-200}"
  local retry="${4:-false}"
  local code
  if [[ "$retry" == "true" ]]; then
    code=$(retry_curl "$url")
  else
    code=$(curl -sS -o /dev/null -w "%{http_code}" --connect-timeout 5 "$url" || echo "000")
  fi
  if [[ "$code" == "$expect" ]] || [[ "$expect" == "2xx" && "$code" =~ ^2 ]]; then
    echo "  OK   $name ($code)"
  elif [[ "$expect" == "redirect" && "$code" =~ ^30[1278]$ ]]; then
    echo "  OK   $name ($code redirect)"
  else
    echo "  FAIL $name (HTTP $code, expected $expect)"
    fail=1
  fi
}

echo "==> Smoke test (local dev stack)"
check "API health" "$API_URL/api/health" "200"
check "Marketing" "$MARKETING_URL/" "200" true
check "Portal" "$PORTAL_URL/" "redirect"
check "Admin" "$ADMIN_URL/" "redirect"
check "n8n" "$N8N_URL/" "200"

if [[ "$fail" -ne 0 ]]; then
  echo ""
  echo "Some checks failed. Run: docker ps && make logs"
  exit 1
fi

echo ""
echo "All smoke checks passed."
