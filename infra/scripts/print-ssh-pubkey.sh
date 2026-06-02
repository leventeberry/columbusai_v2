#!/usr/bin/env bash
# Print the public key this machine uses for columbusai-vps deploys.
set -euo pipefail
KEY="${SSH_IDENTITY_FILE:-${HOME}/.ssh/id_ed25519.pub}"
if [[ ! -f "$KEY" ]]; then
  echo "No key at $KEY — generate: ssh-keygen -t ed25519 -C 'deploy'"
  exit 1
fi
echo "Public key file: $KEY"
ssh-keygen -lf "$KEY"
echo ""
echo "Paste this ONE line on the VPS (hPanel console, logged in as root):"
echo ""
echo "grep -qF \"$(awk '{print $2}' "$KEY")\" /root/.ssh/authorized_keys 2>/dev/null || echo \"$(cat "$KEY")\" >> /root/.ssh/authorized_keys && chmod 600 /root/.ssh/authorized_keys"
echo ""
echo "Or from this machine (will prompt for root password once):"
VPS_IP="${HOSTINGER_VPS_IP:-147.93.113.58}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
for ENV_FILE in .env.production .env.local; do
  if [[ -f "${ROOT}/${ENV_FILE}" ]]; then
    VPS_IP="$(grep -E '^HOSTINGER_VPS_IP=' "${ROOT}/${ENV_FILE}" | head -1 | cut -d= -f2- | tr -d '\r' | xargs || echo "$VPS_IP")"
    break
  fi
done
echo "  ssh-copy-id -i ${KEY%.pub} root@${VPS_IP}"
