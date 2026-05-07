#!/usr/bin/env zsh
set -euo pipefail

# Simple readiness gate to decide daily training mode.
# Usage: ./tools/readiness_gate.sh --hrv 110 --hrv-base 119 --rhr 56 --rhr-base 52 --sleep 7.2 --soreness 5

hrv=""
hrv_base=""
rhr=""
rhr_base=""
sleep_hours=""
soreness=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --hrv)
      hrv="$2"; shift 2 ;;
    --hrv-base)
      hrv_base="$2"; shift 2 ;;
    --rhr)
      rhr="$2"; shift 2 ;;
    --rhr-base)
      rhr_base="$2"; shift 2 ;;
    --sleep)
      sleep_hours="$2"; shift 2 ;;
    --soreness)
      soreness="$2"; shift 2 ;;
    *)
      echo "Unknown argument: $1"
      exit 1 ;;
  esac
done

for v in "$hrv" "$hrv_base" "$rhr" "$rhr_base" "$sleep_hours" "$soreness"; do
  if [[ -z "$v" ]]; then
    echo "Missing required inputs."
    echo "Example: ./tools/readiness_gate.sh --hrv 110 --hrv-base 119 --rhr 56 --rhr-base 52 --sleep 7.2 --soreness 5"
    exit 1
  fi
done

flags=0

# Recovery flags
if (( $(echo "$hrv < $hrv_base * 0.92" | bc -l) )); then
  flags=$((flags + 1))
fi

if (( $(echo "$rhr > $rhr_base + 4" | bc -l) )); then
  flags=$((flags + 1))
fi

if (( $(echo "$sleep_hours < 6.8" | bc -l) )); then
  flags=$((flags + 1))
fi

if (( $(echo "$soreness >= 7" | bc -l) )); then
  flags=$((flags + 1))
fi

if [[ "$flags" -ge 2 ]]; then
  echo "READINESS: RED"
  echo "ACTION: Replace intensity with Z1/Z2 + mobility or full recovery."
elif [[ "$flags" -eq 1 ]]; then
  echo "READINESS: YELLOW"
  echo "ACTION: Keep session but reduce intensity volume by 20-30%."
else
  echo "READINESS: GREEN"
  echo "ACTION: Execute full planned session."
fi
