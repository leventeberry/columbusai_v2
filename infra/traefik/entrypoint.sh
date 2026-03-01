#!/bin/sh
# Substitute ACME_EMAIL into static config and start Traefik.
set -e
if [ -f /etc/traefik/traefik.yml.tpl ]; then
  sed "s/\${ACME_EMAIL}/$ACME_EMAIL/g" /etc/traefik/traefik.yml.tpl > /tmp/traefik.yml
  exec /usr/local/bin/traefik --configFile=/tmp/traefik.yml "$@"
else
  exec /usr/local/bin/traefik --configFile=/etc/traefik/traefik.yml "$@"
fi
