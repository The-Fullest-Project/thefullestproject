# Preview site

A full, private copy of the site for trying changes before they reach the real
one. **Live at https://preview.thefullestproject.org** behind a shared password.
(`tfp-preview.pages.dev` also works — same site.)

## How it is protected

`functions/_middleware.js` asks for one shared team password and remembers the
device for 30 days. Cloudflare Access would normally do this, but it can only
protect hostnames inside a Cloudflare zone and thefullestproject.org runs its
DNS at GoDaddy — so the gate lives in the site instead, which works anywhere.

The cookie stores an HMAC of the password, not the password, so changing it
signs every device out at once:

```bash
printf 'the-new-password' | npx wrangler pages secret put PREVIEW_PASSWORD --project-name=tfp-preview
npx wrangler pages deploy _site --project-name=tfp-preview --branch=preview
```

A Pages secret only binds on the **next** deployment — setting it alone changes
nothing until you redeploy.

## What preview deliberately leaves out

| Left out | Why |
|---|---|
| The admin portal (`/admin/`) | `portal.js` points at the production worker, so approving or deleting from a preview portal would change the **real** site |
| Search engines | `robots.txt`, a `noindex` meta tag on every page, and an `X-Robots-Tag` header |
| The app name | Installed as "The Fullest Project (Preview)" so a phone doesn't get two identical icons |

## Deploying by hand

```bash
npm run build
printf 'User-agent: *
Disallow: /
' > _site/robots.txt
find _site -name '*.html' -print0 | xargs -0 sed -i 's|<head>|<head><meta name="robots" content="noindex, nofollow">|'
rm -rf _site/admin
sed -i 's|"name": "The Fullest Project"|"name": "The Fullest Project (Preview)"|' _site/manifest.webmanifest
npx wrangler pages deploy _site --project-name=tfp-preview --branch=preview
```

`.github/workflows/preview.yml` does exactly this on every push to the
`preview` branch — once the two secrets below exist.

## Moving changes between preview and live

Run from the repo's **Actions** tab → *Move changes between preview and live* →
**Run workflow**, then pick a direction. No terminal needed.

| Direction | What it does | When |
|---|---|---|
| `refresh` | `main` → `preview` | Before Nicole reviews, so the preview shows the current resources |
| `publish` | `preview` → `main` | After she approves — this is what makes it live |

`publish` pushes to `main`, which triggers the normal deploy, so the change is
on thefullestproject.org a minute or two later.

### Why this stays clean

The two branches touch different files:

- **`main`** receives all the DATA commits — the weekly scrape, and every
  approve, reject, edit, merge and delete from the review portal.
- **`preview`** only ever receives CODE, because the portal is not deployed
  there. Nothing on the preview side can write a resource file.

So a merge either way is almost always a fast-forward or a clean three-way. If
it ever does conflict, the workflow **stops without pushing** and the run
summary prints the commands to resolve it locally, where both versions are
visible. It does not guess.

**The one rule that keeps it true:** never commit resource data on `preview`.
If a resource needs changing, do it in the portal on the live site, then
`refresh` to bring it into preview.

### By hand, if you prefer

```bash
git checkout preview && git merge main     # refresh
git checkout main && git merge preview     # publish
git push
```

## When accounts and ratings arrive

Preview will need its **own database and its own worker**, so test accounts and
junk reviews never touch real records — and so the admin portal can be included
here safely. Do that as part of the accounts work, not before.

## DNS: two domains, one of them a trap

The project owns **thefullestproject.org** (the real site) and
**thefullestproject.com** (unused). GoDaddy opens whichever you last looked at,
and several changes have gone into `.com` by mistake — including, for months,
the Brevo email records, which is why mail kept sending from a `brevosend.com`
address instead of the project's own domain.

Before editing DNS, check you are on the right one:

- the URL should read `dcc.godaddy.com/control/portfolio/thefullestproject.org/...`
- the MX row should read `thefullestproject-**org**.mail.protection.outlook.com`
- the Microsoft verification TXT is `NETORGFT20469436` on `.org`
  (`.com` is `NETORGFT11820090`)

### What `.org` should look like

| Record | Value |
|---|---|
| `@` A | GitHub Pages (185.199.108–111.153) |
| `www` CNAME | `pmberrigan.github.io` |
| `preview` CNAME | `tfp-preview.pages.dev` |
| `@` MX | `thefullestproject-org.mail.protection.outlook.com` |
| `@` TXT (SPF) | `v=spf1 include:spf.protection.outlook.com include:spf.brevo.com -all` |
| `@` TXT | `brevo-code:...` |
| `brevo1/2._domainkey` CNAME | `b1/b2.thefullestproject-**org**.dkim.brevo.com` |
| `_dmarc` TXT | `v=DMARC1; p=none; rua=mailto:rua@dmarc.brevo.com` |

**Exactly one SPF record.** A second one silently invalidates both. The current
one costs 2 of the 10 permitted DNS lookups, so there is room to add a sender
later if needed.

Verify from the command line rather than trusting the dashboard:

```bash
nslookup -type=TXT thefullestproject.org ns67.domaincontrol.com
```

That asks GoDaddy's own nameserver and skips every cache — which is how the
`.com` mix-up was found.
