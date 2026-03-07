# Feedback & Insights Reference

## Contents
- Feedback Collection Surfaces
- Form Data Flow
- Resource Submission as User Research
- Contact Form Subject Routing
- Anti-Patterns

## Feedback Collection Surfaces

All user feedback flows through Formspree. There are no in-app feedback widgets, no comment systems, no ratings.

| Surface | Form Endpoint | Fields | Insight Type |
|---------|--------------|--------|--------------|
| Contact form | `site.formspree.contact` | name, email, subject, message | Qualitative feedback |
| Resource submission | `site.formspree.submitResource` | resource details + submitter email | Community-sourced data |
| Newsletter (homepage) | `site.formspree.newsletter` | email | Interest signal |
| Newsletter (footer) | `site.formspree.newsletter` | email | Interest signal |
| Gig platform waitlist | `site.formspree.newsletter` | email + hidden `interest=gig-platform` | Feature demand signal |

## Form Data Flow

All forms POST to Formspree endpoints defined in `site.json`:

```njk
{# Every form follows this pattern #}
<form action="https://formspree.io/f/{{ site.formspree.contact }}" method="POST">
  <input type="text" name="name" required>
  <input type="email" name="email" required>
  <button type="submit" class="btn-primary">Send</button>
</form>
```

**DO:** Use Formspree's submission dashboard to review all form data. It stores submissions with timestamps.
**DON'T:** Assume form submissions are reaching you — all three Formspree IDs are currently placeholders.

### WARNING: No Form Success/Error Feedback

**The Problem:** After submitting any form, the user sees no confirmation. Formspree redirects to its own "Thank you" page by default, which breaks the site experience.

```njk
{# src/pages/contact.njk:15 - No success handling #}
<form action="https://formspree.io/f/{{ site.formspree.contact }}" method="POST">
  {# No _next redirect, no AJAX handling, no success message #}
</form>
```

**Why This Breaks:**
1. User submits form and gets redirected to a Formspree-branded page
2. They lose context of the site they were on
3. No way to continue their journey on The Fullest Project

**The Fix:** Add a Formspree `_next` hidden field to redirect back to a thank-you route:

```njk
{# GOOD - Redirect back to the site after submission #}
<form action="https://formspree.io/f/{{ site.formspree.contact }}" method="POST">
  <input type="hidden" name="_next" value="https://thefullestproject.org/contact/?submitted=true">
  {# ...rest of form... #}
</form>
```

Then show a success message conditionally:

```njk
{# GOOD - Check for submission param #}
{% if "submitted" in page.url %}
<div class="card p-6 text-center" style="background-color: var(--color-warm-light);">
  <p class="text-lg font-bold" style="color: var(--color-primary);">Thank you!</p>
  <p>We'll get back to you soon.</p>
</div>
{% endif %}
```

## Resource Submission as User Research

The submit-resource form is the most valuable feedback surface. Each submission tells you:
- **What category of resource is missing** (from the category dropdown)
- **What location needs more coverage** (from the location dropdown)
- **What users think is important** (from the description field)

```njk
{# src/pages/submit-resource.njk:36-68 - Category tells you demand #}
<select id="resource-category" name="category" required class="form-input">
  <option value="">Select category...</option>
  <option value="therapy">Therapy Providers</option>
  {# ...29 categories... #}
  <option value="other">Other</option>
</select>
```

**DO:** Track which categories are most frequently submitted. This tells you where your scraper pipeline has gaps.
**DO:** Review "Other" submissions — they reveal categories you haven't thought of.
**DON'T:** Discard submitter emails. These are your most engaged users — follow up with them.

## Contact Form Subject Routing

The contact form subject dropdown categorizes inbound feedback:

```njk
{# src/pages/contact.njk:26-33 #}
<select id="subject" name="subject" class="form-input">
  <option value="general">General Inquiry</option>
  <option value="resource">Resource Suggestion</option>
  <option value="partnership">Partnership Opportunity</option>
  <option value="story">Share My Story</option>
  <option value="feedback">Website Feedback</option>
  <option value="other">Other</option>
</select>
```

| Subject | What It Tells You |
|---------|-------------------|
| `resource` | User found a gap in the directory |
| `partnership` | Organization wants to collaborate |
| `story` | User wants to share personal experience (blog content source) |
| `feedback` | UX issues, bugs, or feature requests |
| `general` | Catch-all — review for patterns |

**DO:** Set up Formspree email notifications filtered by subject value. Route `partnership` to a different inbox than `feedback`.
**DON'T:** Treat all contact submissions the same. The subject field exists for triage — use it.

## Missing Feedback Mechanisms

| Gap | Impact | Recommendation |
|-----|--------|----------------|
| No resource ratings/reviews | Can't tell which resources are helpful | Add a "Was this helpful?" link per resource card |
| No search analytics | Don't know what users search for and can't find | Track search terms (see **product-analytics** reference) |
| No "Report a Problem" link | Outdated resources stay in the directory | Add a small "Report" link on each resource card |
| No post-visit survey | Don't know if users found what they needed | Add an optional exit-intent feedback prompt |

## Feedback Triage Checklist

Copy this checklist and track progress:
- [ ] Replace Formspree placeholder IDs so forms actually collect data
- [ ] Add `_next` hidden fields to all forms for post-submission redirects
- [ ] Set up Formspree email notifications with subject-based routing
- [ ] Review first 20 resource submissions for category/location patterns
- [ ] Add "Report outdated resource" mechanism to resource cards
- [ ] Track "Other" category submissions for new category ideas
