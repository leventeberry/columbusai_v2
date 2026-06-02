#!/usr/bin/env bash
# Deploy Columbus AI prod stack over SSH (when Hostinger Docker Manager is unavailable).
# Usage from repo root:
#   ./infra/scripts/remote-deploy.sh
#   VPS_SSH_HOST=columbusai-vps ./infra/scripts/remote-deploy.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
REPO_DIR="${REPO_DIR:-/opt/columbusai_v2}"
VPS_USER="${VPS_USER:-root}"
SSH_CONNECT_TIMEOUT="${SSH_CONNECT_TIMEOUT:-25}"
SSH_OPTS=(
  -o "ConnectTimeout=${SSH_CONNECT_TIMEOUT}"
  -o "BatchMode=yes"
  -o "StrictHostKeyChecking=accept-new"
  -o "ServerAliveInterval=30"
  -o "ServerAliveCountMax=6"
)
if [[ -n "${SSH_IDENTITY_FILE:-}" ]]; then
  SSH_OPTS+=(-i "${SSH_IDENTITY_FILE}" -o IdentitiesOnly=yes)
elif [[ -f "${HOME}/.ssh/id_ed25519" ]]; then
  SSH_OPTS+=(-i "${HOME}/.ssh/id_ed25519" -o IdentitiesOnly=yes)
fi
if [[ -f "${HOME}/.ssh/config" ]]; then
  SSH_OPTS+=(-F "${HOME}/.ssh/config")
fi

cd "$ROOT"

ENV_FILE="${ENV_FILE:-.env.production}"
if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE in $ROOT (copy from .env.production.example)"
  exit 1
fi

# VPS_HOST from env, or HOSTINGER_VPS_IP in .env.production, or default prod IP
if [[ -z "${VPS_HOST:-}" ]]; then
  VPS_HOST="$(grep -E '^HOSTINGER_VPS_IP=' "$ENV_FILE" | head -1 | cut -d= -f2- | tr -d '\r' | xargs || true)"
fi
VPS_HOST="${VPS_HOST:-147.93.113.58}"

# Prefer ~/.ssh/config alias when defined (Host columbusai-vps)
if [[ -z "${VPS_SSH_HOST:-}" ]] && [[ -f "${HOME}/.ssh/config" ]] && grep -q '^Host columbusai-vps' "${HOME}/.ssh/config"; then
  VPS_SSH_HOST=columbusai-vps
fi
SSH_TARGET="${VPS_SSH_HOST:-${VPS_USER}@${VPS_HOST}}"

preflight_ssh() {
  echo "==> SSH preflight → ${SSH_TARGET} (port ${SSH_PORT:-22})"
  if ! command -v ssh >/dev/null 2>&1; then
    echo "ssh not found in PATH"
    exit 1
  fi
  local port_args=()
  if [[ -n "${SSH_PORT:-}" ]]; then
    port_args=(-p "${SSH_PORT}")
  fi
  local ssh_err
  ssh_err="$(ssh "${SSH_OPTS[@]}" "${port_args[@]}" "${SSH_TARGET}" 'echo "SSH OK: $(hostname) $(docker --version 2>/dev/null || echo docker-not-yet-installed)"' 2>&1)" && return 0
  echo "$ssh_err" >&2
  echo "" >&2
  if [[ "$ssh_err" == *"Permission denied"* ]]; then
    echo "Key login failed. The deploy script cannot use a password (BatchMode)." >&2
    echo "Install THIS machine's public key on the VPS, then retry:" >&2
    echo "" >&2
    "${ROOT}/infra/scripts/print-ssh-pubkey.sh" >&2
    exit 1
  fi
  echo "Cannot reach the VPS over SSH." >&2
  echo "  Test: ssh ${SSH_TARGET} 'echo ok'" >&2
  echo "  See docs/vps-ssh-setup.md" >&2
  exit 1
}

preflight_ssh

echo "==> Bootstrap Docker on VPS (idempotent)"
ssh "${SSH_OPTS[@]}" "${SSH_TARGET}" 'bash -s' < infra/scripts/vps-bootstrap.sh

RSYNC_TARGET="${SSH_TARGET}"
if [[ "${SSH_TARGET}" == *@* ]]; then
  RSYNC_TARGET="${SSH_TARGET}"
else
  RSYNC_TARGET="${VPS_USER}@${VPS_HOST}"
fi
RSYNC_SSH="ssh ${SSH_OPTS[*]}"
if [[ -n "${SSH_PORT:-}" ]]; then
  RSYNC_SSH="ssh -p ${SSH_PORT} ${SSH_OPTS[*]}"
fi

echo "==> Sync repo to ${RSYNC_TARGET}:${REPO_DIR}"
ssh "${SSH_OPTS[@]}" "${SSH_TARGET}" "mkdir -p ${REPO_DIR}"
rsync -az --delete -e "${RSYNC_SSH}" \
  --exclude node_modules \
  --exclude .git \
  --exclude dist \
  --exclude .next \
  "$ROOT/" "${RSYNC_TARGET}:${REPO_DIR}/"

echo "==> Copy ${ENV_FILE}"
scp "${SSH_OPTS[@]}" "$ROOT/${ENV_FILE}" "${RSYNC_TARGET}:${REPO_DIR}/${ENV_FILE}"

echo "==> Start production stack"
ssh "${SSH_OPTS[@]}" "${SSH_TARGET}" "cd ${REPO_DIR} && docker compose --env-file ${ENV_FILE} -f infra/docker/compose.prod.yml up -d --build"

echo "==> Done. Verify:"
echo "  curl -sf https://api.columbusai.tech/api/health"
