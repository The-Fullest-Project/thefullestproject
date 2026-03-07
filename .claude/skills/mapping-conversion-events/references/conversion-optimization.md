# Conversion Optimization Reference

## Contents
- Conversion Points Inventory
- WARNING: No Success Pages
- WARNING: Placeholder Formspree IDs
- Form Friction Reduction
- CTA Hierarchy Patterns
- Formspree Redirect Flow
- Resource Directory as Conversion Path

## Conversion Points Inventory

This site has 5 form instances across 3 Formspree endpoints:

| Form | Location | Endpoint Key | Fields | Friction |
|------|----------|-------------|--------|----------|
| Newsletter (home) | `src/pages/index.njk:115` | `newsletter` | email | Low |
| Newsletter (footer) | `src/_includes/components/footer.njk:37` | `newsletter` | email | Low |
| Gig notify | `src/pages/services/index.njk:65` | `newsletter` | email + hidden `interest` | Low |
| Contact | `src/pages/contact.njk:15` | `contact` | name, email, subject, message | Medium |
| Resource submit | `src/pages/submit-resource.njk:15` | `submitResource` | 7 fields (4 required) | High |

## WARNING: No Success Pages Exist

**The Problem:**

All forms submit to Formspree with no `_next` redirect. Users hit Formspree's generic confirmation page, breaking the branded experience and killing any post-conversion tracking.

**Why This Breaks:**
1. Users leave your domain — you lose them from GA4 session tracking
2. No opportunity to present next-step CTAs (share, browse more, subscribe)
3. Cannot fire a `conversion` event on a thank-you pageview

**The Fix:**

```html
{# Add to EVERY Formspree form #}
<input type="hidden" name="_next" value="https://thefullestproject.org/thank-you/">
```

```yaml
# src/pages/thank-you.njk
---
layout: layouts/page.njk
title: "Thank You!"
description: "Your submission was received."
permalink: /thank-you/
---
```

```html
<div class="max-w-2xl mx-auto text-center py-16">
  <h2 class="text-3xl font-bold mb-4" style="color: var(--color-primary);">
    Thank you!
  </h2>
  <p class="text-lg text-gray-600 mb-8">
    We received your submission and will be in touch soon.
  </p>
  <div class="flex flex-col sm:flex-row gap-4 justify-center">
    <a href="/resources/" class="btn-primary">Browse Resources</a>
    <a href="/blog/" class="btn-secondary">Read Our Blog</a>
  </div>
</div>
```

## WARNING: Placeholder Formspree IDs

**Detected:** `src/_data/site.json` contains `YOUR_FORMSPREE_CONTACT_ID` placeholders.

**Impact:** Every form on the site submits to a non-existent endpoint. Forms silently fail.

**The Fix:** Replace placeholders with real Formspree form IDs:

```json
{
  "formspree": {
    "contact": "xyzabcde",
    "submitResource": "xyzfghij",
    "newsletter": "xyzklmno"
  }
}
```

Validate by submitting each form and checking the Formspree dashboard.

## Form Friction Reduction

### DO: Single-field newsletter forms

```html
{# GOOD — one field, immediate value prop #}
<form action="https://formspree.io/f/{{ site.formspree.newsletter }}" method="POST"
      data-form-type="newsletter-home">
  <label for="home-email" class="sr-only">Email address</label>
  <input type="email" id="home-email" name="email" placeholder="Enter your email"
         required class="form-input">
  <button type="submit" class="btn-secondary">Subscribe</button>
</form>
```

### DON'T: Add unnecessary fields to newsletter signup

```html
{# BAD — adding name/preferences to newsletter kills conversion rate #}
<input type="text" name="name" placeholder="Your name" required>
<input type="email" name="email" required>
<select name="interests" required>...</select>
```

**Why:** Every additional field reduces form completion by 10-25%. Collect preferences later via email drip. See the **designing-lifecycle-messages** skill.

### DO: Pre-fill subject via URL params on contact form

The services page already links to `/contact/?subject=partnership`. Extend this:

```javascript
// src/js/main.js
const params = new URLSearchParams(window.location.search);
const subjectParam = params.get('subject');
if (subjectParam) {
  const select = document.getElementById('subject');
  if (select) select.value = subjectParam;
}
```

## CTA Hierarchy Patterns

### DO: One primary CTA per viewport

```html
{# GOOD — hero has one clear primary action #}
<a href="/resources/" class="btn-secondary text-lg px-8 py-3">Find Resources</a>
<a href="/about/" class="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-lg">Learn More</a>
```

The secondary CTA uses `bg-white/20` (ghost style), keeping visual hierarchy clear.

### DON'T: Competing CTAs of equal weight

```html
{# BAD — two btn-primary buttons confuse the user #}
<a href="/resources/" class="btn-primary">Find Resources</a>
<a href="/contact/" class="btn-primary">Contact Us</a>
```

**Why:** Equal visual weight splits attention. The primary conversion action (Find Resources) must dominate. See the **tuning-landing-journeys** skill for page-level CTA audits.

## Formspree Redirect Flow

Current flow (broken):
```
User submits → Formspree generic page → User leaves site
```

Target flow:
```
User submits → _next redirect → /thank-you/ → GA4 conversion event → Next CTA
```

Implementation requires:
1. `_next` hidden field on every form
2. A `/thank-you/` page (or form-specific variants)
3. GA4 conversion event on thank-you pageview

```javascript
// Fire conversion on thank-you page load
if (window.location.pathname === '/thank-you/') {
  gtag('event', 'conversion', {
    event_category: 'form',
    event_label: document.referrer.includes('contact') ? 'contact' : 'general'
  });
}
```

## Resource Directory as Conversion Path

The resource directory (`resources.njk`) is both a destination and a funnel stage. Users who filter and find resources are engaged — the bottom-of-page CTA converts them:

```html
{# src/pages/resources.njk:107 — existing submit CTA #}
<div class="card text-center">
  <h3>Know a Resource We're Missing?</h3>
  <p>Help us grow our directory by submitting resources...</p>
  <a href="/submit-resource/" class="btn-primary">Submit a Resource</a>
</div>
```

**Optimization:** Track how many users reach this CTA vs. how many click it. Add `data-cta="resource-submit-prompt"` for click tracking:

```html
<a href="/submit-resource/" class="btn-primary" data-cta="resource-submit-prompt">
  Submit a Resource
</a>
```

See the **instrumenting-product-metrics** skill for full CTA tracking instrumentation.
