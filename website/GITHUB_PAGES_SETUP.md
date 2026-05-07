# GitHub Pages Deployment Guide

## Step 1: Prepare Your GitHub Repository

You have two options:

### Option A: Use Existing RippedMechanics Repository
If you already have a GitHub repo for RippedMechanics:
1. Go to your repository on GitHub
2. Upload the entire `website/` folder to your repo

### Option B: Create a New Repository
1. Go to https://github.com/new
2. Name it `RippedMechanics` (or your preferred name)
3. Set to Public (required for free GitHub Pages)
4. Initialize with README
5. Clone to your machine: `git clone https://github.com/yourusername/RippedMechanics.git`
6. Copy the `website/` folder into the root

## Step 2: Push to GitHub

```bash
# Navigate to your repo
cd /path/to/RippedMechanics

# Add all website files
git add website/

# Commit
git commit -m "Add progress tracking dashboard"

# Push to GitHub
git push origin main
```

## Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** (top right)
3. Scroll to **Pages** section (on the left sidebar)
4. Under "Source", select:
   - Branch: `main` (or your default branch)
   - Folder: `/website` (if website is in a folder) OR `/` (if files are at root)
5. Click **Save**

## Step 4: Wait for Deployment

GitHub Pages typically deploys within 1-2 minutes.

Your site will be available at:
- `https://yourusername.github.io/RippedMechanics/` (if repo name is "RippedMechanics")
- `https://yourusername.github.io/` (if repo is named `yourusername.github.io`)

## Step 5: Verify It's Working

1. Visit the URL above
2. You should see the RippedMechanics tracker dashboard
3. Try adding some data - it should save to localStorage

## Updating Your Data

Since the site uses localStorage, your data is stored **only in your browser**.

To sync data across devices or backup:

1. **Export Data**: Click Settings → Export Data
2. **Save File**: Keep the JSON file safe
3. **On Another Device**: Click Settings → Import Data, select the JSON file

## Custom Domain (Optional)

To use a custom domain (e.g., `tracker.yourdomain.com`):

1. Update domain DNS settings (consult your registrar)
2. In GitHub repo Settings → Pages:
   - Enter your custom domain
   - GitHub will create a `CNAME` file automatically
3. Wait for DNS propagation (can take 24-48 hours)

## Troubleshooting

### Site Won't Load
- Double-check GitHub Pages settings in repo
- Verify the deployment folder is correct (`/website`)
- Check that `.nojekyll` file is present
- Wait 2-3 minutes for GitHub to deploy

### Data Not Persisting
- This is expected behavior - GitHub Pages serves static files
- Your data is stored in browser localStorage, not on GitHub
- Export data regularly to back it up
- Import data when accessing from new devices

### Settings Show "Not Yet Built"
- This is normal initially
- Refresh page after 1-2 minutes
- Check the "Actions" tab in your repo to see build status

## Advanced: Enable Auto-Backups

You can use GitHub Actions to automatically commit weekly data backups:

Create `.github/workflows/backup.yml`:

```yaml
name: Weekly Backup
on:
  schedule:
    - cron: '0 0 * * 0'  # Every Sunday at midnight

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Backup data
        run: |
          mkdir -p backups
          cp website/data.json backups/data-$(date +%Y-%m-%d).json
      - name: Commit changes
        run: |
          git config user.name "Backup Bot"
          git config user.email "bot@example.com"
          git add backups/
          git commit -m "Auto-backup: $(date)" || true
          git push
```

## Need Help?

- GitHub Pages Docs: https://docs.github.com/en/pages
- GitHub Actions Docs: https://docs.github.com/en/actions
- DNS/Custom Domain: Consult your domain registrar

---

**Your tracker is now live! 🚀**
