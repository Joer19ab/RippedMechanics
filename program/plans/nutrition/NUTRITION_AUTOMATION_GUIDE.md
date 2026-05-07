# Nutrition Automation Guide

## Philosophy
- Meals stay repetitive for low friction.
- Volume scales by day type with macro-specific control.
- Day type controls portion size, not food variety.

## Day-Type Multipliers (Macro Specific)
- Easy day: Protein 95%, Carbs 85%, Fat 90%
- Moderate day: Protein 100%, Carbs 100%, Fat 100%
- Heavy day: Protein 105%, Carbs 120%, Fat 110%

This keeps protein anchored near target while carbohydrate intake scales most with workload.

## Source Templates
- Day types by weekday: nutrition/templates/WEEK_DAY_TYPES.csv
- Repetitive meal slots and base content: nutrition/templates/MEAL_SLOTS.csv

## Generated Outputs (weekly)
- Markdown plan: program/plans/nutrition/YYYY-WW_NUTRITION_PLAN.md
- Nutrition calendar: calendar/YYYY-WW_nutrition.ics

## Command
- Run: ./tools/generate_week_nutrition.sh --year-week YYYY-WW

## Notes
- Keep meal content static and edit only base values and day types.
- If training load changes, update weekday day-type mapping first.
