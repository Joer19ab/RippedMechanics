#!/usr/bin/env zsh
set -euo pipefail

# One-command Apple Calendar import for a Monday-start week.
# This opens both training and nutrition .ics files in Calendar for import confirmation.
#
# Usage:
#   ./tools/import_week1_to_apple_calendar.sh
#   ./tools/import_week1_to_apple_calendar.sh --year-week 2026-19

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
YEAR_WEEK="$(date +%G-%V)"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --year-week)
      YEAR_WEEK="$2"
      shift 2
      ;;
    *)
      echo "Unknown argument: $1"
      echo "Usage: $0 [--year-week YYYY-WW]"
      exit 1
      ;;
  esac
done

if [[ ! "$YEAR_WEEK" =~ '^[0-9]{4}-[0-9]{2}$' ]]; then
  echo "Invalid --year-week format. Expected YYYY-WW. Got: $YEAR_WEEK"
  exit 1
fi

TRAINING_ICS="$ROOT_DIR/calendar/${YEAR_WEEK}.ics"
NUTRITION_ICS="$ROOT_DIR/calendar/${YEAR_WEEK}_nutrition.ics"

if [[ ! -f "$TRAINING_ICS" ]]; then
  echo "Training ICS file not found: $TRAINING_ICS"
  echo "Generate it with: ./tools/generate_week_ics.sh --year-week $YEAR_WEEK"
  exit 1
fi

if [[ ! -f "$NUTRITION_ICS" ]]; then
  echo "Nutrition ICS file not found: $NUTRITION_ICS"
  echo "Generate it with: ./tools/generate_week_nutrition.sh --year-week $YEAR_WEEK"
  exit 1
fi

open -a Calendar "$TRAINING_ICS"
open -a Calendar "$NUTRITION_ICS"
echo "Opened:"
echo "- $TRAINING_ICS"
echo "- $NUTRITION_ICS"
echo "Confirm import to your desired calendar (recommended: RippedMechanics)."
