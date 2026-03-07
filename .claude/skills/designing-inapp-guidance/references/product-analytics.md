# Product Analytics Reference

## Contents
- Current Analytics State
- Lightweight Event Tracking
- Filter Usage Tracking
- Form Conversion Tracking
- WARNING: Anti-Patterns
- Metrics That Matter
- Implementation Checklist

---

## Current Analytics State

The codebase has **zero analytics**. No Google Analytics, no Plausible, no tracking scripts. The only data source is Formspree submission counts (contact, newsletter, resource submission). This is a significant gap for understanding which guidance elements work.

### WARNING: Missing Professional Analytics

**Detected:** No analytics library in `package.json` or `base.njk`
**Impact:** No visibility into which resources get clicked, which filters are used, whether guidance elements are noticed, or where users drop off.

### Recommended Solution

For a static site with privacy-conscious caregivers, use a lightweight, privacy-respecting analytics tool:

```html
{# src/_includes/layouts/base.njk — add before </head> #}
<script defer data-domain="thefullestproject.org"
  src="https://plausible.io/js/script.js"></script>
```

Plausible is GDPR-compliant, cookie-free, and under 1KB. No consent banner needed. Alternative: Umami (self-hostable) or Fathom.

NEVER use Google Analytics 4 on a healthcare-adjacent caregiver site without explicit HIPAA review. GA4 collects far more data than needed and requires a cookie consent banner.

---

## Lightweight Event Tracking

Track specific user interactions without heavy instrumentation. These patterns work with Plausible's custom events or any `navigator.sendBeacon`-based approach.

### Filter Usage Events

```javascript
// src/js/resourceFilter.js — add after filterResources function call
if (searchInput) {
  let searchTimeout;
  searchInput.addEventListener('input', function() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(function() {
      if (searchInput.value.trim().length > 2) {
        trackEvent('Resource Search', { query: searchInput.value.trim() });
      }
    }, 1000);
  });
}

if (locationFilter) {
  locationFilter.addEventListener('change', function() {
    if (locationFilter.value) {
      trackEvent('Filter Location', { location: locationFilter.value });
    }
  });
}

if (categoryFilter) {
  categoryFilter.addEventListener('change', function() {
    if (categoryFilter.value) {
      trackEvent('Filter Category', { category: categoryFilter.value });
    }
  });
}
```

### Generic Track Function

```javascript
// src/js/main.js — append
function trackEvent(name, props) {
  // Plausible custom events
  if (window.plausible) {
    window.plausible(name, { props: props });
    return;
  }
  // Fallback: beacon to your own endpoint
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/event', JSON.stringify({ event: name, props: props }));
  }
}
window.trackEvent = trackEvent;
```

### DO: Track Meaningful Actions

```javascript
// Resource card outbound click
document.querySelectorAll('.resource-card a[target="_blank"]').forEach(function(link) {
  link.addEventListener('click', function() {
    var card = link.closest('.resource-card');
    trackEvent('Resource Click', {
      name: card.getAttribute('data-name'),
      location: card.getAttribute('data-location')
    });
  });
});
```

### DON'T: Track Page Scrolling or Mouse Movement

```javascript
// BAD — surveillance-level tracking on a caregiver resource site
window.addEventListener('scroll', () => {
  trackEvent('Scroll Depth', { depth: getScrollPercent() });
});
document.addEventListener('mousemove', throttle((e) => {
  trackEvent('Mouse Position', { x: e.clientX, y: e.clientY });
}, 1000));
```

**Why this breaks:** This is a trust-based site for vulnerable populations. Tracking scroll depth and mouse movement feels invasive and provides minimal actionable data. Track actions (clicks, searches, form submissions), not passive behavior.

---

## Form Conversion Tracking

Formspree handles submissions externally, so you can't instrument the POST directly. Track the form submission event client-side.

### DO: Track Form Submit Events

```javascript
// src/js/main.js — append
document.querySelectorAll('form[action*="formspree"]').forEach(function(form) {
  form.addEventListener('submit', function() {
    var formName = form.closest('section')
      ? form.closest('[id]')?.id || 'unknown'
      : 'unknown';
    trackEvent('Form Submit', { form: formName });
  });
});
```

### DON'T: Track Individual Keystroke Events in Forms

```javascript
// BAD — logging every character typed in forms
form.querySelectorAll('input').forEach(input => {
  input.addEventListener('keyup', () => {
    trackEvent('Field Input', { field: input.name, value: input.value });
  });
});
```

**Why this breaks:** Logging user input in real time is a privacy violation. Form fields on this site include emails, phone numbers, and descriptions of disability-related needs. NEVER capture field values in analytics.

---

## Metrics That Matter

For measuring guidance effectiveness:

| Metric | What It Tells You | How to Measure |
|--------|-------------------|----------------|
| Filter usage rate | Are visitors finding the filter controls? | `Filter Location` + `Filter Category` events / page views |
| Search-to-result ratio | Do searches produce useful results? | `Resource Search` events with `visibleCount > 0` |
| Zero-result rate | Are filters too narrow or data gaps exist? | `visibleCount === 0` after filter |
| Resource click-through | Are card descriptions sufficient to drive clicks? | `Resource Click` events / card impressions |
| Submit resource conversion | Is the CTA at bottom of `/resources/` working? | Form submit events on `/submit-resource/` |
| Newsletter conversion by source | Which placement converts best? | Hidden `_source` field in Formspree submission |
| Cross-link usage | Do therapy guide links to resources work? | Track clicks on `?category=` links |

### DO: Measure Guidance Element Effectiveness

```javascript
// Track when a tooltip is focused (guidance was sought)
document.querySelectorAll('.tooltip-trigger').forEach(function(trigger) {
  trigger.addEventListener('focus', function() {
    var term = trigger.textContent.trim();
    trackEvent('Tooltip Viewed', { term: term });
  });
});
```

---

## WARNING: Anti-Patterns

### WARNING: Adding a Full Analytics Suite for a Static Site

**The Problem:**

```html
<!-- BAD — heavyweight analytics for an SSG -->
<script src="https://cdn.segment.com/analytics.js"></script>
<script src="https://www.googletagmanager.com/gtag/js"></script>
<script src="https://cdn.mxpnl.com/libs/mixpanel.js"></script>
```

**Why This Breaks:**
1. Three analytics scripts add 200KB+ to every page load
2. Require cookie consent banners (legal overhead for a small nonprofit)
3. Collect far more data than a static site needs
4. Performance impact on mobile devices used by caregivers

**The Fix:**
One lightweight analytics script (Plausible: <1KB, Umami: ~2KB). Custom events via `navigator.sendBeacon` for specific interactions. That's it.

### WARNING: Persisting User Behavior Without Consent

Never store user interaction history in localStorage (pages visited, searches made, resources clicked) without a clear privacy notice. This site serves vulnerable populations — trust is the product.

---

## Implementation Checklist

Copy this checklist and track progress:

- [ ] Choose analytics tool (Plausible recommended, Umami if self-hosting)
- [ ] Add analytics script to `src/_includes/layouts/base.njk`
- [ ] Add `trackEvent` helper to `src/js/main.js`
- [ ] Add filter tracking to `src/js/resourceFilter.js`
- [ ] Add resource click tracking to resource cards
- [ ] Add form submit tracking for all Formspree forms
- [ ] Add hidden `_source` fields to distinguish newsletter form locations
- [ ] Add tooltip focus tracking
- [ ] Verify no PII (names, emails, descriptions) is sent to analytics
- [ ] Test tracking with browser devtools Network tab
- [ ] Run `npm run build` to confirm no errors

1. Add analytics script and `trackEvent` helper
2. Validate: open devtools Network tab, interact with filters, confirm events fire
3. If events don't appear, check script load order and repeat step 2
4. Only add more event tracking after base tracking is verified

See the **instrumenting-product-metrics** skill for the full metrics strategy. See the **javascript** skill for the project's vanilla JS conventions.
