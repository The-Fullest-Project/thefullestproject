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

### Implementation options

**Option A: Mailchimp/ConvertKit integration (Recommended)**
1. Create a Mailchimp account (free up to 500 contacts)
2. Replace Formspree newsletter form with Mailchimp embed form
3. Set up an automated weekly email campaign:
   - Trigger: every Sunday after scrape
   - Content: list of new resources added that week (from `weekly_digest.txt`)
   - Template: branded email with resource cards + links
4. Segment subscribers: "weekly updates" vs. "monthly mailer" based on form checkboxes

**Option B: GitHub Action → SendGrid**
1. Add SendGrid API key as GitHub Secret
2. After the scrape, generate an HTML email from the digest
3. Send via SendGrid API to all subscribers
4. Subscriber list managed in a JSON file in the repo (or a Google Sheet)

### Recommended next step
Start with Mailchimp — free tier covers early growth, has audience segmentation, and provides an email editor for non-technical editing of the weekly update.

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
