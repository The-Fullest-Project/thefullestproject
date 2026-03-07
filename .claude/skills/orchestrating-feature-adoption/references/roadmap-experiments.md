# Roadmap & Experiments Reference

## Contents
- Feature Rollout Strategy for Static Sites
- Location-Based Rollouts
- Content-Gated Launches
- A/B Testing Without JavaScript Frameworks
- WARNING: Feature Flags in Static Sites
- Experiment Validation Patterns
- Rollout Checklist

## Feature Rollout Strategy for Static Sites

This is a static site deployed via FTP to GoDaddy. There is no server-side rendering, no edge functions, no feature flag service. Every "experiment" is either:

1. **A new page** added to the nav (or not)
2. **A conditional Nunjucks block** that renders based on data
3. **A URL param** that changes client-side behavior
4. **A hidden form field** that segments users

The simplest experiment is deploying a new page without adding it to the nav, sharing the URL with a test audience, and measuring Formspree submissions.

## Location-Based Rollouts

The site serves two pilot locations (Northern Virginia, Portland) plus national resources. New features can be rolled out per-location using Nunjucks conditionals.

### Rolling Out a Feature for One Location First

```html
{# src/pages/resources.njk — show a new section only for Virginia #}
{% set vaResources = resources.virginia | filterByCategory("respite-care") %}
{% if vaResources | length > 0 %}
<section class="mt-12">
  <h2 class="text-2xl font-bold mb-4">Respite Care in Virginia</h2>
  <p class="text-gray-600 mb-6">
    New! We've added respite care providers for Northern Virginia.
  </p>
  {% for resource in vaResources %}
    {# render resource cards #}
  {% endfor %}
</section>
{% endif %}
```

This pattern renders nothing if no Virginia respite resources exist. The "experiment" is adding data to the JSON file — the UI appears automatically. See the **eleventy** skill for data pipeline details.

### Data-Driven Feature Gating

```json
// src/_data/site.json — feature toggles via site data
{
  "features": {
    "respiteCare": true,
    "gigPlatform": false,
    "shopPage": false
  }
}
```

```html
{# Conditional rendering based on site.features #}
{% if site.features.gigPlatform %}
<a href="/services/gig-platform/" class="btn-primary">Join the Gig Platform</a>
{% else %}
<div class="border-2 border-dashed border-gray-300 p-6 rounded-lg text-center">
  <span class="tag bg-amber-100 text-amber-800">Coming Soon</span>
  <h3 class="text-lg font-bold mt-2">Caregiver Gig Platform</h3>
  <form action="https://formspree.io/f/{{ site.formspree.newsletter }}" method="POST">
    <input type="hidden" name="interest" value="gig-platform">
    <input type="email" name="email" required placeholder="Get notified" class="form-input mt-4">
    <button type="submit" class="btn-secondary mt-2">Notify Me</button>
  </form>
</div>
{% endif %}
```

**DO:** Use `site.json` for feature toggles. This keeps all flags in one place and they're available in every template.

**DON'T:** Scatter boolean flags across multiple data files. A single `features` object in `site.json` is the canonical source.

## Content-Gated Launches

For new content types (blog, podcast), the templates already handle empty states gracefully. The "launch" is simply adding the first piece of content.

```html
{# src/pages/blog.njk — already handles zero-content state #}
{% if collections.blogPosts | length > 0 %}
  {# Full blog listing UI #}
{% else %}
  {# "Coming soon" with newsletter CTA #}
{% endif %}
```

### Soft Launch Pattern

1. Add content files (e.g., `src/blog/first-post.md`)
2. Don't add a nav link yet
3. Share the direct URL (`/blog/first-post/`) with test readers
4. Measure engagement via Formspree contact form submissions mentioning the post
5. When validated, add "Blog" to the nav

### WARNING: Feature Flags in Static Sites

**The Problem:**

```javascript
// BAD — runtime feature flags in vanilla JS
if (localStorage.getItem('feature_newFilter') === 'true') {
  document.getElementById('advanced-filters').style.display = 'block';
}
```

**Why This Breaks:**
1. No way to set the flag for new visitors — it only works for people who manually set localStorage
2. Flash of content as the flag is read and applied after page load
3. No centralized management — flags are scattered across JS files
4. Cannot be measured without separate analytics infrastructure
5. Build-time Nunjucks conditionals are more reliable for a static site

**The Fix:** Use build-time feature gating via `site.json`:

```json
// GOOD — site.json features object
{ "features": { "advancedFilters": false } }
```

```html
{# GOOD — Nunjucks conditional, no flash of content #}
{% if site.features.advancedFilters %}
<div id="advanced-filters">...</div>
{% endif %}
```

## A/B Testing Without JavaScript Frameworks

True A/B testing requires traffic splitting, which needs server-side logic or an edge function. On a static FTP-hosted site, the closest alternatives are:

### Option 1: Sequential Testing

Deploy version A for two weeks, measure. Deploy version B for two weeks, measure. Compare.

```
Week 1-2: Homepage CTA says "Find Resources" → measure click-through
Week 3-4: Homepage CTA says "Search 150+ Resources" → measure click-through
```

Measurement: Formspree submission volume + analytics page views (if analytics is added).

### Option 2: URL-Based Variants

Create two versions of a page at different URLs:

```
/resources/         → current layout
/resources/beta/    → experimental layout
```

Share different URLs with different audiences. Compare Formspree submissions and time-on-page (requires analytics).

### Option 3: Location-Based Variants

Show different CTAs to different pilot locations:

```html
{# Different CTA copy per location on the resource page #}
{% if locationParam == "Virginia" %}
  <h2>Northern Virginia Resources for Your Family</h2>
{% elif locationParam == "Oregon" %}
  <h2>Portland-Area Resources for Your Family</h2>
{% else %}
  <h2>Resources Across the Nation</h2>
{% endif %}
```

## Experiment Validation Patterns

### Validate Before Investing

1. Add a "Coming Soon" card with an email capture form
2. Measure signups over 2 weeks
3. If signups exceed threshold, build the feature
4. If not, deprioritize

This pattern is already used for the gig platform on the services page.

### Validate After Launch

1. Deploy the feature with a `source` hidden field on relevant forms
2. Monitor Formspree submissions for 2 weeks
3. Check if the new page generates contact/newsletter signups
4. If engagement is flat, iterate on CTAs and positioning

### Validation Loop

1. Deploy feature or variant
2. Wait 2 weeks for signal
3. Check Formspree dashboard for submissions with relevant `source` value
4. If analytics is configured, check page views and event counts
5. Decide: expand, iterate, or deprecate
6. If iterating, change one variable and repeat from step 1

## Rollout Checklist

Copy this when launching a new feature:

- [ ] Feature toggle added to `site.json` under `features` (if applicable)
- [ ] Template uses `{% if site.features.X %}` conditional
- [ ] "Coming Soon" card has email capture with `interest` hidden field
- [ ] Soft launch URL works without nav link
- [ ] Formspree forms include `source` hidden field for the new page
- [ ] Empty state gracefully handles zero content
- [ ] Nav link added only after validation period
- [ ] Build passes: `npm run build` completes without errors
- [ ] Deployed and verified on production

See the **scoping-feature-work** skill for breaking features into MVP slices and the **instrumenting-product-metrics** skill for measuring experiment outcomes.
