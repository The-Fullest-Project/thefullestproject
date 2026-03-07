# Product Analytics Reference

## Contents
- Current State: No Analytics
- WARNING: Missing Analytics Infrastructure
- Lightweight Event Tracking Options
- Key Events to Track
- Privacy-First Approach
- Implementation Patterns

## Current State: No Analytics

The project has **zero analytics**. No Google Analytics, no Plausible, no custom event tracking. `main.js` contains only the mobile menu toggle. `resourceFilter.js` filters cards but reports nothing.

This means there is no way to know:
- How many visitors the site gets
- Which pages are most visited
- Whether visitors use the resource filters
- Which resources are clicked
- Whether newsletter signups convert
- If the therapy guide or IEP pages are useful

## WARNING: Missing Analytics Infrastructure

**Detected:** No analytics library in `package.json` dependencies. No tracking scripts in `base.njk`. No event calls anywhere in the JavaScript.

**Impact:** Onboarding paths cannot be measured or improved. You cannot verify that changes to CTAs, empty states, or filter guidance actually affect behavior.

### Recommended Solution

Install a privacy-first analytics tool. Avoid Google Analytics — it requires a GDPR cookie banner and sends data to Google's servers. For a caregiver-focused site, privacy matters.

**Option 1: Plausible Analytics (Recommended)**

```html
<!-- Add to src/_includes/layouts/base.njk, before </head> -->
<script defer data-domain="thefullestproject.org" src="https://plausible.io/js/script.js"></script>
```

- No cookies, no GDPR banner needed
- Lightweight (< 1KB script)
- Tracks pageviews automatically
- Custom events via `plausible()` function
- $9/month hosted, or self-host free

**Option 2: Custom lightweight tracking**

If no budget for hosted analytics, track key events via Formspree or a simple endpoint:

```javascript
// src/js/analytics.js — minimal event beacon
function trackEvent(name, props) {
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/event', JSON.stringify({ event: name, ...props }));
  }
}
```

Note: This requires a server endpoint, which GoDaddy shared hosting doesn't provide. Use Plausible or a similar hosted service instead.

## Key Events to Track

These are the events that map to onboarding success. See the **instrumenting-product-metrics** skill for full implementation patterns.

### Activation Funnel

| Event | Trigger | Where to Add |
|-------|---------|-------------|
| `pageview` | Any page load | Automatic (Plausible) |
| `filter_used` | Any filter change | `src/js/resourceFilter.js` |
| `resource_clicked` | Click "Visit Website" | `src/pages/resources.njk` |
| `newsletter_signup` | Form submit | Homepage, footer, services |
| `resource_submitted` | Submit-resource form | `src/pages/submit-resource.njk` |

### Onboarding-Specific Events

| Event | Trigger | Purpose |
|-------|---------|---------|
| `welcome_banner_shown` | First visit detected | Measure first-visit rate |
| `welcome_banner_dismissed` | Click "Got it" | Measure engagement with banner |
| `empty_state_shown` | 0 filter results | Identify filter confusion |
| `filter_reset` | Click "reset filters" | Measure recovery from empty state |
| `deep_link_arrival` | URL has params on load | Measure shared/linked traffic |

## Privacy-First Approach

### DO: Use cookieless analytics

```html
<!-- Plausible — no cookies, no consent banner needed -->
<script defer data-domain="thefullestproject.org" src="https://plausible.io/js/script.js"></script>
```

### DON'T: Add Google Analytics without a cookie banner

Google Analytics sets cookies, requires GDPR consent UI, and sends user data to Google. For a site serving a vulnerable population (caregivers of people with disabilities), this is a trust issue.

### DO: Respect Do Not Track

```javascript
// Check before sending custom events
function shouldTrack() {
  return navigator.doNotTrack !== '1' && window.doNotTrack !== '1';
}
```

### DON'T: Track personally identifiable information

Never include email addresses, names, or IP addresses in custom events. Track actions, not people.

## Implementation Patterns

### Track filter usage (Plausible custom events)

```javascript
// Add to src/js/resourceFilter.js — after filter application
const locationFilter = document.getElementById('location-filter');
const categoryFilter = document.getElementById('category-filter');

locationFilter?.addEventListener('change', () => {
  if (typeof plausible !== 'undefined') {
    plausible('Filter Used', { props: { type: 'location', value: locationFilter.value } });
  }
});

categoryFilter?.addEventListener('change', () => {
  if (typeof plausible !== 'undefined') {
    plausible('Filter Used', { props: { type: 'category', value: categoryFilter.value } });
  }
});
```

### Track outbound resource clicks

```javascript
// Add to src/js/resourceFilter.js or a new analytics.js
document.querySelectorAll('a[href^="http"]').forEach(link => {
  if (link.closest('#resource-grid')) {
    link.addEventListener('click', () => {
      if (typeof plausible !== 'undefined') {
        plausible('Resource Clicked', { props: { url: link.href } });
      }
    });
  }
});
```

### Track newsletter signups

```html
<!-- Add to newsletter forms — Plausible tracks form submissions by default -->
<!-- For explicit tracking, add a class Plausible can target -->
<form action="https://formspree.io/f/{{ site.formspree.newsletter }}"
      method="POST"
      class="plausible-event-name=Newsletter+Signup">
  <input type="email" name="email" required placeholder="Your email" class="form-input">
  <button type="submit" class="btn-primary">Subscribe</button>
</form>
```

### Validate tracking works

1. Install Plausible script in `base.njk`
2. Visit the site locally (Plausible ignores localhost by default — use `data-api` override for testing)
3. Check Plausible dashboard for pageview
4. Add custom events to filter JS
5. Verify events appear in Plausible dashboard
6. If events don't appear, check browser console for script loading errors
7. Only proceed to adding more events when basic pageviews are confirmed
