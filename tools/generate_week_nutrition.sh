#!/usr/bin/env zsh
set -euo pipefail

# Generates a weekly repetitive-meal nutrition plan and nutrition ICS events.
# Usage:
#   ./tools/generate_week_nutrition.sh
#   ./tools/generate_week_nutrition.sh --year-week 2026-19
#   ./tools/generate_week_nutrition.sh --year-week 2026-19 --timezone Europe/Copenhagen --alarm-minutes 20
#   ./tools/generate_week_nutrition.sh --start-date 2026-05-11

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DAY_TYPE_CSV="$ROOT_DIR/nutrition/templates/WEEK_DAY_TYPES.csv"
MEAL_SLOTS_CSV="$ROOT_DIR/nutrition/templates/MEAL_SLOTS.csv"
OUT_MD_DIR="$ROOT_DIR/program/plans/nutrition"
OUT_CAL_DIR="$ROOT_DIR/calendar"
TIMEZONE="Europe/Copenhagen"
YEAR_WEEK="$(date +%Y-%V)"
ALARM_MINUTES_BEFORE=20
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

for req in "$DAY_TYPE_CSV" "$MEAL_SLOTS_CSV"; do
  if [[ ! -f "$req" ]]; then
    echo "Missing template file: $req"
    exit 1
  fi
done

mkdir -p "$OUT_MD_DIR" "$OUT_CAL_DIR"

YEAR="${YEAR_WEEK%-*}"
WEEK="${YEAR_WEEK#*-}"
OUT_MD="$OUT_MD_DIR/${YEAR_WEEK}_NUTRITION_PLAN.md"
OUT_ICS="$OUT_CAL_DIR/${YEAR_WEEK}_nutrition.ics"
if [[ -n "$START_DATE" ]]; then
  OUT_MD="$OUT_MD_DIR/${START_DATE}_NUTRITION_PLAN.md"
  OUT_ICS="$OUT_CAL_DIR/${START_DATE}_nutrition.ics"
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

  if date -j -f "%G-%V-%u" "${YEAR}-${WEEK}-${iso_day}" "+%Y%m%d" >/dev/null 2>&1; then
    date -j -f "%G-%V-%u" "${YEAR}-${WEEK}-${iso_day}" "+%Y%m%d"
  else
    date -j -f "%Y-%W-%w" "${YEAR}-${WEEK}-${fallback_day}" "+%Y%m%d"
  fi
}

day_type_for() {
  local d="$1"
  awk -F, -v target="$d" 'tolower($1)==tolower(target){print $2}' "$DAY_TYPE_CSV"
}

multiplier_for_type() {
  local dtype="$1"
  local macro="$2"
  case "$dtype:$macro" in
    easy:protein) echo 95 ;;
    easy:carbs) echo 85 ;;
    easy:fat) echo 90 ;;
    moderate:protein) echo 100 ;;
    moderate:carbs) echo 100 ;;
    moderate:fat) echo 100 ;;
    heavy:protein) echo 105 ;;
    heavy:carbs) echo 120 ;;
    heavy:fat) echo 110 ;;
    *)
      echo "Unknown day_type or macro: ${dtype} ${macro}" >&2
      exit 1
      ;;
  esac
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

date_for_slot() {
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
  echo "# Weekly Nutrition Plan ${YEAR_WEEK}"
  echo
  echo "Model: Repetitive meals with variable volume by day type"
  echo "Day-type scaling (macro-specific): easy P95/C85/F90, moderate P100/C100/F100, heavy P105/C120/F110"
  echo

  for day_pos in {1..7}; do
    day="${ordered_days[$day_pos]}"
    dtype="$(day_type_for "$day")"
    if [[ -z "$dtype" ]]; then
      echo "No day_type found for ${day} in ${DAY_TYPE_CSV}" >&2
      exit 1
    fi

    mp="$(multiplier_for_type "$dtype" protein)"
    mc="$(multiplier_for_type "$dtype" carbs)"
    mf="$(multiplier_for_type "$dtype" fat)"
    echo "## ${day} (${dtype}, P ${mp}%, C ${mc}%, F ${mf}%)"
    echo
    echo "| Slot | Time | Meal | Content | kcal | Protein g | Carbs g | Fat g |"
    echo "|---|---|---|---|---:|---:|---:|---:|"

    total_kcal=0
    total_p=0
    total_c=0
    total_f=0

    while IFS=, read -r slot start end meal_name content base_kcal base_p base_c base_f; do
      if [[ "$slot" == "slot" ]]; then
        continue
      fi

      p=$(( base_p * mp / 100 ))
      c=$(( base_c * mc / 100 ))
      f=$(( base_f * mf / 100 ))
      kcal=$(( p * 4 + c * 4 + f * 9 ))

      total_kcal=$(( total_kcal + kcal ))
      total_p=$(( total_p + p ))
      total_c=$(( total_c + c ))
      total_f=$(( total_f + f ))

      local portion_note=""
      if [[ "$dtype" == "easy" ]]; then
        portion_note=" *(easy: reduce carb sources ~15%, keep protein)*"
      elif [[ "$dtype" == "heavy" ]]; then
        portion_note=" *(heavy: increase carb sources ~20%, e.g. +40g rice/oats)*"
      fi
      echo "| ${slot} | ${start}-${end} | ${meal_name} | ${content}${portion_note} | ${kcal} | ${p} | ${c} | ${f} |"
    done < "$MEAL_SLOTS_CSV"

    echo
    echo "Daily total target: ${total_kcal} kcal, ${total_p} g protein, ${total_c} g carbs, ${total_f} g fat"
    echo
  done
} > "$OUT_MD"

{
  echo "BEGIN:VCALENDAR"
  echo "VERSION:2.0"
  echo "PRODID:-//RippedMechanics//Nutrition Automation//EN"
  echo "CALSCALE:GREGORIAN"
  echo "METHOD:PUBLISH"
  echo "X-WR-CALNAME:RippedMechanics Nutrition ${YEAR_WEEK}"
  echo "X-WR-TIMEZONE:${TIMEZONE}"
  echo

  idx=0
  for day_pos in {1..7}; do
    day="${ordered_days[$day_pos]}"
    dtype="$(day_type_for "$day")"
    mp="$(multiplier_for_type "$dtype" protein)"
    mc="$(multiplier_for_type "$dtype" carbs)"
    mf="$(multiplier_for_type "$dtype" fat)"
    dt="$(date_for_slot "$day" $((day_pos - 1)))"

    day_total_kcal=0
    day_total_p=0
    day_total_c=0
    day_total_f=0

    while IFS=, read -r slot start end meal_name content base_kcal base_p base_c base_f; do
      if [[ "$slot" == "slot" ]]; then
        continue
      fi

      p_day=$(( base_p * mp / 100 ))
      c_day=$(( base_c * mc / 100 ))
      f_day=$(( base_f * mf / 100 ))
      kcal_day=$(( p_day * 4 + c_day * 4 + f_day * 9 ))

      day_total_kcal=$(( day_total_kcal + kcal_day ))
      day_total_p=$(( day_total_p + p_day ))
      day_total_c=$(( day_total_c + c_day ))
      day_total_f=$(( day_total_f + f_day ))
    done < "$MEAL_SLOTS_CSV"

    while IFS=, read -r slot start end meal_name content base_kcal base_p base_c base_f; do
      if [[ "$slot" == "slot" ]]; then
        continue
      fi

      p=$(( base_p * mp / 100 ))
      c=$(( base_c * mc / 100 ))
      f=$(( base_f * mf / 100 ))
      kcal=$(( p * 4 + c * 4 + f * 9 ))

      uid="rm-nutrition-${YEAR_WEEK}-${idx}@rippedmechanics"
      stamp="$(date -u +%Y%m%dT%H%M%SZ)"

      summary="Nutrition ${slot}: ${meal_name}"
      description="${day} ${dtype} day (P ${mp}%, C ${mc}%, F ${mf}%). ${content}. Target ${kcal} kcal, P ${p}g, C ${c}g, F ${f}g. Daily total target: ${day_total_kcal} kcal, P ${day_total_p}g, C ${day_total_c}g, F ${day_total_f}g."

      summary_e="$(escape_ics_text "$summary")"
      description_e="$(escape_ics_text "$description")"

      echo "BEGIN:VEVENT"
      echo "UID:${uid}"
      echo "DTSTAMP:${stamp}"
      echo "DTSTART;TZID=${TIMEZONE}:${dt}T${start/:/}00"
      echo "DTEND;TZID=${TIMEZONE}:${dt}T${end/:/}00"
      echo "SUMMARY:${summary_e}"
      echo "DESCRIPTION:${description_e}"
      echo "BEGIN:VALARM"
      echo "TRIGGER:-PT${ALARM_MINUTES_BEFORE}M"
      echo "ACTION:DISPLAY"
      echo "DESCRIPTION:Upcoming nutrition slot"
      echo "END:VALARM"
      echo "END:VEVENT"
      echo

      idx=$((idx + 1))
    done < "$MEAL_SLOTS_CSV"
  done

  echo "END:VCALENDAR"
} > "$OUT_ICS"

echo "Created nutrition plan: $OUT_MD"
echo "Created nutrition calendar: $OUT_ICS"
