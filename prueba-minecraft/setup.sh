#!/usr/bin/env bash
set -euo pipefail
cd -- "$(dirname -- "${BASH_SOURCE[0]}")"
mkdir -p servidor
cd servidor
hash=4707d00eb834b446575d89a61a11b5d548d8c001
if [[ ! -f server.jar ]]; then
  temp=$(mktemp)
  trap 'rm -f -- "$temp"' EXIT
  curl --fail --silent --show-error --location --retry 2 \
    "https://piston-data.mojang.com/v1/objects/$hash/server.jar" -o "$temp"
  printf '%s  %s\n' "$hash" "$temp" | sha1sum --check
  mv -- "$temp" server.jar
fi
printf '%s  server.jar\n' "$hash" | sha1sum --check
if [[ ! -f eula.txt ]]; then
  printf 'eula=false\n' >eula.txt
fi
if [[ ! -f server.properties ]]; then
  cat >server.properties <<'PROPERTIES'
server-ip=127.0.0.1
server-port=25565
online-mode=true
white-list=true
enforce-whitelist=true
motd=Nuestro Mundo
view-distance=6
simulation-distance=5
PROPERTIES
fi
printf '%s\n' 'Archivos listos. Revisa https://www.minecraft.net/es-es/eula antes de editar servidor/eula.txt.'
