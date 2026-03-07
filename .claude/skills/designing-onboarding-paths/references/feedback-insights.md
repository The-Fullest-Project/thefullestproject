# Feedback & Insights Reference

## Contents
- Current Feedback Channels
- Feedback Collection Patterns
- WARNING: No Feedback Visibility
- Resource Submission as Feedback Signal
- Contact Form Triage
- User Research Without Accounts

## Current Feedback Channels

The site has two explicit feedback paths today:

| Channel | Location | Form ID | Data Goes To |
|---------|----------|---------|-------------|
| Contact form | `src/pages/contact.njk` | `site.formspree.contact` | Formspree inbox |
| Submit resource | `src/pages/submit-resource.njk` | `site.formspree.submitResource` | Formspree inbox |

The contact form has a "Subject" dropdown with these options: General Inquiry, Resource Suggestion, Partnership Opportunity, Share My Story, Website Feedback, Other. This is the only structured feedback taxonomy.

## Feedback Collection Patterns

### DO: Use the contact form subject field for routing

```html
<!-- Existing pattern in src/pages/contact.njk -->
<select name="subject" id="subject" required class="filter-select">
  <option value="">Select a subject</option>
  <option value="General Inquiry">General Inquiry</option>
  <option value="Resource Suggestion">Resource Suggestion</option>
  <option value="Partnership Opportunity">Partnership Opportunity</option>
  <option value="Share My Story">Share My Story</option>
  <option value="Website Feedback">Website Feedback</option>
  <option value="Other">Other</option>
</select>
```

This is well-structured. Formspree delivers these as emails, and the subject line acts as a triage label.

### DO: Add a lightweight feedback prompt to the resource page

```html
<!-- Add to bottom of src/pages/resources.njk, above the submit CTA -->
<div class="card p-6 mt-8 bg-blue-50 text-center">
  <p class="font-semibold">Did you find what you were looking for?</p>
  <div class="mt-3 space-x-3">
    <a href="/contact/?subject=Website+Feedback" class="btn-primary text-sm">
      Yes, but I have feedback
    </a>
    <a href="/submit-resource/" class="btn-secondary text-sm">
      No, suggest a resource
    </a>
  </div>
</div>
```

This captures two signals: satisfied visitors with improvement ideas, and visitors who didn't find what they needed.

### DON'T: Add a popup feedback widget

Popups interrupt task-focused caregivers. Inline feedback prompts at natural stopping points (bottom of resources page, after reading a blog post) respect the visitor's flow.

### DO: Pre-fill the contact form via URL params

```javascript
// Add to contact page — read URL params and pre-fill fields
const params = new URLSearchParams(window.location.search);
const subjectField = document.getElementById('subject');
if (params.get('subject') && subjectField) {
  subjectField.value = params.get('subject');
}
```

This lets you link to the contact form from anywhere with context:

```html
<a href="/contact/?subject=Website+Feedback">Share Feedback</a>
<a href="/contact/?subject=Resource+Suggestion">Suggest a Resource</a>
```

## WARNING: No Feedback Visibility

**The Problem:** All feedback goes to Formspree email. There is no dashboard, no categorization, no trend tracking. If 20 people request the same resource category, that pattern is invisible unless someone manually reads every email.

**Why This Breaks:** The site can't adapt to user needs. The scraper pipeline adds resources based on what's available to scrape, not what visitors are looking for. Feedback that could drive the roadmap disappears into an email inbox.

**The Fix (Low-Effort):**

1. Create a shared spreadsheet (Google Sheets) to log feedback manually
2. Add columns: Date, Subject, Category, Summary, Action Taken
3. Review weekly alongside scraper runs (they already happen on Sunday)

**The Fix (Medium-Effort):**

Use Formspree's submission API to export feedback programmatically. See the **python** skill for scripting this into the existing scraper pipeline:

```python
# scrapers/sources/feedback_export.py — pull Formspree submissions
import httpx

def export_feedback():
    """Export recent Formspree contact form submissions."""
    api_key = os.environ.get('FORMSPREE_API_KEY')
    form_id = 'your_form_id'
    response = httpx.get(
        f'https://formspree.io/api/0/forms/{form_id}/submissions',
        headers={'Authorization': f'Bearer {api_key}'}
    )
    return response.json()
```

Note: Formspree API access requires a paid plan.

## Resource Submission as Feedback Signal

Every resource submission tells you: "A caregiver looked for this and couldn't find it." This is the strongest product signal the site generates.

### DO: Track submission categories to identify gaps

```njk
{# Existing submit-resource form — the category field is a gap indicator #}
<select name="category" required class="filter-select">
  <option value="">Select a category</option>
  <option value="therapy">Therapy & Rehabilitation</option>
  <option value="advocacy">Advocacy & Legal</option>
  {# ... 27 more categories #}
</select>
```

If 60% of submissions are for "therapy" in Virginia, that means the therapy scraper for Virginia is underperforming. Feed this back into the scraper pipeline. See the **python** skill for scraper patterns.

### DO: Add a "what were you looking for?" field to the filter empty state

```html
<!-- In the 0-results empty state on resources page -->
<div id="no-results" class="hidden text-center py-12">
  <p class="text-xl font-semibold text-gray-600">No resources match your filters</p>
  <p class="mt-2">Can't find what you need?</p>
  <a href="/submit-resource/" class="btn-primary mt-4">Tell Us What You're Looking For</a>
</div>
```

This turns a frustrating moment into a feedback opportunity.

## Contact Form Triage

### DO: Map subject lines to action owners

| Subject | Action | Priority |
|---------|--------|----------|
| Resource Suggestion | Add to scraper backlog or manual entry | High — drives core value |
| Website Feedback | Log in feedback spreadsheet, batch fixes | Medium |
| Share My Story | Route to blog content pipeline | Medium |
| Partnership Opportunity | Founder review | Low frequency, high value |
| General Inquiry | Respond within 48 hours | Standard |

### DON'T: Treat all feedback equally

Resource suggestions and "can't find what I need" signals directly impact activation. Prioritize them over general inquiries. See the **triaging-user-feedback** skill for triage frameworks.

## User Research Without Accounts

This site has no login, no user profiles, no session tracking. User research must happen through other channels:

### DO: Use the newsletter list for survey distribution

```html
<!-- Add to a newsletter email (via Formspree or manual send) -->
<p>Help us improve! Take our 2-minute survey:</p>
<a href="https://forms.google.com/your-survey-id">Share Your Experience</a>
```

### DO: Add a "How did you find us?" field to the contact form

```html
<select name="referral" class="filter-select">
  <option value="">How did you find us?</option>
  <option value="search">Google/Search Engine</option>
  <option value="social">Social Media</option>
  <option value="friend">Friend/Family</option>
  <option value="provider">Healthcare Provider</option>
  <option value="school">School/Teacher</option>
  <option value="other">Other</option>
</select>
```

This tells you where activated visitors come from, which channels to invest in.

### DO: Monitor Formspree for patterns quarterly

Set a calendar reminder to review:
1. Total contact form submissions (volume trend)
2. Subject distribution (what people ask about most)
3. Resource submission categories (where gaps are)
4. Geographic distribution from resource submissions (where to expand)
