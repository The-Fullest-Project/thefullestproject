# tfp-admin-api Worker

Backend for the admin review portal at `/admin/review/` and the public
resource-submission and newsletter intake. Companion to the gig-publisher
worker in `../cloudflare-worker/`.

## Routes

| Route | Auth | Purpose |
|-------|------|---------|
| `POST /submit` | public | Resource form intake → `pending/submissions.json` + Formspree forward + Brevo thank-you (new emails only) |
| `POST /newsletter` | public | Newsletter signup → Brevo double-opt-in + Formspree forward |
| `GET /pending` | admin | All pending envelopes across `pending/` |
| `POST /approve` | admin | `{items:[{id, file, payload?}]}` or `{all:true, type?}` — moves payloads into live data in ONE atomic commit |
| `POST /reject` | admin | `{items:[{id, file}], block?:true}` — removes envelopes; blocklists scraper-origin items |
| `POST /bulk-import` | admin | `{items:[resource fields], detail?, publish?:false}` — queue (default) or direct-publish |
| `GET /emails` | admin | Brevo contacts proxy (read-only; API key never reaches the browser) |
| `GET /health` | public | `{status: "ok"}` |

Admin auth: `Authorization: token <github-oauth-token>` (or `Bearer`) — the
worker verifies the token's account has **push permission** on the repo.
`X-Admin-Key: <ADMIN_KEY>` works as a break-glass alternative for curl.

## Approval semantics

| Type | On approve |
|------|-----------|
| resource / submission | Append to `targetFile` (state file via location map) + stamp `dateAdded` + `origin`; skip if already live |
| story | Prepend to `stories.json`, `addedDate`, sort by date desc, cap 6 |
| spotlight | Prepend + `approvedAt`; exactly one featured (the newest approved) |
| blog | Create `src/blog/<slug>.md` (template ported from `blog_content.py` — keep in sync); 409 if slug exists |

On reject (default `block: true`): scraper-origin items get their URL/name
appended to `scrapers/blocklist.json` so they can never re-queue.

All writes go through the git data API as a single atomic commit. On a
concurrent-commit conflict the worker re-reads every touched file, re-applies
the mutations, and retries (×3) — safe against the weekly scrape commit and
second admins. Commits to `main` auto-deploy via the existing Pages workflow.

## Deploy

```bash
cd cloudflare-worker-admin-api
npx wrangler deploy
# then set each secret:
npx wrangler secret put GITHUB_TOKEN     # same PAT as the gig worker
npx wrangler secret put GITHUB_REPO      # The-Fullest-Project/thefullestproject
npx wrangler secret put ALLOWED_ORIGIN   # https://thefullestproject.org
npx wrangler secret put ADMIN_KEY
npx wrangler secret put FORMSPREE_SUBMIT_ID      # xpqywwla
npx wrangler secret put FORMSPREE_NEWSLETTER_ID  # meeroozw
npx wrangler secret put BREVO_API_KEY
npx wrangler secret put BREVO_LIST_ID
npx wrangler secret put BREVO_THANKYOU_TEMPLATE_ID
npx wrangler secret put BREVO_DOI_TEMPLATE_ID
```

Brevo features no-op gracefully until the `BREVO_*` secrets are set, so the
worker can ship before the Brevo account exists.

## Local testing

```bash
npx wrangler dev
# .dev.vars file (gitignored) holds the env vars; point GITHUB_REPO at a fork.
curl -X POST http://localhost:8787/submit -d "resourceName=Test&location=Virginia&category=therapy&description=Test"
curl http://localhost:8787/pending -H "X-Admin-Key: <key>"
```
