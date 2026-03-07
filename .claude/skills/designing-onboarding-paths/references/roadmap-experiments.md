# Roadmap & Experiments Reference

## Contents
- Onboarding Roadmap Phases
- Experiment Approach for Static Sites
- A/B Testing Without Infrastructure
- Feature Flags via Data Files
- WARNING: No Rollback Mechanism
- Prioritized Experiment Backlog

## Onboarding Roadmap Phases

### Phase 1: Fix the Gaps (No new features, just complete what exists)

| Change | Location | Effort |
|--------|----------|--------|
| Add 0-results empty state to resource filter | `src/pages/resources.njk`, `src/js/resourceFilter.js` | Small |
| Add `_next` redirect to all Formspree forms | Contact, submit-resource, newsletter forms | Small |
| Create thank-you page | `src/pages/thank-you.njk` | Small |
| Add newsletter signup to podcast/blog empty states | `src/pages/podcast.njk`, `src/pages/blog.njk` | Small |

### Phase 2: Guide New Visitors

| Change | Location | Effort |
|--------|----------|--------|
| First-visit welcome banner on resources page | `src/js/main.js`, `src/_includes/components/welcome-banner.njk` | Medium |
| Filter hint text (examples in labels) | `src/pages/resources.njk` | Small |
| Next-steps component at bottom of content pages | `src/_includes/components/next-steps.njk` | Medium |
| Cross-linking sidebar on blog posts | `src/_includes/layouts/post.njk` | Medium |

### Phase 3: Measure and Iterate

| Change | Location | Effort |
|--------|----------|--------|
| Add Plausible analytics | `src/_includes/layouts/base.njk` | Small |
| Track filter usage events | `src/js/resourceFilter.js` | Small |
| Track outbound resource clicks | `src/js/resourceFilter.js` | Small |
| Iterate on CTAs based on data | Various | Ongoing |

See the **scoping-feature-work** skill for breaking these into acceptance criteria and the **instrumenting-product-metrics** skill for event tracking implementation.

## Experiment Approach for Static Sites

This is a static site deployed via FTP. There is no server-side rendering, no feature flag service, and no user sessions. Experiments must work within these constraints:

1. **Deploy-based variants:** Push version A, measure for a week, push version B, compare
2. **Client-side variants:** Use JavaScript to randomly assign visitors to groups
3. **URL-based variants:** Create two pages, drive traffic to each, compare

### Client-Side Variant Assignment

```javascript
// src/js/experiments.js — simple A/B assignment
function getVariant(experimentName, variants) {
  const key = `tfp_exp_${experimentName}`;
  let variant = localStorage.getItem(key);
  if (!variant) {
    variant = variants[Math.floor(Math.random() * variants.length)];
    localStorage.setItem(key, variant);
  }
  return variant;
}

// Usage
const ctaVariant = getVariant('hero_cta', ['find_resources', 'browse_by_state']);
```

### DO: Keep experiments small and time-boxed

```
Week 1-2: Run experiment (both variants live)
Week 3:   Analyze results in Plausible
Week 4:   Ship winner, remove experiment code
```

### DON'T: Run multiple experiments simultaneously

With no analytics infrastructure and low traffic (early-stage site), overlapping experiments produce meaningless data. Run one at a time.

## A/B Testing Without Infrastructure

### CTA Text Experiment (Homepage Hero)

```javascript
// src/js/experiments.js
const variant = getVariant('hero_cta', ['a', 'b']);
const ctaBtn = document.querySelector('.hero-gradient .btn-primary');
if (ctaBtn) {
  if (variant === 'b') {
    ctaBtn.textContent = 'Browse Resources by State';
    ctaBtn.href = '/resources/?location=Virginia';
  }
  // variant 'a' keeps default: "Find Resources" → /resources/
}
```

Track with Plausible:

```javascript
ctaBtn?.addEventListener('click', () => {
  if (typeof plausible !== 'undefined') {
    plausible('Hero CTA Click', { props: { variant } });
  }
});
```

### Filter Default Experiment (Resources Page)

Test whether pre-selecting "National" in the location filter improves activation:

```javascript
// In src/js/resourceFilter.js — at the top, before reading URL params
const variant = getVariant('default_filter', ['none', 'national']);
const locationFilter = document.getElementById('location-filter');
if (variant === 'national' && locationFilter && !window.location.search) {
  locationFilter.value = 'National';
}
```

## Feature Flags via Data Files

For features that need to be toggled without code changes, use `src/_data/site.json`:

```json
{
  "features": {
    "welcomeBanner": true,
    "emptyStateNewsletter": true,
    "thankYouPage": true
  }
}
```

```njk
{# In templates — check feature flag #}
{% if site.features.welcomeBanner %}
  {% include "components/welcome-banner.njk" %}
{% endif %}
```

This approach works because Eleventy rebuilds on every deploy. Toggle a flag in `site.json`, push to main, and the CI/CD pipeline deploys the change. See the **eleventy** skill for data file patterns and the **github-actions** skill for deploy workflow.

### DO: Use feature flags for Phase 2+ features

New components (welcome banner, next-steps, cross-links) should ship behind flags so they can be disabled without removing code.

### DON'T: Use feature flags for bug fixes

Phase 1 changes (empty states, form redirects) are fixes, not experiments. Ship them directly.

## WARNING: No Rollback Mechanism

**The Problem:** Deployment is FTP upload to GoDaddy. There is no versioned deployment, no blue-green, no instant rollback.

**Why This Breaks:** If an experiment causes problems (broken layout, accessibility regression, wrong CTA link), the only fix is to push a new commit and wait for CI/CD to redeploy.

**The Fix:**

1. Always test experiments locally with `npm run dev` before pushing
2. Use feature flags so you can disable a feature by changing one JSON value
3. Keep experiment code isolated in its own JS file (`src/js/experiments.js`)
4. Never modify core functionality (resource filtering, form submission) as part of an experiment

Validation loop:
1. Make experiment changes
2. Run `npm run build` and verify `_site/` output
3. If build fails, fix and repeat step 2
4. Test in browser with `npm run serve`
5. Only push to main when verified locally

## Prioritized Experiment Backlog

Based on expected impact vs. effort:

| Priority | Experiment | Hypothesis | Metric |
|----------|-----------|------------|--------|
| 1 | Empty state with reset CTA | Visitors who hit 0 results will retry instead of bouncing | Bounce rate on resources page |
| 2 | Welcome banner with location prompt | First-visit visitors will filter by location more often | Filter usage rate |
| 3 | Hero CTA text (Find vs Browse) | "Browse by State" drives more filter usage than "Find Resources" | Resource page filter rate |
| 4 | Newsletter placement (inline vs modal) | Inline signup after resource cards converts better than footer | Newsletter signup rate |
| 5 | Deep-linked CTAs on blog posts | Blog readers who see "Find [topic] Resources" CTA visit resources page more | Blog → resources navigation rate |
