#!/usr/bin/env bash
set -euo pipefail

# Serve website + backend API over one local server.
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${1:-8000}"
BACKEND_ENTRY="$ROOT_DIR/backend/server.js"

if ! command -v node >/dev/null 2>&1; then
  echo "node is required but was not found on PATH."
  exit 1
fi

if [[ ! -f "$BACKEND_ENTRY" ]]; then
  echo "Backend entry not found at $BACKEND_ENTRY"
  exit 1
fi

echo "Serving fullstack app at http://localhost:$PORT"
exec node "$BACKEND_ENTRY" "$PORT"
