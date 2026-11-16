#!/usr/bin/env bash
set -euo pipefail
cd -- "$(dirname -- "${BASH_SOURCE[0]}")/servidor"
if [[ ! -f eula.txt ]] || ! grep -Eq '^eula=true[[:space:]]*$' eula.txt; then
  printf '%s\n' 'Revisa la EULA y, si la aceptas, edita eula.txt antes de iniciar.' >&2
  exit 1
fi
exec java -Xms512M -Xmx2G -jar server.jar nogui
