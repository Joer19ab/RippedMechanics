#!/usr/bin/env zsh
set -euo pipefail

# Generates a weekly ICS calendar file from a standard session template.
# Usage:
#   ./tools/generate_week_ics.sh
#   ./tools/generate_week_ics.sh --year-week 2026-20
#   ./tools/generate_week_ics.sh --year-week 2026-20 --timezone Europe/Copenhagen
#   ./tools/generate_week_ics.sh --start-date 2026-05-06

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TEMPLATE_CSV="$ROOT_DIR/calendar/templates/WEEK_STANDARD_SESSIONS.csv"
OUT_DIR="$ROOT_DIR/calendar"
TIMEZONE="Europe/Copenhagen"
YEAR_WEEK="$(date +%Y-%V)"
ALARM_MINUTES_BEFORE=60
START_DATE=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --year-week)
      YEAR_WEEK="$2"
      shift 2
      ;;
    --timezone)
      TIMEZONE="$2"
      shift 2
      ;;
    --alarm-minutes)
      ALARM_MINUTES_BEFORE="$2"
      shift 2
      ;;
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

if [[ ! "$YEAR_WEEK" =~ '^[0-9]{4}-[0-9]{2}$' ]]; then
  echo "Invalid --year-week format. Expected YYYY-WW. Got: $YEAR_WEEK"
  exit 1
fi

if [[ -n "$START_DATE" ]]; then
  if ! date -j -f "%Y-%m-%d" "$START_DATE" "+%Y%m%d" >/dev/null 2>&1; then
    echo "Invalid --start-date format. Expected YYYY-MM-DD. Got: $START_DATE"
    exit 1
  fi
fi

if [[ ! -f "$TEMPLATE_CSV" ]]; then
  echo "Template CSV not found: $TEMPLATE_CSV"
  exit 1
fi

YEAR="${YEAR_WEEK%-*}"
WEEK="${YEAR_WEEK#*-}"
OUT_FILE="$OUT_DIR/${YEAR_WEEK}.ics"
if [[ -n "$START_DATE" ]]; then
  OUT_FILE="$OUT_DIR/${START_DATE}.ics"
fi

day_to_iso() {
  case "$1" in
    Monday) echo 1 ;;
    Tuesday) echo 2 ;;
    Wednesday) echo 3 ;;
    Thursday) echo 4 ;;
    Friday) echo 5 ;;
    Saturday) echo 6 ;;
    Sunday) echo 7 ;;
    *)
      echo "Invalid day name: $1" >&2
      exit 1
      ;;
  esac
}

iso_date_for_day() {
  local iso_day="$1"
  local fallback_day="$iso_day"
  if [[ "$iso_day" == "7" ]]; then
    fallback_day="0"
  fi

  # Some macOS builds fail ISO parsing with %G-%V-%u.
  # Try ISO format first, then fall back to %Y-%W-%w (Monday-based week).
  if date -j -f "%G-%V-%u" "${YEAR}-${WEEK}-${iso_day}" "+%Y%m%d" >/dev/null 2>&1; then
    date -j -f "%G-%V-%u" "${YEAR}-${WEEK}-${iso_day}" "+%Y%m%d"
  else
    date -j -f "%Y-%W-%w" "${YEAR}-${WEEK}-${fallback_day}" "+%Y%m%d"
  fi
}

escape_ics_text() {
  local raw="$1"
  raw="${raw//\\/\\\\}"
  raw="${raw//;/\\;}"
  raw="${raw//,/\\,}"
  raw="${raw//$'\n'/\\n}"
  echo "$raw"
}

ordered_days=(Monday Tuesday Wednesday Thursday Friday Saturday Sunday)
if [[ -n "$START_DATE" ]]; then
  start_day_name="$(date -j -f "%Y-%m-%d" "$START_DATE" "+%A")"
  tmp_days=()
  start_idx=-1
  for i in {1..7}; do
    idx=$((i - 1))
    if [[ "${ordered_days[$i]}" == "$start_day_name" ]]; then
      start_idx=$idx
      break
    fi
  done

  if [[ "$start_idx" -lt 0 ]]; then
    echo "Could not resolve start weekday from date: $START_DATE"
    exit 1
  fi

  for step in {0..6}; do
    pos=$(( (start_idx + step) % 7 + 1 ))
    tmp_days+=("${ordered_days[$pos]}")
  done
  ordered_days=("${tmp_days[@]}")
fi

date_for_day() {
  local day="$1"
  local offset="$2"
  if [[ -n "$START_DATE" ]]; then
    date -j -v+"${offset}"d -f "%Y-%m-%d" "$START_DATE" "+%Y%m%d"
  else
    local iso_day
    iso_day="$(day_to_iso "$day")"
    iso_date_for_day "$iso_day"
  fi
}

{
  echo "BEGIN:VCALENDAR"
  echo "VERSION:2.0"
  echo "PRODID:-//RippedMechanics//Coach Program//EN"
  echo "CALSCALE:GREGORIAN"
  echo "METHOD:PUBLISH"
  echo "X-WR-CALNAME:RippedMechanics ${YEAR_WEEK}"
  echo "X-WR-TIMEZONE:${TIMEZONE}"
  echo

  idx=0
  for day_pos in {1..7}; do
    current_day="${ordered_days[$day_pos]}"
    dt="$(date_for_day "$current_day" $((day_pos - 1)))"

    while IFS='|' read -r day start end summary description; do
      if [[ "$day" == "day" ]]; then
        continue
      fi

      if [[ "$day" != "$current_day" ]]; then
        continue
      fi

      uid="rm-${YEAR_WEEK}-${idx}@rippedmechanics"
      stamp="$(date -u +%Y%m%dT%H%M%SZ)"

      summary_e="$(escape_ics_text "$summary")"
      description_e="$(escape_ics_text "$description")"

      echo "BEGIN:VEVENT"
      echo "UID:${uid}"
      echo "DTSTAMP:${stamp}"
      echo "DTSTART;TZID=${TIMEZONE}:${dt}T${start/:/}00"
      echo "DTEND;TZID=${TIMEZONE}:${dt}T${end/:/}00"
      echo "SUMMARY:Week ${YEAR_WEEK} - ${summary_e}"
      echo "DESCRIPTION:${description_e}"
      echo "BEGIN:VALARM"
      echo "TRIGGER:-PT${ALARM_MINUTES_BEFORE}M"
      echo "ACTION:DISPLAY"
      echo "DESCRIPTION:Upcoming training session"
      echo "END:VALARM"
      echo "END:VEVENT"
      echo

      idx=$((idx + 1))
    done < "$TEMPLATE_CSV"
  done

  echo "END:VCALENDAR"
} > "$OUT_FILE"

echo "Created: $OUT_FILE"
