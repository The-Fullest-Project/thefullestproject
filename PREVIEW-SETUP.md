# Preview site setup

`preview.thefullestproject.org` — a full copy of the site Nicole can try before
anything reaches the real one. Built from the `preview` branch.

## What is already done

- Cloudflare Pages project **`tfp-preview`** created (live at
  `https://tfp-preview.pages.dev` once it has its first deployment).
- `.github/workflows/preview.yml` builds the `preview` branch, stamps every page
  `noindex` and blocks crawlers in robots.txt, then deploys to that project.
- A `preview` branch exists.

## Three steps left (they need account access)

### 1. A Cloudflare API token for the Action

Dashboard → **My Profile → API Tokens → Create Token → Edit Cloudflare Workers**
(or a custom token with *Account → Cloudflare Pages → Edit*).

Then add it to GitHub:

```bash
gh secret set CLOUDFLARE_API_TOKEN   --repo The-Fullest-Project/thefullestproject
gh secret set CLOUDFLARE_ACCOUNT_ID  --repo The-Fullest-Project/thefullestproject
```

The account id is on the right-hand side of the Cloudflare dashboard overview.

### 2. Point the subdomain at it

Cloudflare Pages → **tfp-preview → Custom domains → Set up a custom domain** →
`preview.thefullestproject.org`. Cloudflare prints a CNAME; add it in GoDaddy
DNS:

| Type | Name | Value |
|---|---|---|
| CNAME | `preview` | `tfp-preview.pages.dev` |

Certificate issue takes up to ~30 minutes.

### 3. Push the branch once

```bash
git push origin preview
```

That triggers the first build and deploy.

## Using it

```bash
git checkout preview
git merge main          # start from what is live
# ...build the change...
git push origin preview # Nicole reviews at preview.thefullestproject.org
```

When she is happy, merge into `main` the usual way.

## When accounts and ratings arrive

The preview will need its **own database**, separate from the real one, so test
accounts and junk reviews never land in real records. That is a second D1
binding selected by branch — do it when the accounts work starts, not before.
