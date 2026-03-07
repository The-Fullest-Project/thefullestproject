# Product Analytics Reference

## Contents
- Current Analytics State
- Key Events to Instrument
- Journey Completion Metrics
- Filter Usage Tracking
- Anti-Patterns

## Current Analytics State

**This project has no analytics instrumentation.** There is no Google Analytics, Plausible, Fathom, or any event tracking. The `base.njk` layout loads Google Fonts and the site CSS, but no analytics scripts.

```njk
{# src/_includes/layouts/base.njk - Head section has no analytics #}
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ title }} | {{ site.name }}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/.../Nunito:wght@400;600;700;800&..." rel="stylesheet">
  <link rel="stylesheet" href="/css/output.css">
  {# No analytics script anywhere #}
</head>
```

### WARNING: No Analytics Instrumentation

**Impact:** You cannot measure any user journey. No pageviews, no filter usage, no form submissions, no outbound resource clicks. Without data, every UX decision is guesswork.

**Recommended Solution:** Add a privacy-respecting, cookie-free analytics tool to `base.njk`:

```njk
{# GOOD - Plausible (no cookies, GDPR-compliant, outbound link tracking built in) #}
<script defer data-domain="thefullestproject.org"
  src="https://plausible.io/js/script.outbound-links.js"></script>
```

Cookie-free analytics avoids consent banners — critical for a trust-focused caregiver audience.

## Key Events to Instrument

Based on the actual user journeys in this codebase, these are the events worth tracking:

| Event | Surface | Why It Matters |
|-------|---------|----------------|
| Resource filter applied | `resourceFilter.js` | Shows which categories/locations users care about |
| Resource link clicked | Resource card "Visit Website" | Measures resource directory value |
| Form submitted | Contact, submit-resource, newsletter | Tracks contribution and engagement |
| Guide page CTA clicked | Therapy, IEP, equipment page bottom CTAs | Measures education-to-action conversion |
| Empty state viewed | Blog/podcast "coming soon" | Tracks how often users hit dead ends |

### Resource Filter Tracking

The filter function in `resourceFilter.js` is the natural place to add filter-usage events:

```javascript
// src/js/resourceFilter.js - Add tracking after filter logic
function filterResources() {
  // ...existing filter logic...

  if (resultsCount) {
    resultsCount.textContent = visibleCount + ' resource' + (visibleCount !== 1 ? 's' : '') + ' found';
  }

  // Track filter usage (if analytics loaded)
  if (typeof plausible !== 'undefined') {
    if (selectedCategory) plausible('Filter', { props: { type: 'category', value: selectedCategory } });
    if (selectedLocation) plausible('Filter', { props: { type: 'location', value: selectedLocation } });
    if (searchTerm) plausible('Filter', { props: { type: 'search' } });
  }
}
```

**DO:** Gate analytics calls behind a check for the analytics object. The site must work without it.
**DON'T:** Fire events on every keystroke in the search box. Debounce or track on blur/submit only.

### Outbound Resource Click Tracking

Resource cards link to external websites. Track these to measure directory value:

```njk
{# src/pages/resources.njk:98-100 - External link #}
<a href="{{ resource.website }}" target="_blank" rel="noopener noreferrer"
   class="text-sm font-semibold no-underline inline-block mt-2"
   style="color: var(--color-secondary);">
  Visit Website &rarr;
</a>
```

Plausible's `outbound-links` extension tracks these automatically. No code changes needed if using:
```html
<script defer data-domain="thefullestproject.org"
  src="https://plausible.io/js/script.outbound-links.js"></script>
```

## Journey Completion Metrics

Define these as measurable funnels:

### Resource Discovery Funnel
```
1. Homepage pageview
2. /resources/ pageview
3. Filter applied (category or location)
4. Resource card external link clicked
```

### Contribution Funnel
```
1. /resources/ pageview OR /submit-resource/ pageview
2. Submit resource form started (focus on first field)
3. Submit resource form completed (Formspree submission)
```

### Education-to-Action Funnel
```
1. Guide page viewed (/therapy-guide/, /school-iep/, /adaptive-equipment/)
2. Bottom CTA clicked (to /resources/?category=X)
3. Filter auto-applied from URL param
4. Resource external link clicked
```

## Data Already Available

Even without client-side analytics, the scraper pipeline provides data points:

```javascript
// .eleventy.js:12-27 - allResources count is already surfaced
eleventyConfig.addGlobalData("allResources", () => {
  // ...loads all JSON files...
  return all;
});
```

```njk
{# src/pages/index.njk:135 - Resource count displayed to users #}
{{ allResources | length }}+
```

This gives you: total resource count, resources per state, resources per category. See the **eleventy** skill for how to create additional computed data.

## Analytics Implementation Checklist

Copy this checklist and track progress:
- [ ] Choose analytics provider (Plausible or Fathom recommended)
- [ ] Add script tag to `src/_includes/layouts/base.njk` head section
- [ ] Enable outbound link tracking for resource card clicks
- [ ] Add custom events for filter usage in `resourceFilter.js`
- [ ] Add form submission tracking (Formspree webhooks or redirect URLs)
- [ ] Define dashboard with the three funnels above
