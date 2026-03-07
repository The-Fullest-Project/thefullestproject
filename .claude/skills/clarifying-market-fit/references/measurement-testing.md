# Measurement & Testing Reference

## Contents
- Current Measurement State
- What Can Be Measured Today
- Formspree as a Proxy Metric Source
- Manual Testing Workflows
- Missing Professional Solutions
- Anti-Patterns

## Current Measurement State

This project has **no analytics SDK installed**. No Google Analytics, no Plausible, no PostHog, no Mixpanel. There are no client-side tracking scripts, no server-side event logging, and no A/B testing framework.

This is a deliberate consequence of the static-site architecture and privacy-conscious design. Measurement relies on **proxy signals** from Formspree submissions and manual observation.

## What Can Be Measured Today

| Signal | Source | How to Check |
|--------|--------|-------------|
| Newsletter signups | Formspree dashboard | Log into Formspree, filter by newsletter form ID |
| Contact form submissions | Formspree dashboard | Filter by contact form ID, inspect `subject` field |
| Resource submissions | Formspree dashboard | Filter by submit-resource form ID |
| Gig platform interest | Formspree dashboard | Filter newsletter submissions where `interest=gig-platform` |
| Resource directory size | `src/_data/resources/*.json` | Count entries with Eleventy's `allResources \| length` |
| Content volume | `src/blog/`, `src/podcast/` | Count files in each directory |
| Site build success | GitHub Actions | Check `.github/workflows/deploy.yml` runs |
| Scraper health | GitHub Actions | Check `.github/workflows/scrape.yml` weekly runs |

## Formspree as a Proxy Metric Source

Formspree is the only external service that captures user actions. Segment it:

```njk
{# Hidden fields enable Formspree-side segmentation #}

{# Newsletter signup — generic #}
<form action="https://formspree.io/f/{{ site.formspree.newsletter }}" method="POST">
  <input type="email" name="email" required>
  <button type="submit">Subscribe</button>
</form>

{# Gig platform waitlist — segmented by interest #}
<form action="https://formspree.io/f/{{ site.formspree.newsletter }}" method="POST">
  <input type="hidden" name="interest" value="gig-platform">
  <input type="email" name="email" required>
  <button type="submit">Notify Me</button>
</form>
```

```njk
{# Contact form — segmented by subject #}
<select name="subject">
  <option value="general">General Inquiry</option>
  <option value="resource">Resource Suggestion</option>
  <option value="partnership">Partnership Opportunity</option>
  <option value="story">Share My Story</option>
  <option value="feedback">Website Feedback</option>
</select>
```

**Key insight:** The `subject` dropdown on the contact form and the `interest` hidden field on the gig waitlist are your only behavioral segmentation tools. Use them intentionally. See the **instrumenting-product-metrics** skill for adding lightweight tracking.

## Manual Testing Workflows

Without automated analytics, test positioning changes manually:

### Testing a Hero Headline Change

```
1. Read current headline in src/pages/index.njk
2. Edit the headline with the Edit tool
3. Run `npm run build` to verify it compiles
4. Review the built page in _site/index.html
5. Deploy and monitor Formspree submission volume for 1-2 weeks
6. If submissions drop, revert; if stable or up, keep
```

### Testing a New CTA

```
1. Identify the CTA to test in the .njk file
2. Change the button text and/or href
3. Run `npm run build` to verify
4. Monitor which Formspree form receives the click-through
5. Compare submission volume before vs. after
```

### A/B Testing Without JavaScript

For a static site, the closest proxy to A/B testing is **sequential testing** — change the copy, observe for a fixed period, compare to the previous period. This is noisy but better than guessing.

Copy this checklist for any messaging change:

- [ ] Record current Formspree submission counts (baseline)
- [ ] Make the copy change in the `.njk` file
- [ ] Build and deploy
- [ ] Wait a fixed period (7-14 days minimum)
- [ ] Record new Formspree submission counts
- [ ] If count drops >20%, consider reverting
- [ ] Document the result in a blog post or internal note

## Missing Professional Solutions

### WARNING: No Analytics SDK Installed

**Detected:** No analytics library in `package.json`. No tracking scripts in `base.njk`.

**Impact:** Cannot measure page views, bounce rates, scroll depth, click-through rates, or any standard web metric. All optimization is blind.

**Recommended Solution:**

For a privacy-conscious static site, add Plausible Analytics (lightweight, cookie-free, GDPR-compliant):

```html
<!-- Add to src/_includes/layouts/base.njk before </head> -->
<script defer data-domain="thefullestproject.org"
  src="https://plausible.io/js/script.js"></script>
```

Or for a free, self-hosted option, use Umami.

**Why This Matters:** Without page-level traffic data, you cannot know which pages attract visitors, where they drop off, or whether positioning changes have any effect beyond Formspree submission counts.

### WARNING: No Conversion Event Tracking

**Detected:** Forms submit directly to Formspree with no client-side event hooks.

**Impact:** Cannot correlate which page or CTA led to a form submission. A newsletter signup from the homepage and one from the footer look identical in Formspree.

**Quick Win:** Add a hidden `source` field to each form instance:

```njk
{# Add to homepage newsletter form #}
<input type="hidden" name="_source" value="homepage-newsletter">

{# Add to footer newsletter form #}
<input type="hidden" name="_source" value="footer-newsletter">
```

This costs nothing and gives you submission source attribution in Formspree data. See the **mapping-conversion-events** skill for a complete instrumentation plan.

## Anti-Patterns

### WARNING: Optimizing Copy Without Any Measurement Baseline

**The Problem:** Rewriting hero headlines and CTA text with no way to know if the change helped or hurt.

**Why This Breaks:** Without before/after data, every change is a guess. You may degrade conversion and never notice.

**The Fix:** At minimum, add hidden `_source` fields to every form (zero-cost) and check Formspree weekly before making copy changes. Ideally, add a lightweight analytics script.

### WARNING: Over-Investing in Tracking Before Content Exists

With one blog post and no podcast episodes, adding a full analytics suite is premature. Focus measurement effort on the resource directory (which has real traffic value) and newsletter signup rate.
