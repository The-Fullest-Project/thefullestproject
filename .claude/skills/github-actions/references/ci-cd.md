# CI/CD Reference

## Contents
- Workflow File Structure
- Build Pipeline Details
- Scraper-to-Deploy Pipeline
- Caching Strategies
- Anti-Patterns
- Adding New Workflows Checklist

## Workflow File Structure

All workflows live in `.github/workflows/`. This project has two:

```
.github/workflows/
├── deploy.yml    # Push-to-main → build → FTP deploy
└── scrape.yml    # Weekly scrape → commit → build → FTP deploy
```

## Build Pipeline Details

The deploy workflow is the simpler pipeline — checkout, install, build, deploy:

```yaml
# .github/workflows/deploy.yml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - name: Deploy to GoDaddy via FTP
        uses: SamKirkland/FTP-Deploy-Action@v4.3.5
        with:
          server: ${{ secrets.FTP_HOST }}
          username: ${{ secrets.FTP_USER }}
          password: ${{ secrets.FTP_PASSWORD }}
          local-dir: ./_site/
          server-dir: /public_html/
```

The `cache: 'npm'` on `setup-node` caches `~/.npm` between runs, cutting install time significantly.

## Scraper-to-Deploy Pipeline

The scraper workflow chains Python and Node.js in a single job. This is intentional — the git commit step must happen between scraping and building so the build uses fresh data:

```yaml
# .github/workflows/scrape.yml — key steps
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - run: pip install -r scrapers/requirements.txt
      - run: python scrapers/run_all.py
      - name: Commit updated data
        run: |
          git config user.name "GitHub Actions Bot"
          git config user.email "actions@github.com"
          git add src/_data/resources/
          git diff --staged --quiet || git commit -m "Update scraped resource data"
          git push
      # Then Node.js build + deploy steps follow...
```

### WARNING: No Python Dependency Caching

**The Problem:**

```yaml
# BAD - pip install runs fresh every time (~30-60s)
- run: pip install -r scrapers/requirements.txt
```

**Why This Hurts:** Every weekly run reinstalls scrapling, httpx, and all transitive deps from scratch. For a weekly job this is tolerable, but wasteful.

**The Fix:**

```yaml
# GOOD - cache pip packages
- uses: actions/setup-python@v5
  with:
    python-version: '3.12'
    cache: 'pip'
- run: pip install -r scrapers/requirements.txt
```

Adding `cache: 'pip'` to `setup-python` works identically to the npm caching on `setup-node`.

## Caching Strategies

| Dependency | Cache Method | Key |
|-----------|-------------|-----|
| npm packages | `setup-node` with `cache: 'npm'` | `package-lock.json` hash |
| pip packages | `setup-python` with `cache: 'pip'` | `requirements.txt` hash |

## Anti-Patterns

### WARNING: Duplicated Deploy Steps

**The Problem:**

```yaml
# BAD - FTP deploy config copy-pasted in both workflows
# deploy.yml AND scrape.yml each have identical deploy steps
```

**Why This Breaks:** When you need to change the FTP action version, server directory, or add excludes, you must update both files. Drift between them causes inconsistent deployments.

**The Fix:** Extract to a reusable workflow:

```yaml
# .github/workflows/ftp-deploy.yml
name: FTP Deploy
on:
  workflow_call:
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: SamKirkland/FTP-Deploy-Action@v4.3.5
        with:
          server: ${{ secrets.FTP_HOST }}
          username: ${{ secrets.FTP_USER }}
          password: ${{ secrets.FTP_PASSWORD }}
          local-dir: ./_site/
          server-dir: /public_html/
```

Then call it from other workflows with `uses: ./.github/workflows/ftp-deploy.yml`.

### WARNING: No Build Validation

**The Problem:** Both workflows run `npm run build` but never validate the output. A broken template or missing data file produces a partial site that gets deployed anyway.

**The Fix:** Add a smoke test after build:

```yaml
      - run: npm run build
      - name: Validate build output
        run: |
          test -f _site/index.html || (echo "Build missing index.html" && exit 1)
          test -d _site/css || (echo "Build missing CSS directory" && exit 1)
```

## Adding New Workflows Checklist

Copy this checklist when creating a new workflow:

- [ ] Step 1: Create `.github/workflows/<name>.yml`
- [ ] Step 2: Define trigger (`on:` — push, schedule, workflow_dispatch)
- [ ] Step 3: Set `runs-on: ubuntu-latest`
- [ ] Step 4: Add `actions/checkout@v4` as first step
- [ ] Step 5: Set up language runtimes with caching
- [ ] Step 6: Use `npm ci` (never `npm install`) for Node.js
- [ ] Step 7: Add any required secrets to GitHub Settings
- [ ] Step 8: Test with `workflow_dispatch` before relying on triggers
- [ ] Step 9: Verify secrets are accessible (Settings → Secrets → Actions)

## Feedback Loop: Workflow Debugging

1. Push workflow changes to `main` (or use `workflow_dispatch`)
2. Check run status in **Actions** tab
3. If a step fails, read the log for that specific step
4. Fix the issue in the workflow YAML
5. Push again and repeat until all steps pass green
6. Only then remove `workflow_dispatch` if it was temporary

See the **eleventy** skill for build configuration. See the **python** skill for scraper pipeline details.
