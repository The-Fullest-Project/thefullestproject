# FTP Deployment Patterns

## Contents
- Connection and Authentication
- Upload Strategy
- Credential Management
- Error Handling
- WARNING: Anti-Patterns

## Connection and Authentication

The project uses FTPS (FTP over TLS) via `basic-ftp`. The `secure: true` flag is mandatory for GoDaddy.

```javascript
// deploy.js - Connection pattern
await client.access({
  host: process.env.FTP_HOST,
  user: process.env.FTP_USER,
  password: process.env.FTP_PASSWORD,
  secure: true   // FTPS - required by GoDaddy
});
```

### WARNING: Never Disable TLS

```javascript
// BAD - Credentials sent in plaintext over the wire
await client.access({
  host: process.env.FTP_HOST,
  user: process.env.FTP_USER,
  password: process.env.FTP_PASSWORD,
  secure: false
});
```

**Why This Breaks:**
1. FTP credentials are transmitted unencrypted - anyone on the network can intercept them
2. GoDaddy will reject non-TLS connections on many hosting plans
3. Violates PCI compliance if the site handles any user data

```javascript
// GOOD - Always use secure: true
await client.access({
  host: process.env.FTP_HOST,
  user: process.env.FTP_USER,
  password: process.env.FTP_PASSWORD,
  secure: true
});
```

## Upload Strategy

The deploy script uses a **full replace** strategy: clear remote directory, then upload the entire `_site/` build output.

```javascript
// deploy.js - Full replace upload
const localDir = path.join(__dirname, '_site');
const remoteDir = process.env.FTP_REMOTE_DIR || '/public_html';

await client.ensureDir(remoteDir);    // Create if missing
await client.clearWorkingDir();        // Delete all remote files
await client.uploadFromDir(localDir);  // Upload entire build
```

The CI pipeline uses `SamKirkland/FTP-Deploy-Action` which does **incremental sync** by default (only uploads changed files). This is faster and safer for CI.

```yaml
# .github/workflows/deploy.yml - Incremental sync
- name: Deploy to GoDaddy via FTP
  uses: SamKirkland/FTP-Deploy-Action@v4.3.5
  with:
    server: ${{ secrets.FTP_HOST }}
    username: ${{ secrets.FTP_USER }}
    password: ${{ secrets.FTP_PASSWORD }}
    local-dir: ./_site/
    server-dir: /public_html/
```

### DO: Use Verbose Logging for Debug

```javascript
// GOOD - Enables FTP protocol-level logging
const client = new ftp.Client();
client.ftp.verbose = true;
```

This logs every FTP command and response. Essential for diagnosing connection timeouts, permission errors, and upload failures. Disable in production if log noise is a concern.

### DON'T: Upload Source Instead of Build Output

```javascript
// BAD - Uploads raw source, not built site
const localDir = path.join(__dirname, 'src');
await client.uploadFromDir(localDir);

// GOOD - Uploads the built _site/ directory
const localDir = path.join(__dirname, '_site');
await client.uploadFromDir(localDir);
```

The `_site/` directory is Eleventy's build output. Uploading `src/` would push Nunjucks templates and uncompiled CSS to the server, which the browser cannot render. Always run `npm run build` before deploying. The `npm run deploy` script handles this automatically.

## Credential Management

### Local Development

Credentials live in `.env` (gitignored). Copy from the template:

```bash
cp .env.example .env
```

```
# .env.example
FTP_HOST=ftp.thefullestproject.org
FTP_USER=your-ftp-username
FTP_PASSWORD=your-ftp-password
FTP_REMOTE_DIR=/public_html
```

`deploy.js` loads these via `dotenv`:

```javascript
require('dotenv').config();
```

### CI/CD

GitHub Actions uses repository secrets. The workflow references them as:

```yaml
server: ${{ secrets.FTP_HOST }}
username: ${{ secrets.FTP_USER }}
password: ${{ secrets.FTP_PASSWORD }}
```

### WARNING: Never Commit Credentials

```javascript
// BAD - Hardcoded credentials
await client.access({
  host: 'ftp.thefullestproject.org',
  user: 'admin',
  password: 'p@ssw0rd',
  secure: true
});
```

**Why This Breaks:**
1. Credentials are visible in git history forever, even after removal
2. Anyone with repo access gains server access
3. Automated bots scrape GitHub for exposed credentials within minutes

**The Fix:** Always use environment variables. Verify `.env` is in `.gitignore`.

## Error Handling

The deploy script uses try/catch/finally to ensure the FTP connection is always closed:

```javascript
try {
  await client.access({ /* ... */ });
  await client.ensureDir(remoteDir);
  await client.clearWorkingDir();
  await client.uploadFromDir(localDir);
  console.log('Deploy complete!');
} catch (err) {
  console.error('Deploy failed:', err);
  process.exit(1);    // Non-zero exit for CI to detect failure
} finally {
  client.close();      // Always close, even on error
}
```

### WARNING: Never Omit client.close()

**The Problem:** Leaving FTP connections open exhausts the server's connection pool. GoDaddy shared hosting typically limits to 8-10 concurrent FTP connections. Leaked connections cause subsequent deploys to hang with "421 Too many connections" errors.

**The Fix:** Always close in a `finally` block, as the current code does.

## Integration with Build Pipeline

The deploy is the final step in a two-command chain defined in `package.json`:

```json
{
  "scripts": {
    "deploy": "npm run build && node deploy.js"
  }
}
```

This ensures Eleventy generates pages and Tailwind compiles CSS before any files are uploaded. See the **eleventy** skill for build configuration.
