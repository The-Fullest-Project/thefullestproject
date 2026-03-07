# Product Analytics — Triage Perspective

## Contents
- WARNING: No Analytics Infrastructure
- Formspree as Proxy Analytics
- Deriving Metrics from Feedback Data
- Build-Time Data Audits
- Event Taxonomy for Future Implementation
- Analytics Triage Checklist

---

## WARNING: No Analytics Infrastructure

**Detected:** No analytics library in `package.json`. No tracking scripts in `src/_includes/layouts/base.njk`. No event hooks in `src/js/resourceFilter.js` or `src/js/main.js`.

**Impact:** You cannot measure page views, filter usage, search queries, bounce rates, or conversion funnels. All engagement data comes from Formspree submission volume and content.

### Recommended Solution

Add a privacy-first analytics tool. For a caregiver-focused site handling potentially sensitive searches, avoid Google Analytics.

**Recommended:** Plausible Analytics (privacy-first, no cookies, GDPR-compliant)

```html
{# src/_includes/layouts/base.njk — add before closing </head> #}
<script defer data-domain="thefullestproject.org"
  src="https://plausible.io/js/script.js"></script>
```

**Why this matters for triage:** Without analytics, feedback triage relies entirely on Formspree data. You can't answer:
- Which resource categories are most searched?
- What percentage of visitors use filters vs. scroll?
- Which educational pages have the highest engagement?
- Where do visitors drop off?

These questions directly affect triage priority. See the **instrumenting-product-metrics** skill for full event taxonomy.

---

## Formspree as Proxy Analytics

Until proper analytics is added, Formspree submission data is your only quantitative signal.

### Submission Volume as Engagement Metric

```python
# Triage script — weekly Formspree export analysis
import json
from datetime import datetime, timedelta
from collections import Counter

def analyze_submissions(export_file):
    with open(export_file) as f:
        submissions = json.load(f)

    week_ago = datetime.now() - timedelta(days=7)

    this_week = [s for s in submissions
        if datetime.fromisoformat(s['_date']) > week_ago]

    subjects = Counter(s.get('subject', 'unknown') for s in this_week)
    sources = Counter(s.get('_source', 'unknown') for s in this_week)

    print("=== Subject Distribution ===")
    for subj, count in subjects.most_common():
        print(f"  {subj}: {count}")

    print("\n=== Newsletter Sources ===")
    for src, count in sources.most_common():
        print(f"  {src}: {count}")

    return {'subjects': subjects, 'sources': sources}
```

### Formspree Hidden Fields as Event Stand-Ins

Without analytics events, hidden form fields capture context:

```html
{# Contact form — capture page context #}
<input type="hidden" name="_referrer" id="contact-referrer">
<input type="hidden" name="_page_url" id="contact-page-url">
<script>
  document.getElementById('contact-referrer').value = document.referrer || 'direct';
  document.getElementById('contact-page-url').value = window.location.href;
</script>

{# Newsletter forms — capture placement #}
<input type="hidden" name="_source" value="homepage-cta">

{# Submit-resource form — capture version for A/B comparison #}
<input type="hidden" name="_form_version" value="v1">
```

**These fields appear in every Formspree submission export.** They're the closest thing to analytics events available without adding a tracking tool.

---

## Deriving Metrics from Feedback Data

### Metric: Resource Gap Score

```python
# Calculate which locations have the most unmet demand
import json, glob
from collections import Counter

# Count existing resources per location
existing = Counter()
for f in glob.glob('src/_data/resources/**/*.json', recursive=True):
    for r in json.load(open(f)):
        existing[r.get('location', 'Unknown')] += 1

# Count resource submissions per location (from Formspree export)
requested = Counter()
with open('formspree_resource_submissions.json') as f:
    for s in json.load(f):
        requested[s.get('location', 'Unknown')] += 1

# Gap score = requests / existing (higher = more unmet demand)
print("=== Resource Gap Scores ===")
for loc in requested:
    score = requested[loc] / max(existing.get(loc, 0), 1)
    print(f"  {loc}: {score:.1f} ({requested[loc]} requests, {existing[loc]} existing)")
```

**Triage rule:** Locations with gap score > 2.0 need immediate scraper attention or manual resource addition.

### Metric: Response Quality Score

Track how many resource submissions are complete enough to add directly vs. needing follow-up:

| Field Completeness | Score | Action |
|--------------------|-------|--------|
| Name + location + category + description + website | 5/5 | Add directly after verification |
| Name + location + category + description | 4/5 | Add, mark website as unknown |
| Name + location only | 2/5 | Needs research before adding |
| Name only | 1/5 | Low value — archive unless recognizable |

### DON'T: Invent Metrics You Can't Measure

```
// BAD — guessing engagement from form data alone
"Based on 12 resource submissions this month, we estimate
 10,000 monthly active users with a 0.12% conversion rate"
```

**Why this breaks:** You have zero traffic data. Extrapolating user counts from form submissions is statistical fiction. Report what you know: "12 resource submissions, 8 feedback messages, 25 newsletter signups."

---

## Build-Time Data Audits

Since the site builds from JSON data files, you can audit data quality at build time without analytics.

### Resource Completeness Audit

```python
# scrapers/audit_resources.py — run during triage
import json, glob

issues = []
for filepath in glob.glob('src/_data/resources/**/*.json', recursive=True):
    resources = json.load(open(filepath))
    for r in resources:
        if not r.get('description'):
            issues.append(f"Missing description: {r['name']} ({filepath})")
        if not r.get('website') and not r.get('phone'):
            issues.append(f"No contact info: {r['name']} ({filepath})")
        if not r.get('category'):
            issues.append(f"No category: {r['name']} ({filepath})")

print(f"\n{len(issues)} data quality issues found:")
for issue in issues[:20]:
    print(f"  - {issue}")
```

Run this alongside weekly triage. Incomplete resources generate user complaints — fixing data proactively prevents feedback.

### DO: Add Data Audit to Weekly Scrape Workflow

```yaml
# .github/workflows/scrape.yml — add after scraper step
- name: Audit resource data quality
  run: python scrapers/audit_resources.py
```

See the **github-actions** skill for workflow patterns.

---

## Event Taxonomy for Future Implementation

When analytics is added, track these events aligned with triage categories:

| Event | Maps To | Triage Use |
|-------|---------|-----------|
| `resource_search` | Search query text | Identify zero-result terms |
| `resource_filter_change` | Filter type + value | Measure category/location demand |
| `resource_card_click` | Resource name + URL | Identify most-valued resources |
| `form_submit_success` | Form name + source | Measure conversion by placement |
| `cross_link_click` | Source page + destination | Measure educational → directory flow |
| `newsletter_signup` | Source placement | Compare funnel positions |
| `empty_state_view` | Page with no content | Prioritize content creation |

See the **instrumenting-product-metrics** skill for implementing this taxonomy.

---

## Analytics Triage Checklist

Copy this checklist and track progress:

- [ ] Add `_referrer` and `_page_url` hidden fields to contact form
- [ ] Add `_source` hidden fields to all newsletter forms
- [ ] Add `_form_version` hidden field to submit-resource form
- [ ] Create weekly Formspree export analysis script
- [ ] Calculate resource gap scores by location
- [ ] Create resource data completeness audit script
- [ ] Add audit step to weekly scrape workflow
- [ ] Evaluate Plausible Analytics for privacy-compliant tracking
- [ ] Document event taxonomy for future analytics implementation
