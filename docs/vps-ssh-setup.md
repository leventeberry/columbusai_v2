# VPS SSH setup (Hostinger)

Target: `root@147.93.113.58` (columbusai.tech production VPS, VM 702283)

## 1. Enable SSH in Hostinger

From this environment, the host **pings** but **TCP 22/80/443 time out** — usually Hostinger firewall or VPS UFW blocking inbound traffic.

In **hPanel → VPS → Security / Firewall**:

1. Allow **SSH (22)** from your IP (or temporarily `0.0.0.0/0` for setup, then restrict).
2. Allow **HTTP (80)** and **HTTPS (443)** for Traefik / Let's Encrypt.
3. Confirm the VPS is **running** and the public IP is `147.93.113.58`.

If Hostinger shows a custom SSH port (e.g. `65002`), note it and set `Port` in `~/.ssh/config`.

On the VPS (browser terminal in hPanel if SSH still fails):

```bash
# Ubuntu/Debian — ensure sshd is running
systemctl enable --now ssh
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable   # only if you use ufw
```

## 2. Local SSH config

A host alias is in `~/.ssh/config`:

```ssh-config
Host columbusai-vps
  HostName 147.93.113.58
  User root
  IdentityFile ~/.ssh/id_ed25519
```

Install your public key on the VPS (one-time, from your machine):

```bash
ssh-copy-id -i ~/.ssh/id_ed25519.pub root@147.93.113.58
# or, if using the alias after port 22 works:
ssh-copy-id columbusai-vps
```

Test:

```bash
ssh columbusai-vps 'echo ok && hostname'
```

## 3. Bootstrap the server (after SSH works)

From your laptop:

```bash
ssh columbusai-vps 'bash -s' < infra/scripts/vps-bootstrap.sh
```

Or SSH in and run the script manually from a cloned repo.

## 4. Deploy Columbus AI

See [deployment-runbook.md](deployment-runbook.md):

```bash
ssh columbusai-vps
git clone <your-repo-url> /opt/columbusai_v2
cd /opt/columbusai_v2
cp .env.example .env
# edit .env — secrets, DOMAIN=columbusai.tech, etc.
make up-prod
```

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `Connection timed out` on port 22 | Open SSH in Hostinger firewall; check VPS power state |
| `Permission denied (publickey)` | Run `ssh-copy-id`; verify `IdentityFile` in config |
| Wrong port | Set `Port 65002` (or whatever hPanel shows) under `Host columbusai-vps` |
| Host key changed | `ssh-keygen -R 147.93.113.58` |
