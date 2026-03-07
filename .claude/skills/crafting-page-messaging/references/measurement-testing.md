# Measurement & Testing Reference

## Contents
- Current Measurement State
- WARNING: No Analytics Instrumentation
- Key Events to Track
- Lightweight Analytics Options
- A/B Testing on a Static Site
- Formspree as a Proxy Metric
- Measurement Implementation Checklist

## Current Measurement State

This project has **zero analytics instrumentation**. No Google Analytics, no Plausible, no Fathom, no event tracking. The only measurable actions are Formspree form submissions, which Formspree tracks in its dashboard.

| What's Measurable | How | Where |
|-------------------|-----|-------|
| Form submissions | Formspree dashboard | Contact, submit-resource, newsletter, gig-platform waitlist |
| Page existence | Sitemap + server logs (if GoDaddy exposes them) | All pages |
| Resource count | `allResources.length` in templates | Homepage stats section |

| What's NOT Measurable | Impact |
|----------------------|--------|
| Page views | Can't tell which pages get traffic |
| CTA click-through rates | Can't tell which CTAs work |
| Resource filter usage | Can't tell what people search for |
| Bounce rate | Can't tell if messaging resonates |
| Time on page | Can't tell if educational content is read |

## WARNING: No Analytics Instrumentation

**The Problem:** No analytics script exists in `base.njk`. There is no way to measure whether page messaging changes affect visitor behavior.

**Why This Breaks:**
1. Messaging improvements are unmeasurable — you're flying blind
2. Can't identify which pages need copy rework (no traffic data)
3. Can't validate that CTA changes improve click-through
4. Can't prove the site's value to partners or funders

**The Fix:** Add a privacy-respecting analytics tool. For a non-profit caregiver site, avoid cookie-heavy solutions:

```njk
{# Option 1: Plausible (privacy-first, no cookies, GDPR-compliant) #}
{# Add to src/_includes/layouts/base.njk before </head> #}
<script defer data-domain="thefullestproject.org"
  src="https://plausible.io/js/script.js"></script>
```

```njk
{# Option 2: Fathom (similar privacy model) #}
<script src="https://cdn.usefathom.com/script.js"
  data-site="YOUR_SITE_ID" defer></script>
```

Both are paid services (~$9/month). For a free option, self-host Umami or use Cloudflare Web Analytics (if DNS is through Cloudflare).

## Key Events to Track

Once analytics are in place, instrument these events. They map directly to messaging effectiveness:

| Event | What It Measures | Where |
|-------|-----------------|-------|
| `cta_click:hero` | Hero messaging resonance | `src/pages/index.njk` line 18 |
| `cta_click:newsletter` | Newsletter value prop strength | Homepage + footer forms |
| `cta_click:submit_resource` | Community contribution motivation | Resource directory bottom CTA |
| `filter_used:category` | Which categories visitors care about | `src/js/resourceFilter.js` |
| `filter_used:location` | Which locations visitors care about | `src/js/resourceFilter.js` |
| `cta_click:section_funnel` | Educational page → resource directory conversion | Therapy guide, IEP, equipment bottom CTAs |
| `form_submit:contact` | Contact form completion | `src/pages/contact.njk` |
| `form_submit:resource` | Resource submission completion | `src/pages/submit-resource.njk` |

### Example: Track CTA Clicks in resourceFilter.js

```javascript
// Add to src/js/resourceFilter.js after existing filter logic
document.querySelectorAll('[data-track]').forEach(function(el) {
  el.addEventListener('click', function() {
    var event = el.getAttribute('data-track');
    if (window.plausible) {
      plausible(event);
    }
  });
});
```

```njk
{# Mark CTAs with data-track attributes #}
<a href="/resources/" class="btn-secondary" data-track="cta_click:hero">Find Resources</a>
```

## A/B Testing on a Static Site

True A/B testing requires server-side routing or a client-side testing library. Options for this static setup:

### Option 1: Sequential Testing (Simplest)

1. Deploy version A for 2 weeks, record Formspree submissions + analytics
2. Deploy version B for 2 weeks, record the same metrics
3. Compare. Not statistically rigorous, but better than guessing

### Option 2: Client-Side Split (Vanilla JS)

```javascript
// Simple 50/50 split for hero headline
var variant = Math.random() < 0.5 ? 'A' : 'B';
var headline = document.querySelector('[data-test="hero-headline"]');
if (headline && variant === 'B') {
  headline.textContent = 'Find the Support Your Family Deserves';
}
if (window.plausible) {
  plausible('hero_variant', { props: { variant: variant } });
}
```

### DON'T: A/B Test Without a Baseline

```javascript
// BAD — testing without tracking which variant was shown
var headline = document.querySelector('h1');
if (Math.random() < 0.5) {
  headline.textContent = 'Alternative Headline';
}
// No tracking — you'll never know which version "won"
```

## Formspree as a Proxy Metric

Until analytics are added, Formspree submission counts are the closest thing to conversion data:

| Form | Formspree ID Field | What It Indicates |
|------|-------------------|-------------------|
| Contact | `site.formspree.contact` | Inbound interest (quality of about/contact messaging) |
| Submit Resource | `site.formspree.submitResource` | Community engagement (directory CTA effectiveness) |
| Newsletter | `site.formspree.newsletter` | Value prop resonance (newsletter copy effectiveness) |
| Gig platform | `site.formspree.newsletter` + hidden `interest=gig-platform` | Services page messaging |

Track monthly submission counts manually. A sudden drop after a copy change signals a regression.

## Measurement Implementation Checklist

Copy this checklist when setting up measurement:

- [ ] Choose an analytics provider (Plausible, Fathom, or Umami)
- [ ] Add analytics script to `src/_includes/layouts/base.njk` before `</head>`
- [ ] Add `data-track` attributes to primary CTAs on each page
- [ ] Add event tracking JS (either in `main.js` or inline)
- [ ] Verify events fire: check analytics dashboard after deployment
- [ ] Set up a monthly review: compare submission counts + page views
- [ ] Document baseline metrics before making messaging changes
- [ ] After messaging changes, wait 2+ weeks before drawing conclusions

See the **mapping-conversion-events** skill for detailed event taxonomy. See the **instrumenting-product-metrics** skill for full analytics architecture.
