#!/usr/bin/env zsh
set -euo pipefail

# Installs a user LaunchAgent that runs weekly_publish.sh every Sunday at 18:00.

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TEMPLATE="$ROOT_DIR/automation/launchd/com.rippedmechanics.weekly-calendar-sync.plist.template"
LAUNCH_AGENTS_DIR="$HOME/Library/LaunchAgents"
PLIST_TARGET="$LAUNCH_AGENTS_DIR/com.rippedmechanics.weekly-calendar-sync.plist"

if [[ ! -f "$TEMPLATE" ]]; then
  echo "Missing template: $TEMPLATE"
  exit 1
fi

mkdir -p "$LAUNCH_AGENTS_DIR"
cp "$TEMPLATE" "$PLIST_TARGET"
sed -i '' "s|__ROOT__|$ROOT_DIR|g" "$PLIST_TARGET"

launchctl unload "$PLIST_TARGET" >/dev/null 2>&1 || true
launchctl load "$PLIST_TARGET"

echo "Installed LaunchAgent: $PLIST_TARGET"
echo "Loaded label: com.rippedmechanics.weekly-calendar-sync"
echo "Schedule: Sunday 18:00 local time"
