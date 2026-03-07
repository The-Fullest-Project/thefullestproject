# Deployment Reference

## Contents
- Deployment Architecture
- FTP Deploy Action Configuration
- Local Deploy Script
- Environment Variables
- Anti-Patterns
- Deployment Checklist

## Deployment Architecture

Two deployment paths exist:

| Path | Tool | When |
|------|------|------|
| CI/CD | `SamKirkland/FTP-Deploy-Action@v4.3.5` | Automatic on push to `main` or after scrape |
| Local | `node deploy.js` via `npm run deploy` | Manual local deploys |

Both upload the built `_site/` directory to GoDaddy's `/public_html/` via FTP over TLS.

## FTP Deploy Action Configuration

```yaml
      - name: Deploy to GoDaddy via FTP
        uses: SamKirkland/FTP-Deploy-Action@v4.3.5
        with:
          server: ${{ secrets.FTP_HOST }}
          username: ${{ secrets.FTP_USER }}
          password: ${{ secrets.FTP_PASSWORD }}
          local-dir: ./_site/
          server-dir: /public_html/
```

The action uses `.ftp-deploy-sync-state.json` on the server to track which files changed, avoiding full re-uploads on every deploy. This file is managed automatically.

### Excluding Files from Deploy

To skip files (e.g., source maps, draft content):

```yaml
          exclude: |
            **/.git*
            **/.git*/**
            **/node_modules/**
            **/.env
```

## Local Deploy Script

`deploy.js` uses `basic-ftp` for manual deployments:

```javascript
// deploy.js
require('dotenv').config();
const ftp = require('basic-ftp');
const path = require('path');

async function deploy() {
  const client = new ftp.Client();
  client.ftp.verbose = true;

  try {
    await client.access({
      host: process.env.FTP_HOST,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASSWORD,
      secure: true
    });

    const localDir = path.join(__dirname, '_site');
    const remoteDir = process.env.FTP_REMOTE_DIR || '/public_html';

    await client.ensureDir(remoteDir);
    await client.clearWorkingDir();
    await client.uploadFromDir(localDir);
  } catch (err) {
    console.error('Deploy failed:', err);
    process.exit(1);
  } finally {
    client.close();
  }
}

deploy();
```

Run with: `npm run deploy` (builds first, then deploys).

### WARNING: `clearWorkingDir()` Deletes Everything

**The Problem:** The local `deploy.js` calls `client.clearWorkingDir()` which removes ALL files in `/public_html/` before uploading. If the build is incomplete or fails partway through the upload, the site goes down.

**Why This Breaks:** Unlike the GitHub Actions FTP action (which does incremental sync), the local script does a destructive full replace. A network interruption mid-upload leaves a broken site.

**The Fix:** The CI/CD pipeline via `SamKirkland/FTP-Deploy-Action` is safer — it syncs incrementally. Prefer CI/CD deployments over local `npm run deploy` for production.

## Environment Variables

### CI/CD (GitHub Secrets)

Set in **Settings → Secrets and variables → Actions → Repository secrets**:

| Secret | Value |
|--------|-------|
| `FTP_HOST` | GoDaddy FTP hostname |
| `FTP_USER` | FTP username |
| `FTP_PASSWORD` | FTP password |

### Local (`.env` file)

Copy from `.env.example`:

```bash
FTP_HOST=ftp.thefullestproject.org
FTP_USER=your-ftp-username
FTP_PASSWORD=your-ftp-password
FTP_REMOTE_DIR=/public_html
```

### WARNING: Never Commit `.env`

**The Problem:**

```bash
# BAD - .env contains real credentials
git add .env
git commit -m "add config"
```

**Why This Breaks:** FTP credentials in version history are permanent, even after removal. Attackers can upload malicious content to the production site.

**The Fix:** `.env` is already in `.gitignore`. Never override this. Use GitHub Secrets for CI/CD.

## Anti-Patterns

### WARNING: Deploying Without Building First

**The Problem:**

```bash
# BAD - deploys stale _site/ directory
node deploy.js
```

**The Fix:**

```bash
# GOOD - npm run deploy builds first
npm run deploy  # Runs "npm run build && node deploy.js"
```

### WARNING: No Rollback Strategy

**The Problem:** Neither deployment path supports rollback. If a broken build deploys, the only recovery is to fix and redeploy.

**The Fix for CI/CD:** Re-run the last successful workflow from the Actions tab, or revert the commit and push.

**The Fix for local:** Keep a local copy of `_site/` from the last known-good build before deploying.

## Deployment Checklist

Copy this checklist before first-time setup or debugging:

- [ ] Step 1: Verify `.env` file exists locally (copy from `.env.example`)
- [ ] Step 2: Test FTP credentials with a manual connection
- [ ] Step 3: Verify GitHub Secrets are set (`FTP_HOST`, `FTP_USER`, `FTP_PASSWORD`)
- [ ] Step 4: Run `npm run build` locally and verify `_site/` output
- [ ] Step 5: Test deploy with `npm run deploy` locally
- [ ] Step 6: Push to `main` and verify Actions workflow succeeds
- [ ] Step 7: Check the live site for correct content

## Feedback Loop: Deploy Verification

1. Push changes to `main`
2. Monitor the Actions tab for the "Build and Deploy" workflow
3. If deploy step fails, check FTP credentials and server availability
4. If build step fails, run `npm run build` locally to reproduce
5. Fix the issue and push again
6. Verify the live site reflects changes

See the **ftp** skill for FTP protocol details. See the **eleventy** skill for build output structure.
