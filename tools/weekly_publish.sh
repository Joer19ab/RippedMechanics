#!/usr/bin/env zsh
set -euo pipefail

# Weekly publishing pipeline:
# 1) Ensure weekly update markdown exists
# 2) Generate this week's ICS calendar file
# 3) Generate nutrition plan and nutrition ICS file
# 4) Open both ICS files in Apple Calendar for import

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
YEAR_WEEK="$(date +%Y-%V)"
START_DATE=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --start-date)
      START_DATE="$2"
      shift 2
      ;;
    *)
      echo "Unknown argument: $1"
      exit 1
      ;;
  esac
done

"$ROOT_DIR/tools/new_week_update.sh"
if [[ -n "$START_DATE" ]]; then
  "$ROOT_DIR/tools/generate_week_ics.sh" --year-week "$YEAR_WEEK" --start-date "$START_DATE"
  "$ROOT_DIR/tools/generate_week_nutrition.sh" --year-week "$YEAR_WEEK" --start-date "$START_DATE"
else
  "$ROOT_DIR/tools/generate_week_ics.sh" --year-week "$YEAR_WEEK"
  "$ROOT_DIR/tools/generate_week_nutrition.sh" --year-week "$YEAR_WEEK"
fi

ICS_FILE="$ROOT_DIR/calendar/${YEAR_WEEK}.ics"
NUTRITION_ICS_FILE="$ROOT_DIR/calendar/${YEAR_WEEK}_nutrition.ics"
if [[ -n "$START_DATE" ]]; then
  ICS_FILE="$ROOT_DIR/calendar/${START_DATE}.ics"
  NUTRITION_ICS_FILE="$ROOT_DIR/calendar/${START_DATE}_nutrition.ics"
fi

if [[ -f "$ICS_FILE" ]]; then
  open -a Calendar "$ICS_FILE"
  echo "Opened $ICS_FILE in Calendar for import."
else
  echo "Expected ICS file missing: $ICS_FILE"
  exit 1
fi

if [[ -f "$NUTRITION_ICS_FILE" ]]; then
  open -a Calendar "$NUTRITION_ICS_FILE"
  echo "Opened $NUTRITION_ICS_FILE in Calendar for import."
else
  echo "Expected nutrition ICS file missing: $NUTRITION_ICS_FILE"
  exit 1
fi
