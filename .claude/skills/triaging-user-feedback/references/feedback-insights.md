# Feedback & Insights Reference

## Contents
- Weekly Triage Workflow
- Contact Form Subject Analysis
- Resource Submission Pipeline
- Newsletter Segmentation Insights
- Turning Signals into Actions
- WARNING: Anti-Patterns
- Feedback Processing Checklist

---

## Weekly Triage Workflow

Run this workflow every Monday (or after the weekly scrape completes on Sunday):

1. Export submissions from Formspree dashboard (all 3 forms)
2. Group contact submissions by subject
3. Review resource submissions for completeness
4. Check newsletter sources for funnel shifts
5. Categorize all items as quick win, backlog, or no action
6. Process quick wins immediately
7. Add backlog items to project board
8. Respond to any submissions needing follow-up

### Validate → iterate pattern:

```
1. Export Formspree data
2. Run triage categorization
3. If any P0 items (broken links, incorrect data) → fix immediately
4. Run: npm run build
5. If build fails → fix data issue, repeat step 4
6. Deploy fixes
7. Process remaining items by priority tier
```

---

## Contact Form Subject Analysis

### Subject-to-Action Mapping

```nunjucks
{# src/pages/contact.njk — subject values and their triage routes #}
<select name="subject" class="form-input" required>
  <option value="">Select a subject...</option>
  <option value="general">General Inquiry</option>
  <option value="resource">Resource Suggestion</option>
  <option value="partnership">Partnership Opportunity</option>
  <option value="story">Share Your Story</option>
  <option value="feedback">Website Feedback</option>
  <option value="other">Other</option>
</select>
```

**Detailed routing:**

### "resource" → Resource Pipeline

```
1. Read message for resource name, URL, location
2. Check if resource already exists in data:
   python -c "import json, glob; [print(r['name']) for f in glob.glob('src/_data/resources/**/*.json', recursive=True) for r in json.load(open(f)) if 'SEARCH_TERM' in r['name'].lower()]"
3. If new → verify URL → add to JSON → rebuild
4. If duplicate → archive submission, no action
```

### "feedback" → Bug or Feature Triage

```
Read message → classify:

"Something is broken" / "Link doesn't work" / "Error"
  → P0: Fix immediately

"It would be nice if..." / "Can you add..."
  → P2: Backlog feature request

"I love this site" / "Thank you"
  → No action (save for testimonials)

"I couldn't find..." / "It was confusing"
  → P1: Guidance gap, see in-app-guidance reference
```

### "partnership" → Evaluate and Respond

Partnership inquiries come from organizations wanting to collaborate. Triage by fit:

| Partner Type | Signal | Response |
|-------------|--------|----------|
| Disability non-profit | High alignment | Schedule call within 1 week |
| For-profit therapy provider | Medium alignment | Evaluate, may add as resource |
| Marketing/sales outreach | Low alignment | Polite decline |

### "story" → Blog Content Pipeline

Story submissions feed the blog at `src/blog/`. Processing:

```markdown
<!-- src/blog/community-story-title.md -->
---
layout: layouts/post.njk
title: "Story Title from Submission"
date: 2026-03-06
author: "Submitter Name (with permission)"
category: "Community Story"
excerpt: "First 1-2 sentences of the story"
tags: ["community", "story"]
---

[Edited story content with submitter's approval]
```

**NEVER publish a story without explicit permission from the submitter.** Always respond to confirm they want their story shared publicly.

---

## Resource Submission Pipeline

### Completeness Scoring

The submit-resource form at `src/pages/submit-resource.njk` has 7 fields. Score each submission:

```python
def score_submission(submission):
    """Score resource submission completeness (0-5)."""
    score = 0
    if submission.get('resource_name'): score += 1
    if submission.get('location'): score += 1
    if submission.get('category'): score += 1
    if submission.get('description'): score += 1
    if submission.get('website'): score += 1
    return score

# Triage by score:
# 5/5 → Quick win: verify URL and add
# 3-4 → Research missing fields, then add
# 1-2 → Needs follow-up email to submitter
# 0   → Likely spam, archive
```

### DO: Verify Before Adding

```bash
# Step 1: Check URL is live
python -c "import httpx; r = httpx.get('https://submitted-url.org', timeout=15, follow_redirects=True); print(f'{r.status_code} - {r.url}')"

# Step 2: Check for duplicates by name
python -c "
import json, glob
name = 'Submitted Resource Name'.lower()
for f in glob.glob('src/_data/resources/**/*.json', recursive=True):
    for r in json.load(open(f)):
        if name in r['name'].lower():
            print(f'DUPLICATE: {r[\"name\"]} in {f}')
"

# Step 3: Add to appropriate JSON file
# Step 4: Rebuild and verify
npm run build
```

### DON'T: Auto-Add Submissions Without Verification

```python
# BAD — automatically appending Formspree data to resource JSON
def auto_add_resource(submission):
    filepath = f"src/_data/resources/states/{submission['state']}.json"
    resources = json.load(open(filepath))
    resources.append(submission)  # No verification!
    json.dump(resources, open(filepath, 'w'))
```

**Why this breaks:**
1. URLs may be broken, outdated, or malicious
2. Descriptions may be inaccurate or promotional
3. Duplicate entries degrade directory quality
4. Spam submissions pollute the dataset

Every resource added reflects on the site's credibility with caregivers.

---

## Newsletter Segmentation Insights

### Source Tells Intent

With `_source` hidden fields on each newsletter form placement:

```html
{# src/pages/index.njk #}
<input type="hidden" name="_source" value="homepage-cta">

{# src/_includes/components/footer.njk #}
<input type="hidden" name="_source" value="footer">

{# src/pages/services/index.njk #}
<input type="hidden" name="_source" value="services-gig-notify">

{# src/pages/blog.njk (empty state) #}
<input type="hidden" name="_source" value="blog-empty-state">

{# src/pages/podcast.njk (empty state) #}
<input type="hidden" name="_source" value="podcast-empty-state">
```

**Insight extraction:**

| Source Cluster | Subscriber Intent | Content Strategy |
|---------------|-------------------|-----------------|
| `homepage-cta` | General interest | Broad updates: new resources, blog, features |
| `blog-empty-state` | Wants written content | Prioritize when blog launches |
| `podcast-empty-state` | Wants audio content | Prioritize when podcast launches |
| `services-gig-notify` | Wants gig platform | Phase 3 launch notification list |
| `footer` | Engaged enough to scroll | Retention-focused — they already explored |

---

## Turning Signals into Actions

### The 3-Mention Rule

A single feedback item is an anecdote. Three mentions of the same issue is a signal.

```
1 mention:  "I couldn't find respite care in Virginia"  → Note it
2 mentions: Same theme from different people              → Investigate
3 mentions: Pattern confirmed                             → Act on it
```

### DO: Maintain a Signal Log

```json
// triage-signals.json (keep locally or in project management tool)
[
  {
    "signal": "No respite care resources in Virginia",
    "mentions": 3,
    "first_seen": "2026-02-10",
    "last_seen": "2026-03-01",
    "status": "in_progress",
    "action": "Research and add NOVA respite providers to nova.json"
  },
  {
    "signal": "Therapy guide needs ABA detail",
    "mentions": 5,
    "first_seen": "2026-01-15",
    "last_seen": "2026-03-05",
    "status": "backlog",
    "action": "Expand ABA section in therapy-guide/index.njk"
  }
]
```

### DON'T: Act on Every Single Submission

```
// BAD triage: every submission gets a backlog item
Submission: "Can you add a dark mode?"     → Backlog item created
Submission: "I love the colors"            → No action needed
Submission: "Add Spanish translation"      → Backlog item (valid but one mention)
```

**Why this breaks:** A single suggestion is one person's preference. Without validation from additional users, it's noise. Wait for the signal pattern before investing development time.

---

## WARNING: Anti-Patterns

### WARNING: Processing Feedback Without Reading the Message

**The Problem:** Triaging by subject field alone without reading the full message.

**Why This Breaks:**
1. A "general" subject often contains a specific resource request
2. A "feedback" subject may describe a critical bug
3. A "partnership" subject may be marketing spam

**The Fix:** Read every message. Subject is for initial routing, not final categorization.

### WARNING: Responding to Feedback But Not Acting on It

**The Problem:** Replying "Thanks for your suggestion!" to every resource submission but never adding the resources.

**Why This Breaks:** The submit-resource form (`src/pages/submit-resource.njk`) promises "Help us build the most comprehensive resource directory." If submitted resources never appear, the community loses trust and stops contributing.

**The Fix:** Set a maximum 2-week turnaround for verified resource additions. If you can't verify within 2 weeks, respond to the submitter with a status update.

---

## Feedback Processing Checklist

Copy this checklist and track progress:

- [ ] Export all Formspree submissions since last triage
- [ ] Read every message (not just subject classification)
- [ ] Score resource submissions by completeness (0-5)
- [ ] Verify URLs for submissions scoring 4-5
- [ ] Check for duplicates before adding resources
- [ ] Add verified resources to appropriate JSON files
- [ ] Classify "feedback" messages as bug, feature, or positive
- [ ] Fix P0 bugs immediately, backlog features
- [ ] Update signal log with recurring themes (3+ mentions)
- [ ] Respond to partnership and story submissions within 1 week
- [ ] Review newsletter source distribution for shifts
- [ ] Run `npm run build` after data changes
- [ ] Deploy if any resource data was updated
