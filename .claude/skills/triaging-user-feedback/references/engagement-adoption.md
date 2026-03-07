# Engagement & Adoption — Triage Perspective

## Contents
- Feedback-Driven Engagement Signals
- Resource Directory Engagement Patterns
- Newsletter as Adoption Funnel
- Cross-Section Linking from Feedback
- WARNING: Anti-Patterns
- Engagement Triage Checklist

---

## Feedback-Driven Engagement Signals

Engagement on a static site without analytics is measured through form submissions and their content. Each Formspree channel tells a different engagement story.

### Contact Form Subject Distribution = Engagement Map

```
Weekly triage — count by subject:

resource:     ████████████  12  → Users engaging deeply with directory
feedback:     ████████       8  → Users care enough to report issues
partnership:  ███             3  → External organizations finding the site
story:        ██              2  → Community building momentum
general:      █████           5  → Mixed — review individual messages
other:        █               1  → Re-categorize manually
```

**Triage rule:** Track subject distribution week over week. Shifts indicate changing engagement patterns:

- `resource` rising → directory is the primary value driver, invest in scraper coverage
- `feedback` rising → users are hitting friction, prioritize UX fixes
- `partnership` rising → the site has visibility, evaluate partnership page
- `story` rising → community is engaged, prioritize blog publishing workflow

### DO: Segment Resource Submissions by Category

```python
# Quick triage script — group Formspree export by category
import json
from collections import Counter

with open('formspree_export.json') as f:
    submissions = json.load(f)

categories = Counter(s.get('category', 'unknown') for s in submissions)
for cat, count in categories.most_common():
    print(f"{cat}: {count}")
```

The most-requested categories reveal where the resource directory has gaps. Cross-reference against existing data:

```bash
# Count resources per category in existing data
python -c "
import json, os, glob
from collections import Counter
cats = Counter()
for f in glob.glob('src/_data/resources/**/*.json', recursive=True):
    for r in json.load(open(f)):
        for c in r.get('category', []):
            cats[c] += 1
for c, n in cats.most_common(10):
    print(f'{c}: {n}')
"
```

If users request "respite-care" but the directory has 2 entries → high-priority gap.

---

## Resource Directory Engagement Patterns

### URL Param Pre-Linking as Engagement Driver

Educational pages link to the resource directory with pre-set filters. Track which links generate the most engagement:

```nunjucks
{# src/pages/therapy-guide/index.njk — links to filtered resources #}
<a href="/resources/?category=therapy" class="btn-primary no-underline">
  Find Therapy Providers
</a>

{# src/pages/school-iep/index.njk #}
<a href="/resources/?category=legal" class="btn-primary no-underline">
  Find IEP Advocates & Law Firms
</a>

{# src/pages/adaptive-equipment.njk #}
<a href="/resources/?category=equipment" class="btn-primary no-underline">
  Browse Equipment Resources
</a>
```

`src/js/resourceFilter.js` reads these params and applies filters on page load:

```javascript
// src/js/resourceFilter.js — URL param handling
var params = new URLSearchParams(window.location.search);
var locationParam = params.get('location');
var categoryParam = params.get('category');
if (locationParam) locationFilter.value = locationParam;
if (categoryParam) categoryFilter.value = categoryParam;
```

**Triage insight:** If feedback says "I couldn't find therapy resources," check whether the therapy guide's CTA actually links to `/resources/?category=therapy`. A missing or broken URL param means the cross-link is broken.

### DON'T: Treat Zero-Result Feedback as Low Priority

```
// User feedback: "I searched for 'ABA therapy' and nothing came up"
// BAD triage: close as "working as designed"
// GOOD triage: check if any resources have ABA in name/description/tags
```

**Why this matters:** Zero results on a caregiver search is not a minor UX issue — it's a failed mission. That caregiver needed help and left empty-handed.

**The fix:** Search existing data for near-matches:

```bash
# Check if ABA exists in any resource data
python -c "
import json, glob
for f in glob.glob('src/_data/resources/**/*.json', recursive=True):
    for r in json.load(open(f)):
        if 'aba' in r.get('name','').lower() or 'aba' in r.get('description','').lower():
            print(f\"{r['name']} — {r['location']}\")
"
```

If matches exist but the user couldn't find them → tagging or category issue. If no matches → resource gap, prioritize for scraper coverage.

---

## Newsletter as Adoption Funnel

### Source-Based Newsletter Triage

With `_source` hidden fields on each newsletter form, group signups by origin:

| Source | Interpretation | Action |
|--------|---------------|--------|
| `homepage-cta` | Visitor engaged with hero, wants updates | Primary funnel — maintain |
| `footer` | Visitor scrolled to bottom | Content didn't satisfy — review page |
| `blog-empty-state` | Wants blog content | Prioritize blog publishing |
| `podcast-empty-state` | Wants podcast content | Prioritize podcast launch |
| `services-gig-notify` | Gig platform interest | Track demand for Phase 3 launch |

### DO: Compare Newsletter Sources to Contact Volume

If newsletter signups from `homepage-cta` are high but contact form submissions are low, visitors are interested but not ready to engage deeply. This suggests:
- The homepage activates interest but doesn't convert to action
- Resource directory may need more prominent placement
- Consider adding a "Browse Resources" CTA alongside newsletter signup

---

## Cross-Section Linking from Feedback

### Feedback Reveals Missing Connections

```
// User feedback: "I found the IEP guide helpful but couldn't find
// a local advocate in Virginia"

// Triage action: Verify cross-link exists
// 1. Check school-iep page for resource directory link
// 2. Check if legal/advocacy resources exist for Virginia
// 3. If link exists but resources don't → add resources
// 4. If resources exist but link missing → add cross-link
```

### DO: Build a Cross-Link Audit from Feedback

```nunjucks
{# Pattern: every educational page MUST end with a filtered resource link #}

{# therapy-guide → /resources/?category=therapy #}
{# school-iep → /resources/?category=legal #}
{# adaptive-equipment → /resources/?category=equipment #}
{# services → /contact/?subject=partnership #}
```

When feedback mentions "I read about X but couldn't find providers" — the cross-link is missing or broken. See the **orchestrating-feature-adoption** skill for cross-section linking patterns.

---

## WARNING: Anti-Patterns

### WARNING: Ignoring Feedback Volume in Favor of Feature Requests

**The Problem:** Building new features (gig platform, shop) while ignoring high-volume resource gap feedback.

**Why This Breaks:**
1. Resource directory is the core value prop — if it's empty for a user's location, nothing else matters
2. A caregiver in Florida who finds zero resources won't care about a coaching service
3. Feature investments that don't address the primary use case waste development time

**The Fix:** Always fill resource gaps before building new features. Three resource submissions for the same location = higher priority than any feature request.

### WARNING: Batch-Processing Feedback Monthly

**The Problem:** Reviewing Formspree submissions once a month.

**Why This Breaks:** A broken resource link reported on day 1 stays broken for 30 days. Every visitor who clicks that link during that time has a degraded experience.

**The Fix:** Check Formspree dashboard weekly at minimum. Process P0 items (broken functionality) within 24 hours.

---

## Engagement Triage Checklist

Copy this checklist and track progress:

- [ ] Export Formspree data and group contact subjects by count
- [ ] Compare subject distribution to last week
- [ ] Group resource submissions by category — identify gaps
- [ ] Cross-reference requested categories against existing data counts
- [ ] Check all cross-links from educational pages to resource directory
- [ ] Review "feedback" subject submissions for UX friction reports
- [ ] Compare newsletter source distribution for funnel health
- [ ] Prioritize resource gaps over feature requests
- [ ] Run `npm run build` after any data changes
