# Monitoring Reference

## Contents
- Current State
- Workflow Run Monitoring
- Scraper Health Monitoring
- Build Failure Detection
- Missing: Uptime Monitoring
- Missing: Deploy Notifications
- Adding Monitoring Checklist

## Current State

This project has **no monitoring infrastructure**. Workflow failures are visible in the GitHub Actions tab but produce no alerts. The site could go down or scrapers could silently fail with no notification.

## Workflow Run Monitoring

### GitHub Actions Built-in Monitoring

GitHub sends email notifications for failed workflows by default. Verify this is enabled:

**Settings → Notifications → Actions → Send notifications for failed workflows only**

### Checking Workflow Status

```bash
# List recent workflow runs
gh run list --limit 5

# View details of a specific run
gh run view <run-id>

# Watch a running workflow
gh run watch <run-id>
```

### Workflow Status Badge

Add to `README.md` to show build status at a glance:

```markdown
![Build Status](https://github.com/<owner>/<repo>/actions/workflows/deploy.yml/badge.svg)
![Scrape Status](https://github.com/<owner>/<repo>/actions/workflows/scrape.yml/badge.svg)
```

## Scraper Health Monitoring

### WARNING: Silent Scraper Failures

**The Problem:** If a scraper fails (website changed structure, rate-limited, network error), the workflow still succeeds — it just commits stale or empty data.

```yaml
# Current: no validation of scraper output
- run: python scrapers/run_all.py
- name: Commit updated data
  run: |
    git add src/_data/resources/
    git diff --staged --quiet || git commit -m "Update scraped resource data"
```

**Why This Breaks:** A scraper returning zero results wipes the resource file. The commit step happily commits empty arrays. The build succeeds with no resources displayed.

**The Fix:** Add output validation after scraping:

```yaml
      - run: python scrapers/run_all.py

      - name: Validate scraper output
        run: |
          for f in src/_data/resources/*.json; do
            count=$(python3 -c "import json; print(len(json.load(open('$f'))))")
            if [ "$count" -eq 0 ]; then
              echo "ERROR: $f has zero resources after scraping"
              exit 1
            fi
            echo "$f: $count resources"
          done
```

This fails the workflow if any resource file is empty, preventing deployment of a broken site.

## Build Failure Detection

### Validate Build Output

Add after `npm run build`:

```yaml
      - name: Validate build
        run: |
          test -f _site/index.html || (echo "Missing index.html" && exit 1)
          test -f _site/css/output.css || (echo "Missing CSS" && exit 1)
          page_count=$(find _site -name "*.html" | wc -l)
          echo "Built $page_count HTML pages"
          if [ "$page_count" -lt 5 ]; then
            echo "ERROR: Expected at least 5 pages, got $page_count"
            exit 1
          fi
```

## Missing: Uptime Monitoring

### WARNING: No Site Uptime Monitoring

**The Problem:** If GoDaddy goes down, FTP deploy fails silently, or DNS expires, nobody knows until a user reports it.

**Recommended Solutions (free tier available):**

| Service | Free Tier | Check Interval |
|---------|-----------|----------------|
| UptimeRobot | 50 monitors | 5 min |
| Better Stack | 10 monitors | 3 min |
| Freshping | 50 monitors | 1 min |

### GitHub Actions as Poor-Man's Uptime Check

```yaml
# .github/workflows/uptime.yml
name: Uptime Check

on:
  schedule:
    - cron: '*/30 * * * *'  # Every 30 minutes

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - name: Check site is up
        run: |
          status=$(curl -o /dev/null -s -w "%{http_code}" https://thefullestproject.org)
          if [ "$status" -ne 200 ]; then
            echo "Site returned HTTP $status"
            exit 1
          fi
```

**Caveat:** GitHub Actions minutes are limited. A dedicated uptime service is better for continuous monitoring.

## Missing: Deploy Notifications

### WARNING: No Deployment Alerts

**The Problem:** Deployments succeed or fail silently. The team only discovers failures by checking the Actions tab manually.

**The Fix:** Add Slack, Discord, or email notifications:

```yaml
      # Add at end of deploy job
      - name: Notify on failure
        if: failure()
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: `Deploy failed: ${context.workflow} #${context.runNumber}`,
              body: `Workflow run failed. [View logs](${context.serverUrl}/${context.repo.owner}/${context.repo.repo}/actions/runs/${context.runId})`
            })
```

This creates a GitHub issue on failure — visible to all collaborators without external services.

## Adding Monitoring Checklist

Copy this checklist to incrementally add monitoring:

- [ ] Step 1: Verify GitHub email notifications are enabled for failed workflows
- [ ] Step 2: Add workflow status badges to README
- [ ] Step 3: Add scraper output validation step to `scrape.yml`
- [ ] Step 4: Add build output validation step to both workflows
- [ ] Step 5: Sign up for a free uptime monitoring service
- [ ] Step 6: Add failure notification step (GitHub issue or Slack)

## Feedback Loop: Monitoring Validation

1. Intentionally break a scraper (e.g., bad URL) and push
2. Verify the workflow fails at the validation step (not silently succeeds)
3. Confirm you receive a notification (email, Slack, or GitHub issue)
4. Fix the scraper and verify the workflow passes
5. Only then consider monitoring "working"

See the **python** skill for scraper error handling patterns. See the **eleventy** skill for build output expectations.
