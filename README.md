# RippedMechanics Coach System

This workspace contains a modular, full-fledged coaching agent program.

## Purpose
Build a master coaching agent that orchestrates specialization agents for:
- Hyrox
- Ironman (70.3 + 140.6)
- Nutrition
- Recovery
- Strength and Conditioning
- Adaptation and Analytics
- Mindset and Accountability

## Structure
- `master-agent/MASTER_AGENT.md`: Central decision engine and orchestration rules.
- `specializations/`: Domain-specific agents that feed recommendations into the master agent.
- `program/client/`: Athlete profile, constraints, and current benchmarks.
- `program/plans/`: Current periodized plans and progression framework.
- `program/ops/`: Success operating system and intervention ladder.
- `nutrition/templates/`: Repetitive meal slots and day-type mappings.
- `templates/checkins/`: Daily and weekly check-in templates.
- `calendar/`: Weekly `.ics` files for Apple Calendar import.
- `tools/`: Automation scripts for weekly updates and calendar publishing.
- `automation/launchd/`: LaunchAgent template for Sunday automation.

## Operating Model
1. Collect daily and weekly check-ins.
2. Each specialization agent evaluates its own domain.
3. Master agent resolves conflicts and sets final plan changes.
4. Program updates are written back into `program/plans/`.

## Master Agent Routing
Each specialization file includes a `Parent Agent` section that points to:
- `../master-agent/MASTER_AGENT.md` (from top-level folders), or
- `../../master-agent/MASTER_AGENT.md` (from nested folders).

Use this repo as the persistent operating system for coaching decisions.

## Weekly Automation
1. Create this week's update file:
	- `./tools/new_week_update.sh`
2. Generate this week's calendar file:
	- `./tools/generate_week_ics.sh --year-week $(date +%Y-%V)`
	 - Optional reminder lead time: `--alarm-minutes 60`
	- Optional shifted start: `--start-date 2026-05-06`
3. Generate this week's nutrition outputs:
	- `./tools/generate_week_nutrition.sh --year-week $(date +%Y-%V)`
	- Optional shifted start: `--start-date 2026-05-06`
4. Run full weekly pipeline (update + training ICS + nutrition plan + nutrition ICS + open Calendar):
	- `./tools/weekly_publish.sh`
	- Optional shifted start: `./tools/weekly_publish.sh --start-date 2026-05-06`

## Reliability Commands
- Daily readiness decision gate:
	- `./tools/readiness_gate.sh --hrv 110 --hrv-base 119 --rhr 56 --rhr-base 52 --sleep 7.2 --soreness 5`
- Weekly artifact audit:
	- `./tools/week_audit.sh`

## Repetitive Meals, Variable Volume
- Day-type map: `nutrition/templates/WEEK_DAY_TYPES.csv`
- Base repetitive meal slots: `nutrition/templates/MEAL_SLOTS.csv`
- Nutrition automation guide: `program/plans/nutrition/NUTRITION_AUTOMATION_GUIDE.md`

## Operations Playbooks
- Success system:
	- `program/ops/SUCCESS_OPERATING_SYSTEM.md`
- Intervention escalation:
	- `program/ops/INTERVENTION_LADDER.md`
- Daily scorecard:
	- `templates/checkins/DAILY_SCORECARD.md`

## Apple Calendar Auto-Run (launchd)
1. Install weekly Sunday job (18:00 local):
	- `./tools/install_launchd_weekly_sync.sh`
2. Remove weekly job:
	- `./tools/uninstall_launchd_weekly_sync.sh`

The launchd job opens the generated weekly `.ics` in Apple Calendar for import confirmation.
