# Product Analytics Scoping

## Contents
- Current Measurement State
- Scoping Analytics Implementation
- Event Taxonomy for This Project
- Build-Time Metrics
- Anti-Patterns

## Current Measurement State

**The project has NO analytics or tracking code.** No Google Analytics, no Mixpanel, no Plausible, no custom events. This is the highest-priority missing professional solution for scoping decisions.

Without analytics, feature scoping is based on assumptions rather than data. Every feature scope should consider: "How will we know this worked?"

### WARNING: Missing Professional Analytics

**Detected:** No analytics library in package.json or any template.

**Impact:** Cannot measure which resources users find, which filters they use, which guides they read, or where they drop off. Feature prioritization is guesswork.

**Recommended Solution (privacy-respecting):**

```html
{# Add to src/_includes/layouts/base.njk <head> #}
{# Option A: Plausible (privacy-first, no cookies, GDPR-compliant) #}
<script defer data-domain="thefullestproject.org"
  src="https://plausible.io/js/script.js"></script>

{# Option B: Self-hosted Umami (free, privacy-first) #}
<script defer src="https://analytics.yourdomain.com/script.js"
  data-website-id="YOUR_ID"></script>
```

**Why this matters for scoping:** Analytics data should inform which features to build next. Without it, you're scoping in the dark.

## Scoping Analytics Implementation

Analytics should be scoped as a standalone infrastructure feature, not bundled with content features.

```
Feature: "Add privacy-respecting analytics"

Slice 1 (MVP): Page view tracking
  Files: src/_includes/layouts/base.njk
  AC: Analytics script loads on every page via base layout
  AC: No cookies set (privacy-respecting)
  AC: Dashboard shows page views, top pages, referrers
  AC: No impact on page load performance (defer/async)

Slice 2: Custom event tracking
  Files: src/js/resourceFilter.js, src/js/main.js
  AC: Track resource filter usage (which categories, locations)
  AC: Track search queries
  AC: Track outbound clicks on resource websites

Slice 3: Goal tracking
  Files: Form templates (contact, submit-resource, newsletter)
  AC: Track form submissions as conversion goals
  AC: Track newsletter signup rate
  AC: Track resource submission rate
```

### Scoping Custom Events for Resource Filters

```javascript
// Slice 2 scope — add to src/js/resourceFilter.js
// Track which filters users actually use

// DO: Fire event when filter changes produce results
locationFilter.addEventListener('change', () => {
  filterResources();
  if (typeof plausible !== 'undefined') {
    plausible('Filter', {
      props: { type: 'location', value: locationFilter.value }
    });
  }
});

// DON'T: Track every keystroke in search
// Only track completed searches (debounce or on blur)
```

**Acceptance criteria for event tracking:**

```
- [ ] Events fire only when analytics library is loaded (guard check)
- [ ] No PII in event properties (no email, no names)
- [ ] Event names follow consistent taxonomy (see below)
- [ ] Events don't block UI interactions (fire-and-forget)
```

## Event Taxonomy for This Project

If analytics is implemented, scope event tracking with a consistent naming convention. This prevents event soup.

| Event Name | Properties | Trigger |
|------------|-----------|---------|
| `Filter` | `type`, `value` | Location or category dropdown change |
| `Search` | `query` (truncated) | Search input blur or submit |
| `Resource Click` | `name`, `category` | Click on resource website link |
| `Form Submit` | `form` (contact/resource/newsletter) | Form submission |
| `Guide View` | `guide` (therapy/iep/equipment) | Guide page load |
| `CTA Click` | `label`, `destination` | Any btn-primary/btn-secondary click |

### DO: Scope event tracking per surface

```
Slice 2a: Resource filter events (resourceFilter.js)
Slice 2b: Form submission events (each form template)
Slice 2c: Outbound link events (resource cards)
```

Each sub-slice can be validated independently.

### DON'T: Track everything in one slice

Trying to instrument the entire site at once creates a massive, untestable slice. Scope by surface area.

## Build-Time Metrics

Even without client-side analytics, Eleventy provides build-time data useful for scoping decisions.

**Data available at build time:**

```nunjucks
{# Resource counts — already used on homepage #}
{{ allResources | length }} total resources
{{ allResources | filterByLocation("National") | length }} national
{{ allResources | filterByCategory("therapy") | length }} therapy

{# Content counts #}
{{ collections.blogPosts | length }} blog posts
{{ collections.podcastEpisodes | length }} podcast episodes
```

**Using build-time metrics for scope decisions:**

```
Before scoping a "therapy providers by state" feature:
1. Count therapy resources: allResources | filterByCategory("therapy") | length
2. If < 20 resources nationally, scope data collection FIRST
3. If > 50 resources, the feature has enough data to be useful

Before scoping a "most popular categories" feature:
1. Count resources per category at build time
2. Only show categories with 5+ resources
3. Scope data population for thin categories
```

**Scoping build-time analytics page (internal tool):**

```
Feature: "Add data health dashboard (dev-only)"

Slice 1 (MVP): Build-time stats page
  Files: src/pages/admin/data-health.njk
  AC: Shows resource count per location
  AC: Shows resource count per category
  AC: Shows resources missing key fields (website, description)
  AC: Page excluded from sitemap and nav
  AC: Permalink: /admin/data-health/

Slice 2: Data quality alerts
  AC: Flags resources with empty descriptions
  AC: Flags resources with no website URL
  AC: Shows "last scraped" freshness per source
```

## Anti-Patterns

### WARNING: Scoping Features Based on Assumed Usage

**The Problem:** Scoping a complex "most viewed resources" feature without any data on what users actually view.

**Why This Breaks:** Without analytics, "most viewed" is a guess. You build sorting/ranking infrastructure for data you don't have. The feature ships and shows arbitrary results.

**The Fix:** Scope analytics implementation (Slice 1) before features that depend on usage data (Slice 2+). Use build-time data (resource count, completeness) for scope decisions until client-side analytics exist.

### WARNING: Adding Tracking Code Inline Instead of Via Base Layout

**The Problem:** Adding analytics scripts to individual page templates instead of `base.njk`.

**Why This Breaks:** New pages won't have tracking. You create coverage gaps that are invisible until someone checks. The base layout is the single point of truth for site-wide concerns.

**The Fix:** All analytics code goes in `src/_includes/layouts/base.njk`. Per-page events go in the page's associated JS file, not inline scripts. See the **eleventy** skill for layout chain patterns.

### WARNING: Scoping PII Collection in Events

**The Problem:** Tracking user email addresses, search queries with names, or form content in analytics events.

**Why This Breaks:** Violates user privacy expectations. The project's audience is caregivers of disabled individuals — a particularly sensitive population. Privacy violations destroy trust permanently.

**The Fix:** Event properties contain categories and counts, never personal data. Search queries should be truncated or hashed. Form events track "submitted" boolean, not content.
