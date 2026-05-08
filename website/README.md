# RippedMechanics Progress Tracker

A modern web-based progress tracking dashboard for your 16-week Hyrox + 70.3 build program. Track weekly compliance, performance metrics, recovery data, and nutrition adherence with interactive analytics.

## Features

✅ **Overview Tab**
- Visual program progress (16-week timeline)
- Macrocycle phase breakdown
- Weekly session template reference
- Intensity distribution guidelines

✅ **Weekly Tracking Tab**
- Session compliance monitoring (0-12 per week)
- Performance trend tracking (Run, Bike, Swim, Hyrox)
- Recovery metrics (sleep, HRV, RHR)
- Nutrition adherence scores
- Coach decision & next-week planning

✅ **Analytics Tab**
- Compliance trend chart
- Performance radar (6-metric status view)
- Detailed trend analysis by discipline
- Recovery sleep tracking
- Nutrition adherence history
- Phase-based recommendations

✅ **Data Management**
- Local browser storage (no server needed)
- Import/export JSON data
- Data persistence across sessions

## Quick Start

### Option 1: GitHub Pages (Recommended for deployment)

1. **Fork or create a new repository** on GitHub
2. **Push this folder** to the `website/` directory in your repo
3. **Enable GitHub Pages**:
   - Go to Settings → Pages
   - Source: Deploy from a branch
   - Branch: `main` (or your default branch)
   - Folder: `/website` (if nested) or `/` (if at root)
4. **Access your site** at `https://yourusername.github.io/RippedMechanics/` (or custom domain)

### Option 2: Local Development

1. **Run the fullstack local server** from repo root:
   ```bash
   ./tools/serve_website.sh
   ```
2. **Visit** `http://localhost:8000`

This local server provides both static website hosting and backend persistence API (`/api/tracker-data`).

### Option 3: One-command local server (from repo root)

```bash
./tools/serve_website.sh
```

Optional custom port:

```bash
./tools/serve_website.sh 8080
```

## Usage

### Tracking Your Progress

1. **Select Week** - Use the week dropdown to navigate between weeks
2. **Log Compliance** - Enter completed sessions (0-12)
3. **Record Metrics** - Fill in performance trends, recovery data, nutrition scores
4. **Set Coach Decision** - Choose load progression, volume/intensity changes
5. **Save** - Click "Save Weekly Update" to store data

### Viewing Analytics

- **Compliance Chart** - See week-by-week compliance score trend
- **Performance Radar** - Multi-metric status snapshot
- **Trend Analysis** - Filter by discipline (Run/Bike/Swim/Hyrox)
- **Recovery & Nutrition** - Historical adherence and sleep tracking

### Data Management

- **Export** - Download all data as JSON for backup
- **Import** - Load previously exported data
- **Clear** - Reset all data (cannot be undone)

## Data Storage

All data is stored **locally in your browser** using localStorage. No external servers or accounts required.

- **Capacity**: ~5-10MB per site (usually enough for years of tracking)
- **Backup**: Regularly export data using the Export button
- **Privacy**: All data stays on your device

## File Structure

```
website/
├── index.html          # Main dashboard HTML
├── styles.css          # Styling (dark theme, responsive)
├── app.js              # JavaScript logic & interactivity
├── data.json           # Sample data (optional)
├── README.md           # This file
└── .nojekyll           # Tells GitHub Pages to serve as static site
```

## Customization

### Update Program Weeks
Edit the `WEEKS_COUNT` constant in `app.js`:
```javascript
const WEEKS_COUNT = 16;  // Change to your program length
```

### Modify Session Count
Edit the `SESSIONS_PER_WEEK` constant:
```javascript
const SESSIONS_PER_WEEK = 12;  // Change if your weeks have different session counts
```

### Adjust Program Start Date
Edit the start date in `getWeekStartDate()` method:
```javascript
const startDate = new Date('2026-05-11');  // Change to your program start
```

### Customize Colors
Edit CSS variables in `styles.css`:
```css
:root {
    --primary: #2563eb;           /* Main accent color */
    --success: #10b981;           /* Success/positive color */
    --danger: #ef4444;            /* Danger/negative color */
    --bg-dark: #0f172a;           /* Dark background */
    --text-primary: #f1f5f9;      /* Text color */
}
```

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Sample Data Format

The app automatically generates default data. To import custom data, use this JSON structure:

```json
{
  "week_1": {
    "week": 1,
    "completed_sessions": 12,
    "compliance_score": 100,
    "run_trend": "up",
    "bike_trend": "stable",
    "swim_trend": "up",
    "hyrox_trend": "stable",
    "avg_sleep": 7.5,
    "sleep_consistency": "excellent",
    "hrv_trend": "up",
    "rhr_trend": "down",
    "macro_adherence": 95,
    "carb_periodization": 90,
    "fueling_score": 88,
    "avg_weight": 75.5,
    "next_week_load": "progress",
    "volume_change": 5,
    "intensity_change": "increase",
    "priorities": "Focus on Hyrox specificity, maintain sleep consistency",
    "timestamp": "2026-05-13T10:00:00.000Z"
  }
}
```

## Tips for Success

1. **Weekly Review Ritual**
   - Track every Sunday evening
   - Set aside 10-15 minutes
   - Review coach recommendations before finalizing

2. **Consistency is Key**
   - Update same day/time each week
   - Export data monthly as backup
   - Reference analytics to guide next-week adjustments

3. **Use Trend Data**
   - Red/declining trends → Focus on that discipline
   - Green/improving trends → Maintain current approach
   - Stable performance → Consider progression stimulus

4. **Recovery Priority**
   - Sleep is the #1 performance lever
   - HRV and RHR trends guide load management
   - Nutrition adherence compounds over time

## Troubleshooting

### Data Not Saving?
- Check browser console (F12) for errors
- Ensure localStorage is enabled
- Try clearing browser cache
- Export data to backup if issues persist

### Charts Not Displaying?
- Refresh the page
- Check if JavaScript is enabled
- Try a different browser
- Clear browser cache and reload

### GitHub Pages Not Loading?
- Verify the URL matches your repository name
- Check GitHub Pages settings in repo
- Wait 1-2 minutes for deployment to complete
- Ensure `.nojekyll` file is in website directory

## Advanced: Automation

You can automate data backup and repository updates:

```bash
# Export data and commit to git
npm run export
git add data.json
git commit -m "Weekly update - Week X"
git push
```

See `.github/workflows/` for GitHub Actions examples.

## Support & Feedback

For issues or suggestions:
1. Check existing tracking entries
2. Review exported data for corruption
3. Try clearing browser cache
4. Reinstall by clearing data and reloading

## License

This project is part of the RippedMechanics program. Free to use and modify.

---

**Built for serious athletes. Track your progression. Execute with precision.**
