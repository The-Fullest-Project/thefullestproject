# Activation & Onboarding Reference

## Contents
- Activation Definition
- Current State Audit
- First-Visit Flow Patterns
- Empty State Patterns
- Deep Linking as Onboarding
- WARNING: Silent Form Submission
- Implementation Checklist

## Activation Definition

**Activated visitor:** Someone who filters the resource directory and clicks through to an external resource website. This is the moment the site delivers its core value — connecting a caregiver to a real resource.

**Activation funnel:**
1. Land on any page (homepage, search engine, shared link)
2. Reach the resources page (`/resources/`)
3. Apply at least one filter (location, category, or search)
4. Click "Visit Website" on a resource card

## Current State Audit

What exists today:

```njk
{# Homepage hero — two CTAs drive toward activation #}
<a href="/resources/" class="btn-primary">Find Resources</a>
<a href="/about/" class="btn-secondary">Learn More</a>
```

```njk
{# Homepage "How We Can Help" cards — 6 pathways to content #}
<a href="/resources/" class="card hover:shadow-lg">
  <h3>Resource Directory</h3>
  <p>Browse local and national organizations...</p>
</a>
```

```javascript
// resourceFilter.js — reads URL params for pre-filtered views
const urlParams = new URLSearchParams(window.location.search);
const locationParam = urlParams.get('location');
const categoryParam = urlParams.get('category');
```

What does NOT exist:
- No first-visit detection
- No welcome prompt or orientation
- No empty state when filters return 0 results
- No form submission confirmation
- No "what to do next" guidance after any action

## First-Visit Flow Patterns

### DO: Use localStorage for visit detection

```javascript
// src/js/main.js — lightweight first-visit detection
const VISITED_KEY = 'tfp_visited';

function isFirstVisit() {
  return !localStorage.getItem(VISITED_KEY);
}

function markVisited() {
  localStorage.setItem(VISITED_KEY, '1');
}
```

### DON'T: Use cookies or server-side sessions

This is a static site on GoDaddy shared hosting. There is no server runtime. Cookies require a privacy notice under GDPR/CCPA. `localStorage` is simpler and sufficient for non-critical UI hints.

### DO: Make banners dismissible and non-blocking

```html
<div id="welcome-banner" class="hidden" role="status" aria-live="polite">
  <p>New here? Start by selecting your state to find local resources.</p>
  <button id="dismiss-banner" aria-label="Dismiss welcome message">Got it</button>
</div>
```

The `role="status"` and `aria-live="polite"` ensure screen readers announce the banner without interrupting. See the **frontend-design** skill for accessible component patterns.

### DON'T: Auto-play modals or block content

Caregivers arrive stressed and task-focused. A modal wall between them and resources actively harms the mission. Use inline banners that can be scrolled past.

## Empty State Patterns

### DO: Provide actionable empty states everywhere

```njk
{# Blog listing — existing pattern, already in the codebase #}
{% if collections.blogPosts | length == 0 %}
<div class="card text-center py-8">
  <p class="text-xl font-semibold">Blog posts coming soon!</p>
  <p class="mt-2">Sign up for our newsletter to be notified.</p>
</div>
{% endif %}
```

### DO: Add a filter-results empty state (MISSING today)

```javascript
// src/js/resourceFilter.js — add after the filter loop
const noResults = document.getElementById('no-results');
if (noResults) {
  noResults.classList.toggle('hidden', visibleCount > 0);
}
```

```html
<div id="no-results" class="hidden text-center py-12">
  <p class="text-xl font-semibold text-gray-600">No resources match your filters</p>
  <p class="mt-2">Try a broader search, change your location, or
    <button id="reset-filters" class="text-teal-700 underline">reset all filters</button>.
  </p>
</div>
```

### DON'T: Leave the page blank when filters return 0 results

Today, filtering to 0 results shows an empty grid with just the count "0 resource(s) found". Visitors don't know if the site is broken or has no data.

## Deep Linking as Onboarding

The resource filter already supports URL params. Use this for onboarding CTAs on content pages:

```njk
{# Therapy guide page — drives users to pre-filtered resources #}
<a href="/resources/?category=therapy" class="btn-primary">
  Browse Therapy Providers
</a>
```

```njk
{# School & IEP page — deep link to advocacy resources #}
<a href="/resources/?category=advocacy" class="btn-primary">
  Find IEP Advocates & Law Firms
</a>
```

These already exist in the codebase. Every content page should end with a deep-linked CTA to the resources page. This is the strongest onboarding pattern for a static site — context-aware entry points.

## WARNING: Silent Form Submission

**The Problem:** Contact and submit-resource forms use Formspree with no `_next` redirect. After submission, visitors see the Formspree default page — a white screen with "Thanks!" and no way back.

**Why This Breaks:** Caregivers who just submitted a resource get ejected from the site. They don't know their submission was received, don't know what happens next, and may not return.

**The Fix:**

```html
<!-- Add to every Formspree form -->
<input type="hidden" name="_next" value="https://thefullestproject.org/thank-you/">
```

Create `src/pages/thank-you.njk` with clear confirmation and next steps. See the **nunjucks** skill for page template patterns.

## Implementation Checklist

Copy this checklist and track progress:
- [ ] Add `isFirstVisit()` / `markVisited()` to `src/js/main.js`
- [ ] Create welcome banner component in `src/_includes/components/welcome-banner.njk`
- [ ] Include banner on resources page (primary activation surface)
- [ ] Add `#no-results` empty state to `src/pages/resources.njk`
- [ ] Wire empty state toggle into `src/js/resourceFilter.js`
- [ ] Add `_next` redirect to all Formspree forms
- [ ] Create `src/pages/thank-you.njk` confirmation page
- [ ] Verify every content page ends with a deep-linked resource CTA
