# The Fullest Project — Subscriber Experience & Monthly Mailer Business Plan

## Current State: "Stay Connected" Gap

The site footer on every page has a "Stay Connected" newsletter signup form (Formspree form ID `meeroozw`). When a user enters their email and clicks Subscribe:

- **What happens:** Their email is stored in Formspree's submission log, visible in the [Formspree dashboard](https://formspree.io/).
- **What doesn't happen:** No confirmation email. No welcome message. No weekly updates. No content of any kind is ever sent to the subscriber.

**This is the #1 gap to close.** Users who sign up and hear nothing will lose trust. The form is collecting emails with an implied promise ("Get updates on new resources, articles, and community news") that isn't being fulfilled.

**To fix this**, an email delivery platform must be selected and integrated before any subscription tiers or preference options are added. See the [platform comparison](#email--subscription-platform) below. Until then, the form collects emails that can be imported into the chosen platform once it's ready.

---

## Concept

A physical monthly subscription mailer inspired by [The Tiny Farmers Market](https://www.thetinyfarmersmarket.com). Each envelope contains a commissioned piece of art (card, postcard, bookmark print) created by a disability artist, a personal letter from the artist about what "living life to the fullest" means to them, plus bonus items like stickers, recipes, or affirmation cards. Everything fits in a single standard envelope requiring only one stamp.

## Value Proposition

**For subscribers:** A monthly moment of connection, inspiration, and tangible beauty from artists with disabilities — delivered to your mailbox. Not another digital notification, but something you can hold, hang on your fridge, or give to a friend.

**For artists:** Paid commissions, exposure, and a platform to share their perspective with a caring audience.

**For the mission:** A sustainable revenue stream that directly supports disability artists while building community among caregivers.

---

## Pricing Strategy

| Tier | Monthly Price | Includes | Margin Target |
|------|--------------|----------|---------------|
| **Standard** | $9.99/mo | 1 art piece + artist letter + 1 bonus item | 55-60% |
| **Supporter** | $14.99/mo | Standard + extra art print + recognition on site | 60-65% |
| **Gift (3-month)** | $27.99 prepaid | 3 months of Standard, shipped monthly | 50-55% |
| **Gift (12-month)** | $99.99 prepaid | 12 months of Standard | 55-60% |

### Cost Breakdown (Standard tier)

| Item | Est. Cost |
|------|-----------|
| Art commission (per subscriber print) | $0.50-1.00 (bulk printing from original) |
| Artist fee (flat per month) | $200-500 per artist |
| Envelope + stamp | $0.85 (Forever stamp + #10 envelope) |
| Bonus item (sticker, bookmark) | $0.15-0.30 |
| Printing (card/postcard, letter) | $0.40-0.60 |
| Packing materials & labor | $0.50-1.00 |
| **Total COGS per unit** | **$2.40-3.75** |
| **Gross margin at $9.99** | **$6.24-7.59 (62-76%)** |

**Break-even:** Artist fee of $350/month ÷ $6.50 avg margin = ~54 subscribers to break even on artist costs. With 100 subscribers, net ~$300/month after artist fees. At 500 subscribers, net ~$2,900/month.

---

## Subscriber Acquisition

### On-Site (thefullestproject.org)

1. **Dedicated landing page** at `/mailer/` with:
   - Hero image of the mailer contents (flatlay photo)
   - Artist spotlight video/bio
   - "What's Inside" unboxing section
   - Subscription tiers + sign-up form
   - Testimonials (add as they come in)

2. **Site-wide CTA** — add banner/card on homepage, resources page, and footer:
   > "Get monthly art from disability artists delivered to your mailbox. [Subscribe →](/mailer/)"

3. **Newsletter footer** — existing email subscribers get a "Upgrade to physical mailer" CTA

4. **Blog/article tie-in** — feature the monthly artist in a blog post with behind-the-scenes content

### Off-Site Growth

| Channel | Tactic |
|---------|--------|
| Instagram | Monthly "unboxing" Reel showing the mailer, tag the artist |
| Facebook Groups | Share in caregiver/disability parent groups (with admin permission) |
| Podcast mentions | Feature on Once Upon a Gene, Parenting Impossible — offer promo code |
| Disability events | Table at Abilities Expo with sample mailers as giveaway |
| Referral program | "Give a friend 1 free month, get 1 free month" |
| Launch special | First 50 subscribers get a bonus signed art print |

### Retention

- **Variety:** Rotate art styles monthly (watercolor, digital, photography, textile)
- **Community:** Subscriber-only Discord/Facebook group
- **Agency:** Quarterly survey: "Vote for next month's theme"
- **Surprise:** Random months include an extra item (mini zine, seed packet, tea bag)

---

## Assembly Process

### Monthly Timeline

| Week | Activity |
|------|----------|
| Week 1 | Commission artist: agree on theme, deadline, and fee |
| Week 2 | Receive digital artwork; send to printer; artist writes letter |
| Week 3 | Receive printed materials; assemble + stuff envelopes |
| Week 4 | Mail all envelopes (USPS bulk or hand-mail if <100) |

### Assembly Workflow (for 50-200 subscribers)

1. **Print:** Use a local print shop or online service (Moo, Vistaprint, PrintingForLess) for postcards/cards. Letter printed in-house on branded letterhead.
2. **Stuff:** Assembly party approach — set up stations:
   - Station 1: Insert art piece (card/postcard)
   - Station 2: Insert artist letter (folded)
   - Station 3: Insert bonus item (sticker, bookmark)
   - Station 4: Seal, stamp, address label
3. **Address labels:** Export subscriber list → mail merge → print labels (Avery 5160 or similar)
4. **Mail:** Drop at USPS. Under 100 pieces: just stamp and go. Over 200: consider USPS Marketing Mail (bulk rate ~$0.45 vs. $0.73 Forever stamp) — requires a permit.

### Scaling (200+ subscribers)

- **Fulfillment service:** Consider print-and-mail services like [Lob](https://www.lob.com/) or [Stannp](https://www.stannp.com/) that handle printing, stuffing, and mailing via API. Upload artwork + subscriber list → they do the rest.
- **Subscription management:** Use [Stripe](https://stripe.com/) or [Shopify Subscriptions](https://www.shopify.com/) for recurring billing — integrates with address management.
- **Inventory:** Keep 1 month buffer of printed materials; order 2 weeks before assembly.

---

## Bonus Item Ideas

| Item | Cost | Notes |
|------|------|-------|
| Vinyl sticker (2-3") | $0.10-0.20 | Custom art from the month's artist |
| Bookmark | $0.15-0.25 | Double-sided with art + quote |
| Recipe card | $0.10 | Seasonal recipes, easy to print |
| Affirmation card | $0.10 | "You're doing an incredible job" — caregiver encouragement |
| Tea bag (single serve) | $0.15-0.25 | "Take a moment for yourself" theme |
| Seed packet | $0.20-0.30 | Seasonal — spring/summer months |
| Mini coloring page | $0.05 | From the artist's original work |
| QR code to exclusive content | $0.00 | Behind-the-scenes video, artist interview |

**Rule:** Keep total weight under 1 oz (single stamp territory). Flat items only — no bulges that require non-machinable surcharge ($0.46 extra).

---

## Email & Subscription Platform

The same platform should handle both the free weekly newsletter and the paid monthly mailer subscription — one audience, segmented by tier.

### Platform Comparison

| Platform | Free Tier | Best For | Paid Pricing | Integration |
|----------|-----------|----------|-------------|-------------|
| **Buttondown** | 100 subscribers | Simple resource digests. Markdown-native — paste the weekly digest directly. Minimal UI, fast setup. No bloat. | $9/mo (1K subs) | Embed form or API. Supports RSS-to-email (could auto-send from blog RSS). |
| **MailerLite** | 1,000 subscribers | Best free tier with automation. Visual email builder, landing pages, A/B testing. Good balance of power and simplicity. | $10/mo (500+ subs) | Embed form, JavaScript widget, or API. Has automation workflows for welcome sequences. |
| **Brevo (Sendinblue)** | Unlimited contacts, 300 emails/day | Highest free sending volume. Transactional + marketing emails in one platform. Good if you also want to send scrape digest emails programmatically. | $9/mo (5K emails/mo) | API-first. Can send from GitHub Actions directly via API. Also has an embed form builder. |
| **Kit (ConvertKit)** | 10,000 subscribers | Best for growing audience + paid subscriptions (monthly mailer). Built-in paid newsletter and digital product support. Strong for creators. | $25/mo (1K subs) | Embed form or landing page. Supports tags for segmentation (weekly vs. monthly). Has commerce built in for the physical mailer subscription. |
| **Beehiiv** | 2,500 subscribers | Modern newsletter platform with built-in monetization, referral programs, and analytics. Good if the newsletter becomes a standalone product. | $39/mo (1K+ subs) | Embed form or custom domain. Has a referral/growth program built in. |
| **Substack** | Unlimited (free newsletters) | Zero-cost option if newsletters become article-driven. Handles both free and paid subscriptions. Readers subscribe on Substack, not your site. | 10% of paid subs | Separate Substack page (not embedded on your site). Less control over branding. |
| **Mailchimp** | 500 contacts | Most widely known. Good template editor, audience segmentation. Free tier is small but serviceable for launch. | $13/mo (500+ contacts) | Embed form, popup, or API. Extensive template library. |
| **SendGrid (Twilio)** | 100 emails/day | Developer-friendly API. Best if you want to send programmatically from GitHub Actions with full HTML control. No visual editor — you build templates in code. | $15/mo (50K emails/mo) | Pure API. Add key as GitHub Secret, send from `scrape_digest.py` or a dedicated workflow step. |
| **Resend** | 3,000 emails/mo | Modern developer-first email API. Beautiful default templates. React Email support. Easiest API integration for a static site + GitHub Actions pipeline. | $20/mo (50K emails/mo) | API only. Simple integration — `curl` or Python `requests` from CI. |

### Recommended approach by growth stage

**Now (0-100 subscribers):** **Buttondown** or **MailerLite**
- Buttondown if you want dead-simple markdown digests with zero learning curve
- MailerLite if you want a visual editor and welcome automation on a generous free tier

**Growth (100-1,000 subscribers):** **Kit (ConvertKit)**
- When you're ready to add the monthly mailer as a paid product, Kit handles both free newsletters and paid subscriptions in one platform
- Tag-based segmentation separates weekly update subscribers from monthly mailer subscribers

**Scale (1,000+ subscribers):** **Beehiiv** or **Brevo**
- Beehiiv if the newsletter becomes a standalone growth channel (referral programs, monetization)
- Brevo if you need high-volume transactional emails alongside marketing (scrape digests + newsletter + welcome emails all in one)

### Payment processing for physical mailer

For the paid monthly mailer tier specifically, you also need payment processing:

**Recommended: Stripe + simple website form**
1. Create Stripe product with monthly recurring price
2. Embed Stripe checkout on `/mailer/` page
3. Stripe handles: recurring billing, card updates, cancellations, receipts
4. Export subscriber addresses monthly for assembly
5. Cost: 2.9% + $0.30 per transaction (~$0.59 on a $9.99 charge)

**Alternative: Shopify**
- Better for gift subscriptions and one-time purchases
- Higher monthly cost ($39/mo + transaction fees)
- Better admin UI for managing subscribers/shipments
- Worth it at 200+ subscribers

**Alternative: Kit Commerce (ConvertKit)**
- If using Kit for the newsletter, its built-in commerce handles paid subscriptions
- Single platform for free newsletter + paid mailer — one subscriber list, one dashboard
- 3.5% + $0.30 per transaction

### Implementation steps (same regardless of platform)

1. Create account on chosen platform
2. Replace Formspree newsletter form in `src/_includes/components/footer.njk` with the platform's embed form
3. Import existing subscriber emails from Formspree dashboard
4. Create a branded email template matching site colors (teal `#2B6B4F`, amber `#E8913A`)
5. Set up the weekly email:
   - **Manual:** Copy `scrapers/logs/weekly_digest.txt` content into the platform's editor, polish, send
   - **Automated:** Use the platform's API from GitHub Actions to send programmatically after scrape
6. Once working, add subscription preference options (weekly updates vs. monthly mailer) back to the footer form

---

## Launch Roadmap

| Phase | Timeline | Goal |
|-------|----------|------|
| **Pilot** | Month 1-2 | Commission first artist, create sample mailer, photograph it, build `/mailer/` landing page |
| **Soft launch** | Month 3 | Open to existing newsletter subscribers (target: 25 sign-ups) |
| **Public launch** | Month 4 | Instagram unboxing video, blog feature, site-wide CTA (target: 50) |
| **Growth** | Month 5-8 | Referral program, podcast mentions, event presence (target: 100-200) |
| **Scale** | Month 9+ | Evaluate fulfillment service, add Supporter tier, explore corporate gifting |

---

## Artist Partnership Model

- **Fee:** $200-500 per commission (flat, not per-subscriber)
- **Rights:** Artist retains copyright; The Fullest Project gets print + digital distribution license for the subscription
- **Exposure:** Artist bio + photo on site, social media feature, link to their shop/portfolio
- **Selection:** Prioritize artists with disabilities; rotate monthly; build roster of 12+ artists for annual variety
- **Pipeline:** Reach out to Art Enables (DC), ArtXV, disability artist Instagram accounts, VSA (Very Special Arts), Disability Arts Online

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Low initial sign-ups | Pilot with existing community; don't commit to large print runs until 25+ confirmed |
| Artist no-shows | Maintain 2-month artist backlog; have a backup piece ready |
| Postal delays | Mail 5 business days before month-end; track first 10 shipments each month |
| Churn | Survey cancelers; send "we miss you" reactivation offer at 30/60/90 days |
| Scope creep | Keep it simple: one stamp, one envelope, 2-3 items. Resist adding complexity. |

---

## Process Automation

### Auto-Add Resources via Email

**Current state:** Resources are submitted via the [Submit a Resource](/submit-resource/) Formspree form or added manually to JSON files. Distribution emails from other organizations contain valuable resources and events but must be manually reviewed and entered.

**Solution:** Set up a dedicated email address on thefullestproject.org. Forward or send any newsletter, resource list, or event announcement to that address. A Cloudflare Email Worker receives the email, uses Claude AI to extract resources and events, and commits them to a pending review queue on the site.

#### Step 1: Nicole creates a new email address in GoDaddy

Create a new email address on thefullestproject.org in GoDaddy Admin. This can be whatever name feels right. Some suggestions:

| Option | Vibe |
|--------|------|
| `resources@thefullestproject.org` | Clear and professional |
| `add@thefullestproject.org` | Short and action-oriented |
| `submit@thefullestproject.org` | Matches the existing submit-resource page |
| `inbox@thefullestproject.org` | Generic catch-all feel |
| `discover@thefullestproject.org` | On-brand — aligns with resource discovery mission |

Pick whichever feels right — it can be anything. This address is for internal use (forwarding distribution emails for processing), not public-facing.

#### Step 2: Set up Cloudflare Email Routing

Once the email address is created:

1. In Cloudflare dashboard → thefullestproject.org → **Email Routing** → Enable
2. Add a **custom address rule**: route the new address (e.g., `resources@`) to a Cloudflare Email Worker
3. This only affects the one address — all other email (`info@`, `hello@`, etc.) stays on GoDaddy untouched
4. Cloudflare will ask you to add an MX record for email routing. This is safe to add alongside GoDaddy's MX records since Cloudflare Email Routing uses destination-based routing rules

**Note:** If adding the Cloudflare MX record would conflict with GoDaddy email, an alternative is to create the address on a subdomain (e.g., `ingest@mail.thefullestproject.org`) where Cloudflare has full MX control without affecting the main domain's email.

#### Step 3: Build the Email Worker (dev team)

A new Cloudflare Email Worker (`resource-ingest`) that:

1. Receives the raw email from Cloudflare Email Routing
2. Extracts the text/HTML body
3. Calls Claude API (Haiku) with a prompt: "Extract any disability resources, organizations, or events from this email. Return structured JSON with name, website, description, and category."
4. Commits extracted resources to `src/_data/pending_resources.json` on GitHub
5. Sends a summary notification to `info@thefullestproject.org`: "3 resources extracted from [email subject] — review at /admin/"

#### Step 4: Review and approve

- Extracted resources land in `pending_resources.json` — not live on the site yet
- Team reviews in Decap CMS or on GitHub
- Approved resources are moved to the appropriate JSON file (`national.json`, `nova.json`, etc.)
- Rejected resources are deleted from pending

#### How to use it (once set up)

1. Receive a newsletter or resource email from another organization
2. Forward it to `resources@thefullestproject.org` (or whatever address was chosen)
3. Within minutes, get a notification at `info@` with what was extracted
4. Review and approve in the CMS

No manual data entry. No copy-paste. Just forward and review.

### Scrape Digest Email (Implemented)

**File:** `scrapers/sources/scrape_digest.py`
**Workflow step:** Added to `.github/workflows/scrape.yml`

After each weekly scrape, the digest script:
1. Reads the scrape log from the current run
2. Counts new blog posts created today
3. Generates a text summary
4. Sends it to info@thefullestproject.org via Formspree
5. Saves a copy to `scrapers/logs/weekly_digest.txt`

### AI-Generated Weekly Resource Email

**Concept:** Use Claude API to take the raw weekly digest and transform it into a polished, engaging email draft that can be reviewed and sent.

1. After `scrape_digest.py` generates the raw digest text
2. New script `generate_weekly_email.py`:
   - Reads `scrapers/logs/weekly_digest.txt`
   - Calls Claude API (Haiku for cost-efficiency) with a prompt: "Write a warm, concise weekly email for caregivers summarizing these new resources."
   - Saves the generated email HTML to `scrapers/logs/weekly_email_draft.html`
3. Email draft is committed to the repo for manual review
4. Team reviews, edits if needed, then sends via chosen email platform

**Cost estimate:** Claude Haiku ~$0.001 per email generation — essentially free at weekly frequency.

**Recommended next step:** Build `generate_weekly_email.py` after email platform is set up, so the generated content has somewhere to go.
