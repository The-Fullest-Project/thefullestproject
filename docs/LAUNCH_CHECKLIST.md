# The Fullest Project - Launch Checklist

Everything that needs to happen before (and shortly after) the site goes fully live. Items are grouped by priority. Check off each item as you complete it.

---

## CRITICAL - Site Won't Work Without These

### [x] Set Up Formspree Forms
Done. All 5 Formspree forms are created and IDs configured in `src/_data/site.json`:

- **Contact** (`mzdjzzvw`)
- **Submit Resource** (`xpqywwla`)
- **Newsletter** (`meeroozw`)
- **Gig Submission** (`xojkvvlo`)
- **Gig Response** (`mreybbab`)

### [x] Push Code to GitHub
Done. The site auto-deploys when you push to the `main` branch.

- Repo: <https://github.com/PMBerrigan/thefullestproject>

### [x] Enable GitHub Pages
Done. GitHub Pages is enabled with GitHub Actions as the build source.

- Settings: <https://github.com/PMBerrigan/thefullestproject/settings/pages>

### [x] Point GoDaddy Domain to GitHub Pages
Done. DNS records configured and custom domain verified.

- Site is live at <https://thefullestproject.org>
- **Remaining:** Check "Enforce HTTPS" in GitHub Pages settings once the SSL certificate is issued (may take up to 30 minutes)

---

## HIGH PRIORITY - Should Be Done Before Sharing Publicly

### [ ] Set Up Every.org for Donations
The `/donate/` page has a placeholder link. To accept real donations:
1. Go to https://www.every.org/nonprofits and register The Fullest Project
2. Once approved, get your nonprofit slug (e.g. `the-fullest-project`)
3. Open `src/pages/donate.njk` and replace the placeholder link:
   ```html
   <!-- Replace this line: -->
   <a href="https://www.every.org" ...>Donate via Every.org</a>
   <!-- With: -->
   <a href="https://www.every.org/the-fullest-project#/donate" ...>Donate via Every.org</a>
   ```
4. Optional: Every.org also provides an embeddable widget — see their docs for the script tag

### [ ] Decide on Community Equipment Exchange
On the Adaptive Equipment page (`/adaptive-equipment/`) there's a "Buy Nothing" style equipment exchange section. Currently the "Join the Community" button goes to the generic contact form.

**Options — pick one:**
- **Facebook Group:** Create a private Facebook group, then update the link in `src/pages/adaptive-equipment.njk` (line ~90) to point to the group URL
- **Interest signup:** Change it to collect emails of interested families (we can set up a Formspree form for this)
- **Remove for now:** Take the section out until you're ready to launch it

### [ ] Add a Real Favicon/Logo
Currently using a placeholder SVG favicon (`src/images/favicon.svg`) with just an "F". Once you have a real logo:
1. Replace `src/images/favicon.svg` with your logo file
2. For best browser support, also create a `favicon.ico` (32x32) and add it to `src/images/`
3. If using a non-SVG format, update the `<link>` tag in `src/_includes/layouts/base.njk`

### [ ] Add an og:image for Social Sharing
When people share links to your site on Facebook, Twitter, etc., it shows a preview image. Currently it falls back to the favicon.
1. Create a branded image (1200x630 pixels recommended) — your logo on a solid background works great
2. Save it as `src/images/og-image.jpg`
3. Update `src/_includes/layouts/base.njk` — change the og:image line:
   ```html
   <meta property="og:image" content="{{ site.url }}/images/og-image.jpg">
   ```

### [ ] Set Up Decap CMS (Blog Editor)
The `/admin/` page lets you write blog posts visually, but it needs GitHub OAuth to work on the live site.

**Option A — Use Decap's free OAuth service:**
1. Go to https://app.netlify.com and create a free account
2. Connect your GitHub repo
3. Go to Site Settings > Access Control > OAuth > Install Provider > GitHub
4. Get your Client ID and Secret
5. Update `src/admin/config.yml` to add the Netlify site URL

**Option B — Just edit on GitHub:**
Skip the CMS setup entirely. Write blog posts by creating `.md` files in `src/blog/` directly on GitHub (the SITE_GUIDE explains how).

---

## MEDIUM PRIORITY - Improve Before Wider Launch

### [ ] Add Social Media Links
Update `src/_data/site.json` with your Instagram and Facebook URLs:
```json
"social": {
  "instagram": "https://instagram.com/thefullestproject",
  "facebook": "https://facebook.com/thefullestproject"
}
```
The footer could be updated to display these (currently empty).

### [ ] Review All Resource Data
The site has 500+ resources across all 50 states, but they were populated via automated research. Review for:
- Dead links (websites that no longer work)
- Inaccurate descriptions
- Missing resources you know about in your area
- Resources that have changed their services

### [ ] Set Up Google Analytics
Google Analytics is already wired into the site — you just need a measurement ID.

1. Go to <https://analytics.google.com> and create a free account
2. Create a new property for `thefullestproject.org`
3. Get your Measurement ID (looks like `G-XXXXXXXXXX`)
4. Open `src/_data/site.json` and set the value:
   ```json
   "googleAnalytics": "G-XXXXXXXXXX"
   ```
5. Rebuild and deploy — analytics will start tracking automatically

---

### [x] Set Up Cloudflare Worker for Gig Auto-Publish
The gig platform uses a Cloudflare Worker (free tier: 100K requests/day) to auto-publish submissions. The Worker receives form data, validates it, commits to `gigs.json` via the GitHub API, and forwards to Formspree for email confirmation.

1. **Create a Cloudflare account** at https://dash.cloudflare.com (free)
2. **Install Wrangler CLI:**
   ```bash
   npm install -g wrangler
   wrangler login
   ```
3. **Deploy the Worker:**
   ```bash
   cd cloudflare-worker
   wrangler deploy
   ```
4. **Set environment variables** in the Cloudflare dashboard (Workers > gig-publisher > Settings > Variables):
   - `GITHUB_TOKEN` (secret) — GitHub PAT with `repo` scope (create at https://github.com/settings/tokens)
   - `GITHUB_REPO` — `PMBerrigan/thefullestproject`
   - `FORMSPREE_ID` — `xojkvvlo`
   - `ALLOWED_ORIGIN` — `https://thefullestproject.org`
5. **Copy your Worker URL** (e.g., `https://gig-publisher.<your-account>.workers.dev`)
6. **Update `src/_data/site.json`** — set `gigWorkerUrl` to your Worker URL:
   ```json
   "gigWorkerUrl": "https://gig-publisher.<your-account>.workers.dev"
   ```
7. **Test** by submitting a test gig at `/gigs/post/` — it should go live within 2-3 minutes

**Fallback:** If the Worker URL is not configured, the form falls back to standard Formspree submission. Gigs submitted via Formspree can be published manually:
```bash
python scrapers/sources/process_gig.py '{"title":"...","type":"seeking-help","category":"research","description":"...","location":"National","compensation":"paid","posterFirstName":"Test","posterEmail":"test@example.com"}'
git add src/_data/gigs.json && git commit -m "Add new gig" && git push
```

---

## NICE TO HAVE - Can Do Anytime

### [ ] Add More Blog Posts
The site launches with one welcome post. Plan to publish regularly:
- Caregiver tips and advice
- Resource spotlights
- Community stories
- Advocacy news

### [ ] Start the Podcast
The `/podcast/` page exists but is empty. When ready:
1. Record episodes
2. Host audio on a podcast platform (Anchor, Buzzsprout, etc.)
3. Create `.md` files in `src/podcast/` with episode details

### [ ] Promote the Quick Submit Bookmarklet
Share the `/quick-submit/` page with therapists, teachers, social workers, and support groups. The more people using it, the faster the directory grows.

### [ ] Set Up a Custom Email
If not already done, set up `hello@thefullestproject.org` through GoDaddy or Google Workspace.

---

## Technical Debt (For Developer Reference)

### [ ] Equipment Loaner Section Uses Old Data Path
`src/pages/adaptive-equipment.njk` lines 54-64 still reference `resources.nova` (the old per-location data). Should be updated to filter from `allResources` instead:
```njk
{% for resource in allResources %}
  {% if "equipment" in resource.category %}
  ...
  {% endif %}
{% endfor %}
```

### [ ] Adaptive Clothing Section Uses Old Data Path
Same file, lines 71-82 reference `resources.national`. Should also use `allResources`.

### [ ] Footer Copyright Year is Hardcoded
`src/_includes/components/footer.njk` line 52 has `2026` hardcoded. Could be made dynamic.

### [ ] Bookmarklet URL is Hardcoded
`src/pages/quick-submit.njk` has `thefullestproject.org` hardcoded in the bookmarklet JavaScript. If the domain ever changes, this needs updating.

---

*Last updated: March 2026*
