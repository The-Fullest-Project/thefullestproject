# Measurement & Testing Reference

## Contents
- WARNING: Zero Analytics Implementation
- GA4 Setup for Static Sites
- Event Instrumentation Plan
- Formspree as Analytics Proxy
- Testing Conversion Flows
- A/B Testing on Static Sites

## WARNING: Zero Analytics Implementation

**Detected:** No Google Analytics, GTM, pixel tags, or any tracking code in `base.njk` or anywhere in the codebase.

**Impact:**
- Cannot measure traffic, bounce rates, or user paths
- Cannot attribute conversions to sources
- Cannot identify which pages or CTAs drive form submissions
- Flying blind on every optimization decision

**The Fix — GA4 minimal setup:**

```html
{# src/_includes/layouts/base.njk — first thing inside <head>, after <meta charset> #}
{% if site.ga4Id %}
<script async src="https://www.googletagmanager.com/gtag/js?id={{ site.ga4Id }}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '{{ site.ga4Id }}');
</script>
{% endif %}
```

```json
// src/_data/site.json — add GA4 property ID
{
  "ga4Id": "G-XXXXXXXXXX"
}
```

**Why `site.json` instead of hardcoded:** Keeps the ID configurable, matches the existing Formspree ID pattern, and allows disabling by removing the value.

## GA4 Setup for Static Sites

### Step 1: Base Tag (above)

### Step 2: Form Submission Events

```javascript
// src/js/main.js — add after existing mobile menu code
document.querySelectorAll('form[action*="formspree"]').forEach(form => {
  form.addEventListener('submit', function() {
    const formType = this.dataset.formType || 'unknown';
    if (typeof gtag === 'function') {
      gtag('event', 'form_submit', {
        event_category: 'conversion',
        event_label: formType
      });
    }
  });
});
```

### Step 3: CTA Click Events

```javascript
// src/js/main.js
document.querySelectorAll('[data-cta]').forEach(el => {
  el.addEventListener('click', function() {
    if (typeof gtag === 'function') {
      gtag('event', 'cta_click', {
        event_category: 'engagement',
        event_label: this.dataset.cta,
        transport_type: 'beacon'
      });
    }
  });
});
```

Add `data-cta` attributes to key buttons:
```html
<a href="/resources/" class="btn-secondary" data-cta="hero-find-resources">Find Resources</a>
<a href="/submit-resource/" class="btn-primary" data-cta="resource-submit-prompt">Submit a Resource</a>
```

### Step 4: Resource Filter Events

```javascript
// src/js/resourceFilter.js — inside the filter handler
if (typeof gtag === 'function') {
  gtag('event', 'filter_applied', {
    event_category: 'engagement',
    event_label: `location:${locationValue}|category:${categoryValue}`,
    value: visibleCount
  });
}
```

## Event Instrumentation Plan

Priority-ordered implementation:

| Priority | Event | Trigger | GA4 Event Name |
|----------|-------|---------|----------------|
| P0 | Newsletter signup | Form submit | `newsletter_signup` |
| P0 | Contact form sent | Form submit | `contact_submit` |
| P0 | Resource submitted | Form submit | `resource_submit` |
| P1 | Hero CTA click | Button click | `cta_click` |
| P1 | Resource filter used | Filter change | `filter_applied` |
| P1 | Resource search used | Search input | `search_used` |
| P2 | Outbound resource click | Link click | `outbound_click` |
| P2 | Blog post read | Scroll 75% | `content_consumed` |
| P2 | Gig platform notify | Form submit | `gig_notify` |

## Formspree as Analytics Proxy

Without GA4, Formspree submissions are your only conversion data. Use the Formspree dashboard to track:

- **Submission count** per form (contact, resource, newsletter)
- **Submission timing** (spikes after blog posts or social shares)
- **Subject field distribution** on contact form (which topics drive inquiries)

### DO: Use Formspree's `_subject` field for email routing

```html
<input type="hidden" name="_subject" value="New Newsletter Signup from {{ page.url }}">
```

This tags each submission email with the source page — poor-man's attribution.

### DON'T: Rely on Formspree as your only analytics

**Why:** Formspree only captures submissions. It tells you nothing about the 95%+ visitors who don't convert. You need pageview analytics to understand the full funnel.

## Testing Conversion Flows

### Manual Testing Checklist

Copy this checklist when testing forms:

- [ ] Replace Formspree placeholder IDs in `site.json` with real IDs
- [ ] Submit each form with valid data — check Formspree dashboard
- [ ] Submit each form with invalid data — verify HTML5 validation fires
- [ ] Test `_next` redirect returns to `/thank-you/` page
- [ ] Verify GA4 events fire in DebugView for each form
- [ ] Test on mobile — all forms should be usable on 320px viewport
- [ ] Verify `sr-only` labels render for screen readers
- [ ] Test contact form with `?subject=partnership` URL param pre-fill

### Iterate-Until-Pass Validation

1. Add `data-form-type` to a form
2. Submit the form
3. Check GA4 DebugView for `form_submit` event with correct label
4. If event missing or mislabeled, fix and repeat step 2
5. Only proceed to next form when event fires correctly

## A/B Testing on Static Sites

This site has no server — A/B testing requires client-side approaches:

### URL Parameter Variants

```javascript
// Simple A/B via URL param: /resources/?variant=b
const variant = new URLSearchParams(window.location.search).get('variant');
if (variant === 'b') {
  document.querySelector('.hero h1').textContent = 'Find Resources for Your Family';
}
```

### Google Optimize Alternative (Free)

Since Google Optimize is sunset, use lightweight alternatives:
- **Formspree A/B:** Send traffic to two different Formspree forms and compare submission rates
- **UTM-tagged links:** Create variant landing page URLs and compare in GA4

### DON'T: Over-invest in A/B testing without baseline analytics

```
{# BAD — testing without data #}
"Let's A/B test the hero headline"
→ You don't even know current conversion rate
→ No baseline = no valid comparison
```

**Fix:** Implement GA4 first, collect 30 days of baseline data, then test.

See the **instrumenting-product-metrics** skill for deeper metric collection patterns.
