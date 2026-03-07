# Product Analytics Reference

## Contents
- Current Analytics State
- WARNING: No Analytics Infrastructure
- Lightweight Analytics Options
- Event Taxonomy for This Site
- Formspree as a Proxy Metric
- Client-Side Event Tracking Patterns
- Build-Time Analytics Hooks

## Current Analytics State

**The site has zero analytics infrastructure.** No Google Analytics, no Mixpanel, no Plausible, no Fathom. The only measurable signals are Formspree submission counts and server access logs (if GoDaddy provides them).

This means feature adoption is currently unmeasurable. You cannot answer:
- How many visitors use the resource filter?
- Which guide pages drive the most resource views?
- What percentage of visitors reach the submit-resource page?
- Which newsletter touchpoint converts best?

## WARNING: No Analytics Infrastructure

**Detected:** No analytics library in `package.json`, no tracking scripts in `src/_includes/layouts/base.njk`, no event calls in any JavaScript file.

**Impact:** Feature adoption decisions are made blind. You cannot validate whether CTAs work, which pages bounce visitors, or whether the filter UX is usable.

### Recommended Solution: Privacy-First Analytics

For a caregiver-focused site, privacy matters. Avoid Google Analytics. Use a lightweight, GDPR-compliant alternative:

**Option 1: Plausible Analytics (recommended)**
- No cookies, no personal data, GDPR-compliant by default
- One script tag, ~1KB
- Open-source self-hosted option available

```html
{# Add to src/_includes/layouts/base.njk in <head> #}
<script defer data-domain="thefullestproject.org"
        src="https://plausible.io/js/script.js"></script>
```

**Option 2: Fathom Analytics**
- Similar privacy stance, slightly more features
- Cookie-free, GDPR-compliant

```html
<script src="https://cdn.usefathom.com/script.js"
        data-site="YOUR_SITE_ID" defer></script>
```

**Option 3: No external service — use Formspree data + server logs**
- Zero additional cost
- Limited to form submissions and page views from hosting logs
- Sufficient for early-stage validation

### Quick Start (Plausible)

```html
{# src/_includes/layouts/base.njk — add before </head> #}
{% if site.analytics and site.analytics.plausible %}
<script defer data-domain="{{ site.analytics.plausible }}"
        src="https://plausible.io/js/script.js"></script>
{% endif %}
```

```json
// src/_data/site.json — add analytics config
{
  "analytics": {
    "plausible": "thefullestproject.org"
  }
}
```

## Event Taxonomy for This Site

If adding analytics with custom events, use this taxonomy:

| Event Name | Trigger | Properties |
|------------|---------|------------|
| `filter_used` | Resource filter dropdown or search changed | `filter_type`, `value` |
| `resource_click` | Visitor clicks a resource website/phone link | `resource_name`, `category` |
| `cta_click` | Any primary/secondary CTA button clicked | `cta_text`, `page`, `destination` |
| `form_submit` | Any Formspree form submitted | `form_type` (contact, newsletter, submit-resource) |
| `guide_section_view` | Scroll to a guide section anchor | `section_id`, `guide` |

### Implementing Custom Events (Plausible)

```javascript
// src/js/resourceFilter.js — track filter usage
function trackFilter(filterType, value) {
  if (window.plausible) {
    window.plausible('filter_used', {
      props: { filter_type: filterType, value: value }
    });
  }
}

// Call when filter changes
locationFilter.addEventListener('change', function() {
  trackFilter('location', this.value);
  filterResources();
});
```

```javascript
// src/js/main.js — track CTA clicks
document.querySelectorAll('.btn-primary, .btn-secondary').forEach(function(btn) {
  btn.addEventListener('click', function() {
    if (window.plausible) {
      window.plausible('cta_click', {
        props: {
          cta_text: this.textContent.trim(),
          page: window.location.pathname,
          destination: this.getAttribute('href')
        }
      });
    }
  });
});
```

**DO:** Gate all tracking behind `if (window.plausible)` or equivalent — the site must work identically with or without analytics loaded.

**DON'T:** Add tracking that breaks when ad blockers are active. The site's functionality must never depend on analytics scripts loading.

## Formspree as a Proxy Metric

Until proper analytics are added, Formspree submissions are the primary engagement signal.

### Segmenting by Hidden Fields

```html
{# Add to every Formspree form #}
<input type="hidden" name="source" value="{{ page.url }}">
<input type="hidden" name="timestamp" value="">
<script>
  document.querySelector('input[name="timestamp"]').value = new Date().toISOString();
</script>
```

This gives you:
- **Source page** — which page drove the form submission
- **Timestamp** — when the submission happened (for basic trend analysis)

### Form Types and What They Measure

| Form | Formspree ID Key | Measures |
|------|-----------------|----------|
| Contact | `site.formspree.contact` | General engagement, partnership interest |
| Submit Resource | `site.formspree.submitResource` | Community investment, content contribution |
| Newsletter | `site.formspree.newsletter` | Ongoing interest, return-visit intent |

### Extracting Insights from Formspree Dashboard

1. Log into Formspree dashboard
2. Filter submissions by the `source` hidden field
3. Compare submission volume across pages
4. Look for patterns in `interest` field values (e.g., "gig-platform" from services page)

## Build-Time Analytics Hooks

Eleventy can generate analytics-adjacent data at build time without any client-side tracking.

### Resource Count Tracking

```javascript
// .eleventy.js — expose resource counts as build data
eleventyConfig.addGlobalData("resourceStats", function() {
  const nova = require("./src/_data/resources/nova.json");
  const national = require("./src/_data/resources/national.json");
  return {
    total: nova.length + national.length,
    byCategory: countByField([...nova, ...national], "category"),
    byLocation: countByField([...nova, ...national], "location"),
    lastUpdated: new Date().toISOString()
  };
});
```

This lets templates display dynamic stats like "Browse our 150+ resources across 29 categories" — a form of social proof that drives adoption without runtime tracking.

**DO:** Use build-time stats for social proof on the homepage and resource page headers.

**DON'T:** Fabricate or hard-code stats. Always derive them from the actual data files.

## Analytics Implementation Checklist

Copy this checklist when adding analytics:

- [ ] Choose a privacy-first analytics provider (Plausible or Fathom)
- [ ] Add script tag to `base.njk` gated behind `site.analytics` config
- [ ] Add analytics domain to `site.json`
- [ ] Add `source` hidden field to all Formspree forms
- [ ] Add custom events for filter usage in `resourceFilter.js`
- [ ] Add CTA click tracking in `main.js`
- [ ] Verify site works identically with analytics blocked
- [ ] Test: `npm run build` completes without errors
- [ ] Review Plausible/Fathom dashboard after 48 hours of live traffic

See the **instrumenting-product-metrics** skill for comprehensive analytics implementation and the **mapping-conversion-events** skill for event funnel design.
