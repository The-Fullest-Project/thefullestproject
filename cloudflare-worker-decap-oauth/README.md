# Decap CMS OAuth Proxy (Cloudflare Worker)

Handles the GitHub OAuth handshake for the Decap CMS admin at
`https://thefullestproject.org/admin/`, since GitHub Pages can't hold the
OAuth App client secret or do server-side token exchange.

## One-time setup

### 1. Register a GitHub OAuth App

Under the `The-Fullest-Project` account → Settings → Developer settings →
OAuth Apps → **New OAuth App**

- **Application name**: `The Fullest Project CMS`
- **Homepage URL**: `https://thefullestproject.org`
- **Authorization callback URL**: `https://decap-oauth.<your-subdomain>.workers.dev/callback`
  (Set this AFTER the Worker is deployed once so you know its URL, then edit.)

Save the **Client ID** and generate a **Client Secret**.

### 2. Deploy the Worker

```bash
cd cloudflare-worker-decap-oauth
npx wrangler login                        # once
npx wrangler deploy                       # first deploy — gives you the URL
```

Note the URL printed, e.g. `https://decap-oauth.<subdomain>.workers.dev`.

### 3. Set the OAuth App callback URL

Go back to the GitHub OAuth App and set **Authorization callback URL** to
`https://decap-oauth.<subdomain>.workers.dev/callback`.

### 4. Set Worker secrets

```bash
npx wrangler secret put GITHUB_CLIENT_ID
npx wrangler secret put GITHUB_CLIENT_SECRET
npx wrangler secret put ALLOWED_ORIGIN
# enter: https://thefullestproject.org
```

### 5. Update `src/admin/config.yml`

Add two fields to the `backend` block:

```yaml
backend:
  name: github
  repo: The-Fullest-Project/thefullestproject
  branch: main
  base_url: https://decap-oauth.<subdomain>.workers.dev
  auth_endpoint: auth
```

Commit and push — deploy workflow will publish the new config.

## Verifying

1. Visit `https://thefullestproject.org/admin/`
2. Click **Login with GitHub** — popup should go to `decap-oauth.<subdomain>.workers.dev/auth`, then to GitHub's authorize page
3. Approve — popup closes, CMS loads with your repo contents

## Troubleshooting

- **Popup says "Not Found"** → Worker isn't deployed or `base_url` in config.yml is wrong
- **"Invalid OAuth state"** → Cookie was blocked (third-party cookie settings) or Worker is on a different domain than the callback; keep everything on the workers.dev subdomain
- **"Token exchange failed"** → Client ID/Secret mismatch or callback URL in OAuth App doesn't match the Worker's `/callback` endpoint exactly
- **CMS loads but says "Not authorized"** → The GitHub user doesn't have push access to the repo; add them as a collaborator on `The-Fullest-Project/thefullestproject`
