# Preview site

A full, private copy of the site for trying changes before they reach the real
one. **Live now at https://tfp-preview.pages.dev** behind a shared password.

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

## Two optional improvements

### 1. Deploy automatically on push

Needs a Cloudflare API token so the Action can deploy:

- Cloudflare dashboard → My Profile → API Tokens → Create Token →
  **Edit Cloudflare Workers** (or a custom token with *Account → Cloudflare Pages → Edit*)

```bash
gh secret set CLOUDFLARE_API_TOKEN  --repo The-Fullest-Project/thefullestproject
gh secret set CLOUDFLARE_ACCOUNT_ID --repo The-Fullest-Project/thefullestproject   # a3735a4b810e5abcabd6dcdd298c9513
```

Until then, deploy by hand with the commands above.

### 2. A friendlier address

`preview.thefullestproject.org` instead of `tfp-preview.pages.dev`:

- Cloudflare Pages → tfp-preview → Custom domains → Set up a custom domain
- GoDaddy DNS → add `CNAME` · name `preview` · value `tfp-preview.pages.dev`

Certificates take up to ~30 minutes. Everything works without this.

## Day to day

```bash
git checkout preview && git merge main    # start from what is live
# ...build the change, deploy, Nicole reviews...
git checkout main && git merge preview    # when she is happy
```

## When accounts and ratings arrive

Preview will need its **own database and its own worker**, so test accounts and
junk reviews never touch real records — and so the admin portal can be included
here safely. Do that as part of the accounts work, not before.
