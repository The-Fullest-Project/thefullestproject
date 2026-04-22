# Process Improvements — Implementation Guide

## 1. Auto-Add Resources via Email

**Current state:** Resources are submitted via the [Submit a Resource](/submit-resource/) Formspree form or added manually to JSON files.

**Proposed improvement:** Allow resources to be submitted by emailing info@thefullestproject.org with a structured format, then auto-ingested.

### Implementation options

**Option A: Formspree → Cloudflare Worker (Recommended)**
- Formspree already forwards submissions to email
- Add a Cloudflare Worker that receives a webhook from Formspree
- Worker parses the submission and creates a GitHub commit (same pattern as gig-publisher)
- Resources go into a `pending_resources.json` file for manual review before merging into the live site

**Option B: Email parsing via Zapier/Make**
- Set up a Zapier workflow: email to info@ → parse fields → append to Google Sheet → manual approval → GitHub commit
- Lower technical lift but adds a paid dependency

### Recommended next step
Extend the existing gig-publisher Worker pattern to handle resource submissions. The form already exists at `/submit-resource/` — just need the auto-commit pipeline behind it.

---

## 2. Scrape Digest Email (IMPLEMENTED)

**File:** `scrapers/sources/scrape_digest.py`
**Workflow step:** Added to `.github/workflows/scrape.yml`

After each weekly scrape, the digest script:
1. Reads the scrape log from the current run
2. Counts new blog posts created today
3. Generates a text summary
4. Sends it to info@thefullestproject.org via Formspree
5. Saves a copy to `scrapers/logs/weekly_digest.txt`

---

## 3. Newsletter: Weekly Resource Updates

**Current state:** Newsletter signup exists (Formspree form in footer, form ID `meeroozw`). When a user subscribes, their email is stored in Formspree's submission log — visible in the Formspree dashboard. However, **no automated emails are sent to subscribers**. Formspree only collects emails; it does not have newsletter/drip campaign functionality. Subscribers currently receive nothing after signing up.

**Action needed before adding subscription tiers:** Set up an email delivery service (Mailchimp, ConvertKit, or SendGrid) before adding weekly/monthly subscription options to the form. Adding preference checkboxes without a delivery backend creates a broken promise to users.

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
- Tag-based segmentation makes it easy to separate weekly update subscribers from monthly mailer subscribers

**Scale (1,000+ subscribers):** **Beehiiv** or **Brevo**
- Beehiiv if the newsletter becomes a standalone growth channel (referral programs, monetization)
- Brevo if you need high-volume transactional emails alongside marketing (scrape digests + newsletter + welcome emails all in one)

### Implementation steps (same regardless of platform)

1. Create account on chosen platform
2. Replace Formspree newsletter form in `src/_includes/components/footer.njk` with the platform's embed form
3. Import existing subscriber emails from Formspree dashboard
4. Create a branded email template matching site colors (teal `#2B6B4F`, amber `#E8913A`)
5. Set up the weekly email:
   - **Manual:** Copy `scrapers/logs/weekly_digest.txt` content into the platform's editor, polish, send
   - **Automated:** Use the platform's API from GitHub Actions to send programmatically after scrape
6. Once working, add subscription preference options (weekly updates vs. monthly mailer) back to the form

---

## 4. AI-Generated Weekly Resource Email

**Concept:** Use Claude API to take the raw weekly digest and transform it into a polished, engaging email draft that can be reviewed and sent.

### Implementation
1. After `scrape_digest.py` generates the raw digest text
2. New script `generate_weekly_email.py`:
   - Reads `scrapers/logs/weekly_digest.txt`
   - Calls Claude API (Haiku for cost-efficiency) with a prompt:
     "Write a warm, concise weekly email for caregivers summarizing these new resources. Include a personal touch and encourage readers to explore the new additions."
   - Saves the generated email HTML to `scrapers/logs/weekly_email_draft.html`
3. Email draft is committed to the repo for manual review
4. Team reviews, edits if needed, then sends via Mailchimp/SendGrid

### Cost estimate
- Claude Haiku: ~$0.001 per email generation (500 input tokens + 500 output tokens)
- Essentially free at weekly frequency

### Recommended next step
Build `generate_weekly_email.py` after Mailchimp is set up, so the generated content has somewhere to go.
