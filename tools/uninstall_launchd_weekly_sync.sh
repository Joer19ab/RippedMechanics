#!/usr/bin/env zsh
set -euo pipefail

# Uninstalls the user LaunchAgent for weekly calendar sync.

PLIST_TARGET="$HOME/Library/LaunchAgents/com.rippedmechanics.weekly-calendar-sync.plist"

if [[ -f "$PLIST_TARGET" ]]; then
  launchctl unload "$PLIST_TARGET" >/dev/null 2>&1 || true
  rm -f "$PLIST_TARGET"
  echo "Uninstalled: $PLIST_TARGET"
else
  echo "LaunchAgent not found: $PLIST_TARGET"
fi
