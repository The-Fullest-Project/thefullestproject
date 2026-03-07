# Activation & Onboarding — Triage Perspective

## Contents
- Feedback Signals That Indicate Onboarding Gaps
- Mapping Drop-Off Points from Feedback
- Resource Directory Activation Signals
- Form Abandonment Indicators
- WARNING: Anti-Patterns
- Onboarding Triage Checklist

---

## Feedback Signals That Indicate Onboarding Gaps

On a static site with no user accounts, "activation" means a visitor completed a meaningful action: filtered resources, subscribed to newsletter, submitted a resource, or contacted the team. Feedback that reveals confusion about what the site offers is an onboarding gap signal.

### Contact Subject "General Inquiry" as Confusion Signal

```nunjucks
{# src/pages/contact.njk — "general" subject often means "I don't know where to look" #}
<option value="general">General Inquiry</option>
```

**Triage rule:** If 40%+ of contact submissions use "general," the homepage is not guiding visitors to the right entry point. Review the "How We Can Help" card grid on `src/pages/index.njk`.

### DO: Add Referrer Tracking to Identify Lost Visitors

```html
{# src/pages/contact.njk — add inside the <form> element #}
<input type="hidden" name="_referrer" id="contact-referrer">
<script>
  document.getElementById('contact-referrer').value = document.referrer || 'direct';
</script>
```

When triage shows "general" submissions all come from the homepage, the homepage CTAs need work. When they come from `/resources/`, the filter UI needs guidance. See the **designing-onboarding-paths** skill for implementing orientation banners.

### DON'T: Assume All "General" Feedback Is Low Priority

```
// BAD triage logic
if (subject === 'general') → archive, no action

// GOOD triage logic
if (subject === 'general') → read message, check for:
  - "Where do I find..." → onboarding gap
  - "How do I..." → missing in-app guidance
  - "Is there..." → resource gap
  - "Thank you" → positive signal, no action
```

**Why this matters:** "General" is the catch-all bucket. Caregivers searching for specific disability resources may not know which category fits. Dismissing these messages means missing the most actionable onboarding feedback.

---

## Mapping Drop-Off Points from Feedback

### Newsletter Source Tracking Reveals Activation Funnel

The newsletter form appears in three locations. Adding a hidden source field creates a basic funnel:

```html
{# src/pages/index.njk — homepage newsletter #}
<input type="hidden" name="_source" value="homepage-cta">

{# src/_includes/components/footer.njk — footer newsletter #}
<input type="hidden" name="_source" value="footer">

{# src/pages/services/index.njk — gig platform interest #}
<input type="hidden" name="_source" value="services-gig-notify">
```

**Triage interpretation:**

| High source | Signal | Action |
|-------------|--------|--------|
| `homepage-cta` | Visitors engage early, good activation | Monitor, no change needed |
| `footer` | Visitors reach page bottom, didn't find what they needed | Review content above footer |
| `services-gig-notify` | High demand for gig platform | Prioritize gig platform in roadmap |

### DO: Track Which Empty States Convert

```html
{# src/pages/blog.njk — empty state newsletter #}
<input type="hidden" name="_source" value="blog-empty-state">

{# src/pages/podcast.njk — empty state newsletter #}
<input type="hidden" name="_source" value="podcast-empty-state">
```

If `blog-empty-state` signups are high, visitors want blog content — prioritize publishing. If zero, the empty state copy may not communicate enough value. See the **crafting-page-messaging** skill for revising empty state copy.

---

## Resource Directory Activation Signals

### Resource Submissions as Feature Requests

Each submission to `/submit-resource/` tells you which locations and categories have gaps:

```json
// Formspree export — group submissions by location and category
{
  "resource_name": "Fairfax Adaptive Swim",
  "location": "Virginia",
  "category": "recreation",
  "_submitted": "2026-02-15"
}
```

**Triage rule:** Three or more submissions for the same state that has no JSON file yet → create a new state file:

```bash
# Create new state resource file
echo "[]" > "src/_data/resources/states/NEW_STATE.json"
```

Then add the verified resources. See the **eleventy** skill for how `.eleventy.js` auto-discovers state files.

### DON'T: Add Submitted Resources Without Verification

```json
// BAD — pasting unverified submission directly into resource data
{
  "name": "Some Resource",
  "website": "http://maybe-broken-link.com",
  "source": "community-submission"
}
```

**Why this breaks:** The resource directory's credibility depends on working links and accurate data. Caregivers rely on this information for their family members. A dead link or incorrect phone number wastes a caregiver's limited time and erodes trust.

**The fix:** Always verify before adding:

```bash
# Verify the website responds
python -c "import httpx; print(httpx.head('https://submitted-url.org', timeout=10).status_code)"
```

---

## Form Abandonment Indicators

Formspree does not report abandoned form submissions. Indirect signals:

1. **High page views (if analytics added) + low submission rate** → form is too long or confusing
2. **Submissions with only required fields filled** → optional fields feel burdensome
3. **Multiple submissions from same email** → user uncertain if first submission worked

### DO: Add a Success Redirect

```html
{# src/pages/contact.njk — add hidden Formspree _next field #}
<input type="hidden" name="_next" value="https://thefullestproject.org/thank-you/">
```

Create a thank-you page confirming submission received. See the **designing-onboarding-paths** skill for thank-you page patterns.

### DON'T: Rely on Formspree's Default Redirect

**Why this breaks:** Formspree's default redirects to a generic Formspree-branded page. Users lose context of your site. Caregivers may think their submission failed and resubmit.

---

## WARNING: Anti-Patterns

### WARNING: Treating All Feedback Equally

**The Problem:** Processing every submission in arrival order without categorization.

**Why This Breaks:**
1. A broken resource link reported via "feedback" subject degrades trust every hour it stays broken
2. A partnership inquiry can wait days
3. A resource suggestion may become stale if the resource's availability changes

**The Fix:** Apply urgency tiers during triage:

| Tier | Criteria | Response Time |
|------|----------|---------------|
| P0 | Broken site functionality, incorrect info | Same day |
| P1 | Resource suggestion with complete data | Within 1 week |
| P2 | Story submissions, partnership inquiries | Within 2 weeks |
| P3 | General questions, feature suggestions | Batch monthly |

---

## Onboarding Triage Checklist

Copy this checklist and track progress:

- [ ] Add `_referrer` hidden field to contact form
- [ ] Add `_source` hidden fields to all 3 newsletter placements
- [ ] Add `_source` fields to empty state newsletter forms (blog, podcast)
- [ ] Create thank-you page at `src/pages/thank-you.njk`
- [ ] Add Formspree `_next` redirect to all forms
- [ ] Review last 30 days of "general" contact submissions for onboarding gaps
- [ ] Group resource submissions by location to find expansion candidates
- [ ] Run `npm run build` to verify all template changes
