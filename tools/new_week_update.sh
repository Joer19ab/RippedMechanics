#!/usr/bin/env zsh
set -euo pipefail

# Creates a versioned weekly update file from template.
# Usage: ./tools/new_week_update.sh

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
UPDATES_DIR="$ROOT_DIR/program/plans/weekly-updates"
TEMPLATE="$UPDATES_DIR/WEEK_UPDATE_TEMPLATE.md"

if [[ ! -f "$TEMPLATE" ]]; then
  echo "Template not found: $TEMPLATE"
  exit 1
fi

YEAR_WEEK="$(date +%Y-%V)"
TODAY="$(date +%Y-%m-%d)"
OUT_FILE="$UPDATES_DIR/${YEAR_WEEK}_WEEKLY_UPDATE.md"

if [[ -f "$OUT_FILE" ]]; then
  echo "Weekly update already exists: $OUT_FILE"
  exit 0
fi

cp "$TEMPLATE" "$OUT_FILE"
sed -i '' "s/YYYY-WW/${YEAR_WEEK}/g" "$OUT_FILE"
sed -i '' "s/Generated On:/Generated On: ${TODAY}/g" "$OUT_FILE"

echo "Created: $OUT_FILE"
