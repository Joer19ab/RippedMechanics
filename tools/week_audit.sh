#!/usr/bin/env zsh
set -euo pipefail

# Verifies weekly artifacts exist and prints pass/fail status.
# Usage:
#   ./tools/week_audit.sh [YYYY-WW]
#   ./tools/week_audit.sh --start-date YYYY-MM-DD [YYYY-WW]

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
      YEAR_WEEK="$1"
      shift
      ;;
  esac
done

weekly_update="$ROOT_DIR/program/plans/weekly-updates/${YEAR_WEEK}_WEEKLY_UPDATE.md"
weekly_ics="$ROOT_DIR/calendar/${YEAR_WEEK}.ics"
nutrition_plan="$ROOT_DIR/program/plans/nutrition/${YEAR_WEEK}_NUTRITION_PLAN.md"
nutrition_ics="$ROOT_DIR/calendar/${YEAR_WEEK}_nutrition.ics"

if [[ -n "$START_DATE" ]]; then
  weekly_ics="$ROOT_DIR/calendar/${START_DATE}.ics"
  nutrition_plan="$ROOT_DIR/program/plans/nutrition/${START_DATE}_NUTRITION_PLAN.md"
  nutrition_ics="$ROOT_DIR/calendar/${START_DATE}_nutrition.ics"
fi

pass=true

check_file() {
  local file="$1"
  local label="$2"
  if [[ -f "$file" ]]; then
    echo "PASS: $label exists -> $file"
  else
    echo "FAIL: $label missing -> $file"
    pass=false
  fi
}

check_file "$weekly_update" "Weekly update"
check_file "$weekly_ics" "Weekly ICS"
check_file "$nutrition_plan" "Nutrition plan"
check_file "$nutrition_ics" "Nutrition ICS"

if [[ "$pass" == true ]]; then
  echo "WEEK AUDIT: PASS"
else
  echo "WEEK AUDIT: FAIL"
  exit 1
fi
