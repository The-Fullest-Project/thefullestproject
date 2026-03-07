# Roadmap & Experiments — Triage Perspective

## Contents
- Feedback-Driven Roadmap Prioritization
- The Three-Phase Model and Feedback Signals
- Experiment Patterns for a Static Site
- Feature Flags via site.json
- WARNING: Anti-Patterns
- Roadmap Triage Checklist

---

## Feedback-Driven Roadmap Prioritization

Without analytics, roadmap priorities come from feedback patterns. The triage process directly feeds the backlog.

### Mapping Feedback to Roadmap Phases

The project follows a three-phase roadmap (from `src/pages/about.njk`):

| Phase | Focus | Feedback Signals |
|-------|-------|-----------------|
| Phase 1: Consolidate Resources | National + pilot location coverage | Resource submissions, location gap requests |
| Phase 2: Build Knowledge | Blog, podcast, partnerships | Story submissions, partnership inquiries, content feedback |
| Phase 3: Empower Caregivers | Gig platform, coaching services | Gig platform notify signups, coaching inquiries |

**Triage rule:** Feedback that maps to the current phase gets prioritized over feedback that maps to future phases. If Phase 1 isn't complete (resource gaps exist), Phase 2 and Phase 3 work is premature.

### DO: Quantify Phase Readiness from Feedback

```python
# Map recent feedback to roadmap phases
phase_signals = {
    'phase1': 0,  # Resource gaps, data quality issues
    'phase2': 0,  # Content requests, partnership inquiries
    'phase3': 0,  # Service interest, gig platform signups
}

for submission in contact_submissions:
    subj = submission.get('subject', '')
    if subj in ('resource', 'feedback'):
        phase_signals['phase1'] += 1
    elif subj in ('story', 'partnership'):
        phase_signals['phase2'] += 1

for submission in newsletter_submissions:
    if submission.get('_source') == 'services-gig-notify':
        phase_signals['phase3'] += 1

# If phase1 > phase2 + phase3, stay focused on Phase 1
print(phase_signals)
```

---

## The Three-Phase Model and Feedback Signals

### Phase 1 Signals: Resource Coverage

Resource directory is the core product. Phase 1 is complete when feedback shifts from "I can't find resources for X" to "these resources are helpful."

**Quick wins from Phase 1 feedback:**

```json
// Formspree resource submission → add to appropriate JSON file
// Target file determined by location field

// "Virginia" → src/_data/resources/states/VA.json
// "Oregon" → src/_data/resources/states/OR.json
// "National" → src/_data/resources/national.json

// Add verified resource:
{
  "name": "Community Resource Center",
  "category": ["community-groups"],
  "location": "Virginia",
  "description": "User-submitted description, verified",
  "website": "https://verified-url.org",
  "source": "community-submission",
  "lastScraped": ""
}
```

**Backlog items from Phase 1 feedback:**
- New state requested with 3+ submissions → write new scraper in `scrapers/sources/`
- New category requested repeatedly → add to category dropdowns across all forms and filters
- Resource data quality complaints → improve scraper validation in `scrapers/base_scraper.py`

### Phase 2 Signals: Content and Community

```nunjucks
{# src/pages/blog.njk — empty state reveals Phase 2 demand #}
{% if collections.blogPosts.length === 0 %}
  <p>Blog posts coming soon!</p>
  <p>Sign up for our newsletter to be notified when new posts are published.</p>
{% endif %}
```

**Triage rule:** If newsletter signups from `blog-empty-state` source exceed 10/month, Phase 2 content creation should begin. If zero, blog demand is low — stay on Phase 1.

### Phase 3 Signals: Service Demand

```html
{# src/pages/services/index.njk — gig platform interest capture #}
<input type="hidden" name="interest" value="gig-platform">
<input type="email" name="email" placeholder="Get notified at launch">
```

Track gig platform notification signups separately. This is your Phase 3 demand signal.

---

## Experiment Patterns for a Static Site

### Build-Time A/B Testing via Feature Flags

Since the site rebuilds on every deploy, you can test variations by changing config and deploying:

```json
// src/_data/site.json — add features object
{
  "features": {
    "submitResourceProminent": false,
    "expandedCategoryDropdown": false,
    "therapyGuideDepth": "summary"
  }
}
```

```nunjucks
{# src/pages/resources.njk — conditional feature #}
{% if site.features.submitResourceProminent %}
  {# Show submit CTA at top of page, not just bottom #}
  <div class="card p-6 mb-8" style="background-color: var(--color-warm-light);">
    <h3 style="color: var(--color-primary);">Know a resource we're missing?</h3>
    <a href="/submit-resource/" class="btn-primary no-underline">Submit a Resource</a>
  </div>
{% endif %}
```

**Experiment process:**
1. Deploy with flag `false` for 2 weeks, count resource submissions
2. Deploy with flag `true` for 2 weeks, count resource submissions
3. Compare. Higher submission count wins.

### DO: Run Sequential Experiments, Not Simultaneous

```
// GOOD — one change at a time, clear signal
Week 1-2: submitResourceProminent = false  → 4 submissions
Week 3-4: submitResourceProminent = true   → 9 submissions
Conclusion: prominent CTA drives more submissions

// BAD — two changes at once, unclear signal
Week 1-2: both flags false → 4 submissions
Week 3-4: both flags true  → 7 submissions
Conclusion: which change helped? Unknown.
```

### DON'T: Over-Engineer Client-Side A/B Testing

```javascript
// BAD — random assignment on a low-traffic static site
var variant = Math.random() > 0.5 ? 'A' : 'B';
document.body.classList.add('variant-' + variant);
```

**Why this breaks:** Low-traffic sites don't generate enough data for statistical significance with random splits. Sequential testing (everyone sees A, then everyone sees B) gives clearer signals with smaller audiences. See the **orchestrating-feature-adoption** skill for rollout patterns.

---

## Feature Flags via site.json

### Using site.json for Triage-Driven Toggles

When triage identifies an experiment worth running, add a feature flag:

```json
// src/_data/site.json
{
  "features": {
    "showWasThisHelpful": true,
    "contactFormReferrer": true,
    "resourceCardReportLink": false
  }
}
```

```nunjucks
{# Conditional rendering based on feature flag #}
{% if site.features.showWasThisHelpful %}
  {% include "components/was-this-helpful.njk" %}
{% endif %}
```

**Flag lifecycle:**
1. Flag starts `false` (disabled)
2. Triage identifies need → set `true`, deploy
3. Measure impact over 2-4 weeks via Formspree data
4. If positive → remove flag, keep feature permanent
5. If negative → set `false`, remove feature code

### DON'T: Accumulate Stale Feature Flags

```json
// BAD — flags from 6 months ago, nobody remembers what they do
{
  "features": {
    "experimentJan2026": true,
    "newLayout": true,
    "oldFooterBackup": false,
    "testingSomething": false
  }
}
```

**Why this breaks:** Stale flags make the codebase harder to understand. Nunjucks conditionals wrapping dead flags are tech debt.

**The fix:** Review feature flags during triage. Any flag older than 8 weeks should be resolved: either remove the flag and keep the feature, or remove the flag and the feature code.

---

## WARNING: Anti-Patterns

### WARNING: Building Phase 3 Features While Phase 1 Has Gaps

**The Problem:** Feedback shows 15 resource submissions for states with no data, but development focuses on the gig platform.

**Why This Breaks:**
1. The resource directory is the site's primary value. Empty directories mean zero retention.
2. The gig platform has no users if the resource directory hasn't built trust.
3. Each unaddressed resource gap is a caregiver who left without help.

**The Fix:** Phase 1 is never "done" — resource gaps are always P1. Phase 2/3 work only starts when weekly resource feedback drops below a threshold (e.g., fewer than 3 gap reports per week).

---

## Roadmap Triage Checklist

Copy this checklist and track progress:

- [ ] Map last 30 days of feedback to roadmap phases
- [ ] Count Phase 1 signals (resource gaps) vs Phase 2/3 signals
- [ ] If Phase 1 signals dominate, defer Phase 2/3 work
- [ ] Review active feature flags in `site.json` — remove stale flags
- [ ] Identify one experiment to run based on highest-volume feedback
- [ ] Set up sequential test: 2 weeks off, 2 weeks on
- [ ] Document experiment results in a triage log
- [ ] Run `npm run build` to verify flag changes
