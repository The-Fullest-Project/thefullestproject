# Roadmap & Experiments Reference

## Contents
- Experimentation on a Static Site
- Feature Flags via Data Files
- A/B Testing Without a Backend
- Phased Guidance Rollout
- WARNING: Anti-Patterns
- Experiment Checklist

---

## Experimentation on a Static Site

This is a statically generated Eleventy site deployed to GoDaddy via FTP. There is no server-side rendering, no edge functions, and no CDN-level routing. Experimentation must happen at one of two levels:

1. **Build-time variants** — different HTML generated via `src/_data/` flags, deployed as a single version
2. **Client-side variants** — JavaScript reads a flag from localStorage or URL params and modifies the DOM

Both approaches have tradeoffs. Build-time is simpler but requires a deploy to change. Client-side is dynamic but causes layout shifts if not handled carefully.

---

## Feature Flags via Data Files

Use a JSON data file to control which guidance features are active.

### DO: Data-Driven Feature Flags

```json
// src/_data/features.json
{
  "showFilterHint": true,
  "showTooltips": true,
  "showWelcomeBanner": false,
  "showBreadcrumbs": true,
  "submitFormHelpText": true
}
```

```nunjucks
{# src/pages/resources.njk — conditional filter hint #}
{% if features.showFilterHint %}
<div id="filter-hint" class="text-sm p-3 rounded-lg mb-4"
  style="background-color: var(--color-warm-light); color: var(--color-text-light);">
  <strong>Tip:</strong> Use the filters above to narrow results by location
  and category.
</div>
{% endif %}
```

```nunjucks
{# src/pages/index.njk — conditional welcome banner #}
{% if features.showWelcomeBanner %}
{% include "components/welcome-banner.njk" %}
{% endif %}
```

This pattern is excellent because:
- Eleventy auto-loads `src/_data/features.json` as `features` in all templates
- Toggle a feature by editing one JSON value and rebuilding
- No runtime JS required
- GitHub Actions deploy takes ~1 minute, so iteration is fast

See the **eleventy** skill for data file loading patterns.

### DON'T: Hardcode Feature Booleans in Templates

```nunjucks
{# BAD — scattered booleans across multiple files #}
{% set showHint = true %}
{% if showHint %}
  ...
{% endif %}
```

**Why this breaks:** Feature state is scattered across templates. You can't see what's enabled without grepping every `.njk` file. Centralize in `features.json`.

---

## A/B Testing Without a Backend

For testing two variants of a guidance element (e.g., different CTA copy, tooltip placement), use client-side random assignment persisted in localStorage.

### DO: Simple Client-Side Variant Assignment

```javascript
// src/js/main.js — append
(function() {
  var variant = localStorage.getItem('tfp-variant');
  if (!variant) {
    variant = Math.random() < 0.5 ? 'A' : 'B';
    localStorage.setItem('tfp-variant', variant);
  }
  document.body.setAttribute('data-variant', variant);
})();
```

```css
/* src/css/styles.css — variant-specific styles */
[data-variant="A"] .cta-text-a { display: inline; }
[data-variant="A"] .cta-text-b { display: none; }
[data-variant="B"] .cta-text-a { display: none; }
[data-variant="B"] .cta-text-b { display: inline; }
```

```html
{# Template — both variants in HTML, CSS toggles visibility #}
<a href="/resources/" class="btn-primary no-underline">
  <span class="cta-text-a">Find Resources</span>
  <span class="cta-text-b">Search Our Directory</span>
</a>
```

Track which variant the user saw:

```javascript
trackEvent('CTA Variant', { variant: localStorage.getItem('tfp-variant') });
```

### DON'T: Server-Side A/B on a Static Host

```javascript
// BAD — no server to run this on GoDaddy shared hosting
app.use((req, res, next) => {
  res.locals.variant = assignVariant(req.cookies.userId);
  next();
});
```

**Why this breaks:** GoDaddy shared hosting serves static files. There is no Node.js server, no edge functions, no middleware. All experimentation must be client-side or build-time.

---

## Phased Guidance Rollout

Roll out guidance features incrementally to catch issues early.

### Phase 1: Passive Guidance (Low Risk)

| Feature | Location | Risk |
|---------|----------|------|
| Inline help text on forms | submit-resource.njk, contact.njk | None — additive HTML |
| Breadcrumbs | layouts/page.njk | Low — new `<nav>` element |
| Jump links on long pages | therapy-guide, equipment | None — additive `<nav>` |

### Phase 2: Interactive Guidance (Medium Risk)

| Feature | Location | Risk |
|---------|----------|------|
| CSS tooltips on abbreviations | therapy-guide, school-iep | Low — CSS + HTML only |
| Filter guidance hint | resources.njk | Low — conditional via `features.json` |
| Zero-results empty state | resourceFilter.js | Medium — modifies JS behavior |

### Phase 3: Behavioral Guidance (Higher Risk)

| Feature | Location | Risk |
|---------|----------|------|
| First-visit detection | main.js + localStorage | Medium — requires JS, localStorage |
| Welcome banner | index.njk | Medium — visible UI change |
| Analytics event tracking | main.js, resourceFilter.js | Medium — new external dependency |

### Rollout Process

1. Implement Phase 1 features
2. Validate: `npm run build && npm run serve` — check all pages render correctly
3. If build fails, fix and repeat step 2
4. Deploy Phase 1 to production
5. Wait 1 week, check Formspree submissions for any change in volume
6. Implement Phase 2 with `features.json` flags (start with all `false`)
7. Enable one feature at a time, deploy, observe
8. Repeat for Phase 3

---

## WARNING: Anti-Patterns

### WARNING: Feature Flag Sprawl

**The Problem:**

```json
{
  "showFilterHint": true,
  "showFilterHintV2": true,
  "showFilterHintV2_backup": false,
  "showFilterHintOld": false,
  "showFilterHintTest": true
}
```

**Why This Breaks:**
1. Nobody knows which flags are active or what they control
2. Dead flags accumulate and confuse future contributors
3. Multiple overlapping flags can create contradictory states

**The Fix:**
Maximum 10 feature flags at any time. When a feature is permanently enabled, remove the flag and the conditional. Add a comment with the date each flag was added:

```json
{
  "showFilterHint": true,
  "showTooltips": true,
  "showWelcomeBanner": false,
  "showBreadcrumbs": true
}
```

### WARNING: Layout Shift from Client-Side Variants

**The Problem:**

```javascript
// BAD — variant applied after page renders
window.addEventListener('load', () => {
  if (getVariant() === 'B') {
    document.querySelector('.hero h1').textContent = 'Different Headline';
  }
});
```

**Why This Breaks:** User sees variant A text flash, then it changes to variant B. This is a poor experience and inflates Cumulative Layout Shift (CLS). Apply variant assignment in `<head>` or before body renders, and use CSS `display` toggling (both variants in DOM, one hidden) instead of JS text replacement.

---

## Experiment Checklist

Copy this checklist and track progress:

- [ ] Create `src/_data/features.json` with initial flags (all `false`)
- [ ] Add `{% if features.flagName %}` conditionals in target templates
- [ ] Enable one flag at a time and run `npm run build`
- [ ] Test each feature in `npm run serve` before deploying
- [ ] For A/B tests: add variant assignment to `src/js/main.js`
- [ ] Add variant tracking event
- [ ] Clean up: remove flags for permanently enabled features
- [ ] Document active flags in a comment block in `features.json`

See the **scoping-feature-work** skill for breaking experiment features into shippable increments.
