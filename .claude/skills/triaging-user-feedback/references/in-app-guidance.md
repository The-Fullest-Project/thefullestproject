# In-App Guidance — Triage Perspective

## Contents
- Feedback That Reveals Guidance Gaps
- Form UX Feedback Patterns
- Resource Filter Confusion Signals
- Educational Content Feedback
- WARNING: Anti-Patterns
- Guidance Improvement Checklist

---

## Feedback That Reveals Guidance Gaps

Feedback about confusion, missing information, or difficulty navigating the site indicates in-app guidance is insufficient. The contact form's "feedback" and "general" subjects are the primary signals.

### Classifying Guidance-Related Feedback

```
// Feedback message analysis — categorize by guidance gap type

"I didn't know you had resources for my state"
→ Gap: Resource directory visibility / filter awareness

"What does 'Early Intervention (0-3)' mean?"
→ Gap: Missing inline definition for category label

"I filled out the form but I'm not sure it went through"
→ Gap: Missing form submission confirmation

"How do I add a resource I know about?"
→ Gap: Submit-resource page not discoverable enough

"The therapy guide was great but I wanted more detail on ABA"
→ Gap: Content depth insufficient, not a guidance issue
```

**Triage rule:** If the answer exists on the site but the user couldn't find it, that's a guidance problem. If the answer doesn't exist, that's a content problem. Different backlog priorities.

---

## Form UX Feedback Patterns

### Submit-Resource Form Field Confusion

The submit-resource form at `src/pages/submit-resource.njk` has 7 fields. Feedback signals which fields cause friction:

```nunjucks
{# src/pages/submit-resource.njk — fields that commonly generate confusion #}

{# Location dropdown has 50+ options — users may not know "National" is an option #}
<select name="location" class="form-input" required>
  <option value="">Select location...</option>
  <option value="National">National (Available Everywhere)</option>
  {# ...50 state options... #}
</select>

{# Category dropdown has 27+ options — overwhelming for first-time submitters #}
<select name="category" class="form-input" required>
  <option value="">Select a category...</option>
  <option value="therapy">Therapy Providers</option>
  {# ...26 more options... #}
</select>
```

**Feedback signals and fixes:**

| Feedback | Signal | Fix |
|----------|--------|-----|
| "I didn't know which category to pick" | Too many choices without context | Add a short description per option or group with `<optgroup>` |
| "Is this for professionals or parents?" | Form purpose unclear | Add intro text clarifying who should submit |
| "I wasn't sure if it went through" | No confirmation | Add Formspree `_next` redirect to thank-you page |

### DO: Add Help Text Below Confusing Fields

```html
{# src/pages/submit-resource.njk — add below category select #}
<p class="text-xs mt-1" style="color: var(--color-text-light);">
  Not sure which category? Choose the closest match — we'll adjust if needed.
</p>
```

See the **designing-inapp-guidance** skill for tooltip and inline help patterns.

### DON'T: Add a "Help" Page to Explain Forms

```nunjucks
{# BAD — separate help page for form instructions #}
---
layout: layouts/page.njk
title: How to Submit a Resource
permalink: /help/submit-resource/
---
```

**Why this breaks:** Users won't navigate to a separate help page. Guidance must be inline, adjacent to the field that causes confusion. A help page adds maintenance burden without solving the problem.

---

## Resource Filter Confusion Signals

### Feedback About Search Not Working

```javascript
// src/js/resourceFilter.js — search matches name and description only
var name = card.getAttribute('data-name').toLowerCase();
var description = card.getAttribute('data-description').toLowerCase();
var matchesSearch = name.includes(searchTerm) || description.includes(searchTerm);
```

If feedback says "I searched for 'autism' but nothing came up," check whether any resources have "autism" in their name or description fields. The search does NOT check `tags`, `disabilityTypes`, or `category` fields.

**Triage decision:**
- If resources exist with "autism" in tags but not name/description → expand search scope in `resourceFilter.js`. See the **javascript** skill.
- If no resources match → resource data gap, not a search bug.

### DO: Track Zero-Result Searches via Feedback

When users report "I searched for X and found nothing," maintain a list:

```json
// Triage tracking — zero-result search terms from feedback
[
  { "term": "autism", "date": "2026-03-01", "action": "expand search to tags" },
  { "term": "wheelchair rental", "date": "2026-03-03", "action": "add equipment resources" },
  { "term": "respite Fairfax", "date": "2026-03-05", "action": "add nova respite resources" }
]
```

Three zero-result reports for similar terms = P1 priority.

### DON'T: Add Search Suggestions Without Data

```javascript
// BAD — autocomplete that suggests terms not in the dataset
var suggestions = ['autism', 'wheelchair', 'speech therapy', 'ABA'];
```

**Why this breaks:** Suggesting a term that returns zero results is worse than no suggestion. Only suggest terms that match existing resources. See the **javascript** skill for filter implementation patterns.

---

## Educational Content Feedback

### Therapy Guide Depth Signals

```
// Feedback: "The therapy guide mentions ABA but doesn't explain
// what a session looks like or how to find a good provider"

// Triage: This is a content depth request, not a guidance gap
// Route to backlog: "Expand ABA section in therapy guide"
// NOT a quick win — requires research and content creation
```

The therapy guide at `src/pages/therapy-guide/index.njk` covers 8 therapy types in a grid layout. Each card has a definition and "When It's Beneficial" list. Feedback asking for more depth is a content request.

### DO: Use Feedback to Prioritize Content Expansion

```
// Therapy guide feedback triage
// Group by therapy type mentioned:

ABA:            5 mentions → Highest demand, expand first
Speech therapy: 3 mentions → Second priority
OT:             2 mentions → Third priority
Hippotherapy:   0 mentions → No demand signal
```

### School & IEP Guide Feedback

The IEP guide at `src/pages/school-iep/index.njk` covers rights, processes, and advocacy tips. Common feedback types:

| Feedback | Category | Action |
|----------|----------|--------|
| "This was exactly what I needed" | Positive | No action, note for testimonial |
| "My state has different rules" | Content gap | Add state-specific sections |
| "How do I write a letter requesting evaluation?" | Template request | Backlog: add downloadable templates |
| "What if the school refuses?" | Depth request | Expand advocacy tips section |

---

## WARNING: Anti-Patterns

### WARNING: Adding Guidance That Creates More Confusion

**The Problem:**

```html
<!-- BAD — tooltip on every field overwhelms the user -->
<label>Resource Name
  <span class="tooltip" data-tip="Enter the full legal name of the organization as it appears on their website, including any abbreviations in parentheses">?</span>
</label>
```

**Why This Breaks:**
1. Tooltips on every field make the form feel intimidating
2. Long tooltip text is harder to read than inline help text
3. Caregivers are time-constrained — excessive guidance slows them down

**The Fix:** Only add guidance where feedback indicates confusion. Start with the fields most mentioned in feedback, not every field.

### WARNING: Fixing Guidance Before Fixing Data

**The Problem:** Adding inline help, tooltips, and explanatory text to the resource directory while the directory has incomplete data.

**Why This Breaks:** No amount of guidance fixes an empty result set. If a caregiver in Texas searches for respite care and finds zero results, a tooltip explaining the filter won't help.

**The Fix:** Always prioritize filling resource data gaps over adding UI guidance. Data problems > guidance problems.

---

## Guidance Improvement Checklist

Copy this checklist and track progress:

- [ ] Categorize last 30 days of "feedback" submissions by gap type
- [ ] Identify top 3 form fields causing confusion
- [ ] Add inline help text to most-confused fields only
- [ ] Check resource search scope covers tags and disabilityTypes
- [ ] Log zero-result search terms from feedback
- [ ] Group therapy guide feedback by therapy type
- [ ] Verify submit-resource form has a success redirect
- [ ] Confirm all educational pages have cross-links to resource directory
- [ ] Run `npm run build` to verify template changes
