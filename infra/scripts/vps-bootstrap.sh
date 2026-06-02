#!/usr/bin/env bash
# First-time VPS setup for Columbus AI production. Run as root on the VPS:
#   bash infra/scripts/vps-bootstrap.sh
# Or from local machine:
#   ssh columbusai-vps 'bash -s' < infra/scripts/vps-bootstrap.sh
set -euo pipefail

echo "==> OS"
. /etc/os-release 2>/dev/null || true
echo "${PRETTY_NAME:-unknown}"

echo "==> Install Docker (if missing)"
if ! command -v docker >/dev/null 2>&1; then
  apt-get update -qq
  apt-get install -y ca-certificates curl
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
    $(. /etc/os-release && echo "${VERSION_CODENAME:-jammy}") stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update -qq
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
  systemctl enable --now docker
else
  echo "Docker already installed: $(docker --version)"
fi

docker compose version

echo "==> Firewall (ufw)"
if command -v ufw >/dev/null 2>&1; then
  ufw allow OpenSSH || true
  ufw allow 80/tcp || true
  ufw allow 443/tcp || true
  ufw --force enable || true
  ufw status || true
fi

echo "==> Create app directory"
mkdir -p /opt/columbusai_v2
echo "Clone your repo into /opt/columbusai_v2, copy .env.production, then: cd /opt/columbusai_v2 && make up-prod"

echo "==> Done. Next: DNS A records → this IP, .env.production on VPS, make up-prod"
