# Roadmap & Experiments Scoping

## Contents
- Feature Prioritization Framework
- Experiment Patterns for Static Sites
- Rollout Strategy
- Scope Sizing Guide
- Anti-Patterns

## Feature Prioritization Framework

For a static site with no A/B testing infrastructure, prioritize features using this framework tied to the project's three-phase roadmap.

**The Fullest Project's phases (from about.njk):**

| Phase | Focus | Scoping Priority |
|-------|-------|-----------------|
| 1. Consolidate Resources | Data completeness, coverage | More resources, more states, better data quality |
| 2. Build Community | Content, engagement | Blog posts, stories, newsletter growth |
| 3. Empower Caregivers | Services, tools | Coaching, gig platform, interactive features |

**Prioritization decision tree:**

```
Does the feature add resources or improve data quality?
  YES → High priority (Phase 1 — current focus)
  NO  ↓

Does the feature drive community engagement?
  YES → Medium priority (Phase 2)
  NO  ↓

Does the feature enable new services?
  YES → Lower priority (Phase 3 — future)
  NO  → Evaluate on case-by-case basis
```

### Scoping Features by Phase

```
Phase 1 features (scope aggressively):
- New state resource files (states/[ST].json)
- New scraper modules (scrapers/sources/)
- Resource data quality improvements (missing fields)
- Resource schema extensions (new useful fields)

Phase 2 features (scope carefully):
- Blog content and CMS improvements
- Newsletter touchpoint expansion
- Community stories section
- Social proof elements

Phase 3 features (scope minimally — MVP only):
- Gig platform beyond waitlist
- Interactive tools
- User accounts
```

## Experiment Patterns for Static Sites

Without server-side A/B testing, experiments on a static site use URL-based or build-time variations.

### URL Parameter Experiments

The resource filter already supports URL parameters. Use this pattern for lightweight experiments.

```
Experiment: "Does category pre-filtering improve engagement?"

Control: /resources/ (no filter applied)
Variant: /resources/?category=therapy (pre-filtered)

Setup:
1. Create two CTAs on the therapy guide page
2. Each links to a different URL
3. Track which URL gets more outbound resource clicks

Scope:
  Slice 1: Add both CTAs with distinct URL params
  Slice 2: Add click tracking (requires analytics — see product-analytics.md)
  Slice 3: Analyze and pick winner
```

### Build-Time Content Variations

Eleventy's data cascade supports content variations without runtime logic.

```nunjucks
{# Use site.json flags to control feature visibility #}
{# In src/_data/site.json: #}
{# "features": { "showGigPlatform": false } #}

{% if site.features.showGigPlatform %}
  <section id="gig-platform">
    {# Full gig platform content #}
  </section>
{% else %}
  <section id="gig-platform">
    <span class="tag bg-amber-100 text-amber-800">Coming Soon</span>
    {# Waitlist signup only #}
  </section>
{% endif %}
```

**Scoping a feature flag:**

```
Feature: "Gate gig platform behind feature flag"

Slice 1 (MVP): Add feature flags to site.json
  Files: src/_data/site.json
  AC: New "features" object with boolean flags
  AC: Default all flags to false (safe default)

Slice 2: Wrap gig platform in conditional
  Files: src/pages/services/index.njk
  AC: Full content shows when flag is true
  AC: "Coming Soon" shows when flag is false
  AC: Build works with flag in either state
```

### Scoping Incremental Rollouts

For a static site deployed via FTP, "rollout" means deploying to production. There's no gradual percentage-based rollout. Instead, use feature flags and the deploy pipeline.

```
Rollout checklist for new features:
- [ ] Feature works in local dev: npm run dev
- [ ] Build succeeds: npm run build
- [ ] Feature flag defaults to false in site.json
- [ ] Deploy with flag off (ship code without enabling)
- [ ] Verify production build is clean
- [ ] Flip flag to true, rebuild, redeploy
- [ ] Verify feature live on production
- [ ] Monitor Formspree dashboard for form-related features
```

## Scope Sizing Guide

Use this guide to estimate slice complexity and avoid oversized slices.

### Small Slice (1-2 files, < 1 hour)

```
Examples:
- Add 10 resources to a state JSON file
- Add a CTA section to an existing page
- Add a nav link (desktop + mobile)
- Update site.json metadata
- Fix a Nunjucks template rendering issue

Acceptance criteria: 1-3 items
```

### Medium Slice (2-4 files, 1-3 hours)

```
Examples:
- Create a new guide page with front matter + content + nav link
- Add a new Formspree form with site.json config
- Add a new filter dropdown to resourceFilter.js
- Create a new scraper module with merge logic

Acceptance criteria: 3-5 items
```

### Large Slice (5+ files, > 3 hours)

```
Examples:
- New content type (Markdown schema + collection + listing page + CMS config)
- Site-wide layout change (base.njk + nav + footer + all page templates)
- Analytics implementation (base layout + multiple JS files + form templates)

WARNING: If a slice is "Large", break it down further.
Split into medium slices that ship independently.
```

### Scope Estimation Template

```
Feature: "[Name]"
Phase alignment: [1/2/3]
Estimated size: [Small/Medium/Large]

Files touched:
- [ ] src/pages/...
- [ ] src/_data/...
- [ ] src/_includes/...
- [ ] src/js/...
- [ ] scrapers/...
- [ ] .eleventy.js
- [ ] src/_data/site.json

Dependencies:
- Requires: [existing page/data/feature]
- Blocks: [future slice that depends on this]

Acceptance criteria:
1. ...
2. ...
3. ...

Deploy gate: npm run build passes
```

## Anti-Patterns

### WARNING: Scoping Phase 3 Features When Phase 1 Is Incomplete

**The Problem:** Building interactive tools or user accounts while resource coverage is still thin (< 50% of states have data).

**Why This Breaks:** The site's core value proposition is resource discovery. Fancy features on top of thin data waste effort. Users come for resources — if the data isn't there, nothing else matters.

**The Fix:** Check data coverage before scoping non-data features:
```nunjucks
{# How many states have resources? #}
{# Count files in src/_data/resources/states/ #}
```
If coverage is below target, scope data-first features.

### WARNING: Skipping the Deploy Gate

**The Problem:** Marking a scope slice as "done" without running `npm run build`.

**Why This Breaks:** Nunjucks template errors are silent in dev mode but break the build. Missing data references, undefined variables, and broken includes only surface during a full build. CI/CD will catch it, but that means a broken deploy pipeline.

**The Fix:** Every slice's acceptance criteria must include:
```
- [ ] npm run build completes without errors
```

This is non-negotiable. See the **eleventy** skill for common build errors.

### WARNING: Feature Flags Without Default Values

**The Problem:** Adding `{% if site.features.newThing %}` without adding the flag to `site.json`.

**Why This Breaks:** Nunjucks evaluates `undefined` as falsy, so the feature silently doesn't render. But the code path exists without test coverage. When someone later adds the flag as `true`, untested code goes live.

**The Fix:** Always scope the `site.json` flag addition and the template conditional in the same slice. Both files change together.
