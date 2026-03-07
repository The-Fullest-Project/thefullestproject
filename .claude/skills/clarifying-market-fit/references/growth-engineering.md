# Growth Engineering Reference

## Contents
- Growth Loops in This Project
- Community Contribution Loop
- Newsletter Growth Loop
- Content Flywheel
- Scraper-Driven Growth
- Anti-Patterns

## Growth Loops in This Project

This is a **non-profit static site** — growth means more caregivers finding and using resources, not revenue. The growth model is content-and-community, not paid acquisition.

| Loop | Mechanism | Status |
|------|-----------|--------|
| Community contribution | Caregivers submit resources → directory grows → more caregivers find it | Active |
| Newsletter flywheel | Subscribe → receive updates → return to site → share with other caregivers | Active (needs content) |
| Content SEO | Blog/podcast → long-tail search traffic → resource directory discovery | Early |
| Scraper freshness | Weekly scrape → fresh data → better search ranking → more traffic | Active |
| Word of mouth | Founders' networks → direct referrals → submissions → more data | Active |

## Community Contribution Loop

This is the most important growth mechanism. Every resource submission makes the directory more valuable, which attracts more visitors, who submit more resources.

```njk
{# src/pages/resources.njk — the submission CTA that closes the loop #}
<div class="mt-12 text-center card p-8">
  <h2 class="text-2xl font-bold mb-4" style="color: var(--color-primary);">
    Know a Resource We're Missing?
  </h2>
  <p class="mb-6" style="color: var(--color-text-light);">
    Help us grow our directory by submitting resources you know about.
  </p>
  <a href="/submit-resource/" class="btn-primary no-underline">Submit a Resource</a>
</div>
```

### Strengthening the Loop

The submission form sends data to Formspree, but **submitted resources don't automatically appear in the directory**. A human must manually add them to `src/_data/resources/*.json` and redeploy.

```json
// Resource data schema — manual entries look the same as scraped ones
{
  "name": "Resource Name",
  "category": ["category-slug"],
  "location": "Northern Virginia",
  "description": "What the resource does",
  "website": "https://...",
  "source": "community-submission",
  "lastScraped": "2026-03-06"
}
```

**Growth bottleneck:** The manual review step. To scale, consider:
1. Batch review Formspree submissions weekly alongside the scraper run
2. Use `source: "community-submission"` to distinguish user-submitted resources
3. Publish a "thank you" acknowledgment to encourage repeat submissions

## Newsletter Growth Loop

```njk
{# Three newsletter touchpoints — each reinforces the others #}

{# 1. Homepage — high-intent visitors #}
<section style="background-color: var(--color-primary);">
  <h2>Stay Connected</h2>
  <p>Get updates on new resources, blog posts, podcast episodes,
     and community news delivered to your inbox.</p>
</section>

{# 2. Footer — every page #}
<h3>Stay Connected</h3>
<p>Get updates on new resources, blog posts, and community news.</p>

{# 3. Gig platform waitlist — interest-segmented #}
<input type="hidden" name="interest" value="gig-platform">
<input type="email" name="email" placeholder="Get notified at launch">
```

### DO / DON'T

| DO | DON'T | Why |
|----|-------|-----|
| Vary the value prop per placement (homepage = comprehensive, footer = brief) | Copy-paste identical text everywhere | Visitors who see the same copy twice tune it out |
| Use the hidden `interest` field for segmentation | Treat all subscribers identically | Gig-platform-interested subscribers have different needs |
| Send regular updates when new resources are added | Collect emails and never send | Silent newsletters kill trust and invite unsubscribes |

## Content Flywheel

Blog and podcast content drives long-tail SEO traffic and gives the newsletter something to send.

```
New blog post → ranks for long-tail query
  → caregiver discovers site → browses resources → subscribes to newsletter
    → receives next update → returns → submits a resource
      → directory grows → more long-tail pages rank
```

### Blog Post SEO Integration

```njk
{# Link blog content to filtered resource views #}
<p>Looking for occupational therapy providers?
  <a href="/resources/?category=therapy">Browse therapy providers in your area</a>.
</p>
```

Every blog post should deep-link to at least one filtered resource directory view. This bridges content traffic into directory engagement.

## Scraper-Driven Growth

The weekly scraper pipeline is a growth engine — it keeps data fresh without manual effort.

```yaml
# .github/workflows/scrape.yml — runs every Sunday
on:
  schedule:
    - cron: '0 0 * * 0'
```

Fresh data means:
1. Search engines see regular content updates → better crawl frequency
2. Resource descriptions stay accurate → visitors trust the directory
3. New resources appear automatically → the directory grows without manual additions

See the **python** skill for scraper patterns and the **github-actions** skill for CI/CD configuration.

## Anti-Patterns

### WARNING: Treating the Resource Directory as Static Content

**The Problem:** Adding resources only through manual editing or scraping, never closing the community submission loop.

**Why This Breaks:** The submission form creates an expectation. If submitted resources never appear, contributors stop contributing and tell others the form is broken.

**The Fix:** Process Formspree submissions on a regular cadence (weekly, alongside the scraper run). Even if you reject a submission, the act of reviewing closes the loop. See the **triaging-user-feedback** skill for a processing workflow.

### WARNING: Building Features Before the Core Loop Works

**The Problem:** Adding the gig platform, shop, or social media integration before the resource directory and newsletter are generating consistent traffic and submissions.

**Why This Breaks:**
1. Every new feature splits engineering time from the core value proposition
2. Empty marketplaces and shops erode trust ("is this site abandoned?")
3. The services page already handles "Coming Soon" with a waitlist — that's sufficient

**The Fix:** Focus on:
1. Growing the resource directory (more scrapers, process submissions)
2. Publishing content (blog posts that link to resources)
3. Building the newsletter subscriber base

Only launch Phase 2/3 features when Phase 1 has measurable traction.

### WARNING: No Feedback Loop From Directory Usage to Content

If caregivers search for "respite care" but the directory has few respite resources, that's a signal to:
1. Write a blog post about respite care options
2. Add a scraper targeting respite care providers
3. Create a dedicated respite page similar to the therapy guide

Without analytics, this signal is invisible. At minimum, add source attribution to forms (see the **measurement-testing** reference) so you can see which categories visitors engage with.
