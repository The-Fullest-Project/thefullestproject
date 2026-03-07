# Roadmap & Experiments Reference

## Contents
- Current Feature Maturity
- Staged Rollout Surfaces
- Experiment Patterns for Static Sites
- Feature Gating Without JavaScript Frameworks
- Anti-Patterns

## Current Feature Maturity

| Feature | Status | Location | Notes |
|---------|--------|----------|-------|
| Resource directory | Live | `src/pages/resources.njk` | 29 categories, 51 locations |
| Therapy guide | Live | `src/pages/therapy-guide/` | 8 therapy types |
| School & IEP guide | Live | `src/pages/school-iep/` | IEP vs 504, 6-step process |
| Adaptive equipment | Live | `src/pages/adaptive-equipment.njk` | Categories + loaner programs |
| Blog | Placeholder | `src/pages/blog.njk` | Empty state, no posts yet |
| Podcast | Placeholder | `src/pages/podcast.njk` | Empty state, "Coming to Spotify" badges |
| Contact form | Blocked | `src/pages/contact.njk` | Formspree ID is placeholder |
| Resource submission | Blocked | `src/pages/submit-resource.njk` | Formspree ID is placeholder |
| Newsletter signup | Blocked | 3 locations | Formspree ID is placeholder |
| Non-profit coaching | Live (info) | `src/pages/services/` | Links to contact form |
| Group life coaching | Live (info) | `src/pages/services/` | Links to contact form |
| Gig platform | Pre-launch | `src/pages/services/` | "Coming Soon" badge, notify form |
| Shop | Pre-launch | `src/pages/services/` | "Coming Soon", no product page |

## Staged Rollout Surfaces

The gig platform card demonstrates the project's pattern for pre-launch features:

```njk
{# src/pages/services/index.njk:52-71 - Coming Soon pattern #}
<div class="card p-8" style="border: 2px dashed var(--color-accent);">
  <span class="tag mb-4" style="background-color: var(--color-accent); color: white;">
    Coming Soon
  </span>
  <h2 class="text-2xl font-bold mb-4" style="color: var(--color-primary);">
    Caregiver Gig Platform
  </h2>
  <p class="mb-6">A gig-economy platform designed to empower caregivers...</p>
  {# Waitlist form instead of action CTA #}
  <form action="https://formspree.io/f/{{ site.formspree.newsletter }}" method="POST">
    <input type="hidden" name="interest" value="gig-platform">
    <input type="email" name="email" placeholder="Get notified at launch" class="form-input">
    <button type="submit" class="btn-secondary text-sm">Notify Me</button>
  </form>
</div>
```

**DO:** Use the dashed border + "Coming Soon" tag pattern for pre-launch features. It sets expectations clearly.
**DO:** Collect interest via hidden form fields (`name="interest" value="gig-platform"`) for segmented launch communication.
**DON'T:** Show "Coming Soon" without a way to collect interest. Dead announcements waste attention.

## Experiment Patterns for Static Sites

This is a statically generated site with no server-side rendering and no feature flag service. Experiments must work within these constraints.

### Build-Time Feature Gating

Use `site.json` to control feature visibility at build time:

```json
// src/_data/site.json - Add feature flags
{
  "features": {
    "blog": false,
    "podcast": false,
    "shop": false,
    "gigPlatform": false
  }
}
```

```njk
{# Template: Conditionally render nav items #}
{% if site.features.blog %}
<li><a href="/blog/">Blog</a></li>
{% endif %}
```

**DO:** Gate pre-launch features at the template level so empty pages don't appear in navigation.
**DON'T:** Remove template code for unreleased features — gate it so you can flip the flag and redeploy.

### URL-Param Variant Testing

For A/B testing CTA copy or layout, use URL params read client-side:

```javascript
// Pattern: URL-param driven variant
const variant = new URLSearchParams(window.location.search).get('v');
if (variant === 'b') {
  document.querySelector('.hero-cta').textContent = 'Browse Resources';
}
```

This pairs with link tracking in marketing emails or social posts — send half your audience to `/?v=b`.

**DO:** Keep variant logic simple and measurable. See the **instrumenting-product-metrics** skill for tracking.
**DON'T:** Use URL-param variants for critical user flows. They break if URLs are shared.

## Content Experiments with Eleventy Data

Since the site uses Eleventy's data cascade, you can experiment with content by adding variant data files:

```javascript
// .eleventy.js - Different homepage hero text for testing
eleventyConfig.addGlobalData("heroVariant", () => {
  return process.env.HERO_VARIANT || "default";
});
```

```njk
{# src/pages/index.njk - Conditional hero copy #}
{% if heroVariant === "action" %}
  <h1>Find Disability Resources Near You</h1>
{% else %}
  <h1>Living Life to the Fullest</h1>
{% endif %}
```

Deploy two builds with different `HERO_VARIANT` env vars and split traffic at the DNS/CDN level.

## Prioritized Launch Blockers

Before any feature experiment matters, fix these blockers:

1. **Formspree IDs** — All three form endpoints are placeholders. No form works.
2. **Blog content** — Nav links to `/blog/` which shows "coming soon"
3. **Podcast content** — Nav links to `/podcast/` which shows "coming soon"
4. **Shop link** — Footer links to `/shop/` which 404s

## Experiment Checklist

Copy this checklist and track progress:
- [ ] Replace Formspree placeholder IDs (blocks all form experiments)
- [ ] Add build-time feature flags to `site.json` for blog/podcast/shop
- [ ] Gate empty-content nav links behind feature flags
- [ ] Set up A/B test for homepage hero CTA text
- [ ] Create waitlist collection strategy for gig platform launch
