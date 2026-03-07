# FTP Deployment Workflows

## Contents
- Local Deploy Workflow
- CI/CD Deploy Pipeline
- Weekly Scrape-and-Deploy Pipeline
- Troubleshooting
- Adding Pre/Post-Deploy Steps

## Local Deploy Workflow

### Prerequisites Checklist

Copy this checklist and track progress:
- [ ] Step 1: Verify `.env` exists with valid FTP credentials
- [ ] Step 2: Run `npm run build` to confirm the site builds without errors
- [ ] Step 3: Inspect `_site/` to verify expected output
- [ ] Step 4: Run `npm run deploy`
- [ ] Step 5: Verify the live site in a browser

### Running the Deploy

```bash
# Full build + deploy in one command
npm run deploy
```

This executes:
1. `npm run build` (Eleventy build, then Tailwind CSS compilation with minification)
2. `node deploy.js` (FTP upload of `_site/` to `/public_html/`)

### Validation Loop

1. Run `npm run deploy`
2. Check terminal output for "Deploy complete!" or errors
3. If deploy fails, check the error message:
   - Connection refused: verify `FTP_HOST` in `.env`
   - Authentication failed: verify `FTP_USER` and `FTP_PASSWORD`
   - Timeout: check network connectivity, retry once
4. If deploy succeeds, verify the live site at the production URL
5. If the live site looks wrong, check that `npm run build` ran without warnings

## CI/CD Deploy Pipeline

### Trigger: Push to Main

The `.github/workflows/deploy.yml` workflow runs automatically on every push to `main`:

```yaml
on:
  push:
    branches: [main]
```

### Pipeline Steps

```
checkout → setup Node 20 → npm ci → npm run build → FTP upload
```

The CI pipeline uses `SamKirkland/FTP-Deploy-Action@v4.3.5` instead of `deploy.js`. Key difference: the action does **incremental sync** (only changed files), while `deploy.js` does a full wipe-and-replace.

### Required GitHub Secrets

Three secrets must be configured in the repository settings:

| Secret | Value |
|--------|-------|
| `FTP_HOST` | GoDaddy FTP hostname |
| `FTP_USER` | FTP username |
| `FTP_PASSWORD` | FTP password |

To configure: Repository Settings > Secrets and variables > Actions > New repository secret.

See the **github-actions** skill for workflow configuration details.

## Weekly Scrape-and-Deploy Pipeline

The `.github/workflows/scrape.yml` workflow runs scrapers, commits updated data, then builds and deploys:

```
checkout → Python 3.12 → pip install → run scrapers → git commit → Node 20 → npm ci → build → FTP deploy
```

```yaml
on:
  schedule:
    - cron: '0 0 * * 0'  # Every Sunday at midnight UTC
  workflow_dispatch:       # Manual trigger
```

### Manual Trigger

Trigger from GitHub: Actions tab > "Weekly Scrape and Deploy" > Run workflow.

### Data Flow

1. Scrapers write updated JSON to `src/_data/resources/`
2. Git commit captures the new data
3. Eleventy builds pages using the fresh resource data
4. FTP action uploads the new build

See the **python** skill for scraper pipeline details.

## Troubleshooting

### Connection Timeout

**Symptom:** Deploy hangs, then fails with ETIMEDOUT or ECONNREFUSED.

**Causes:**
- Wrong `FTP_HOST` value
- Firewall blocking FTP ports (21, 990 for FTPS)
- GoDaddy server temporarily down

**Fix:**
```bash
# Verify the host resolves
nslookup $FTP_HOST

# Test port connectivity
curl -v --connect-timeout 5 ftps://$FTP_HOST
```

### Authentication Failed (530)

**Symptom:** "530 Login authentication failed" or similar.

**Fix:** Verify credentials. GoDaddy FTP credentials are separate from the hosting account password. Check the GoDaddy hosting dashboard under FTP Users.

### Too Many Connections (421)

**Symptom:** "421 Too many connections from your IP."

**Causes:**
- Previous deploy crashed without closing the connection
- Multiple deploys running simultaneously

**Fix:** Wait 2-3 minutes for stale connections to time out, then retry. GoDaddy shared hosting limits concurrent FTP connections.

### Permission Denied (550)

**Symptom:** "550 Permission denied" when writing files.

**Causes:**
- FTP user doesn't have write access to `/public_html/`
- `FTP_REMOTE_DIR` points to a directory outside the user's scope

**Fix:** Verify the FTP user has write permissions in GoDaddy's FTP settings. Confirm `FTP_REMOTE_DIR` is correct (default `/public_html`).

### Empty Site After Deploy

**Symptom:** Site shows blank page or 404 after deploy.

**Causes:**
- `npm run build` failed silently, `_site/` is empty
- CSS didn't compile (missing `output.css`)

**Fix:**
```bash
# Verify build output exists
ls _site/
ls _site/css/output.css

# If missing, rebuild
npm run build
```

## Adding Pre/Post-Deploy Steps

### Protecting Non-Build Files

If the server has files that shouldn't be deleted (e.g., `.htaccess`, uploaded media), remove `clearWorkingDir()` from `deploy.js`:

```javascript
// Before (destructive - deletes everything first)
await client.ensureDir(remoteDir);
await client.clearWorkingDir();
await client.uploadFromDir(localDir);

// After (additive - only overwrites matching files)
await client.ensureDir(remoteDir);
await client.uploadFromDir(localDir);
```

### Adding a Build Verification Step

Add a check between build and upload to catch empty builds:

```javascript
const fs = require('fs');

const localDir = path.join(__dirname, '_site');

// Verify build output exists
if (!fs.existsSync(localDir) || fs.readdirSync(localDir).length === 0) {
  console.error('Build output is empty. Run npm run build first.');
  process.exit(1);
}
```

### Excluding Files from CI Deploy

The `SamKirkland/FTP-Deploy-Action` supports exclude patterns:

```yaml
- name: Deploy to GoDaddy via FTP
  uses: SamKirkland/FTP-Deploy-Action@v4.3.5
  with:
    server: ${{ secrets.FTP_HOST }}
    username: ${{ secrets.FTP_USER }}
    password: ${{ secrets.FTP_PASSWORD }}
    local-dir: ./_site/
    server-dir: /public_html/
    exclude: |
      **/.git*
      **/node_modules/**
```
