# Feedback & Insights Reference

## Contents
- Current Feedback Channels
- Capturing Guidance Effectiveness Signals
- Form-Based Feedback Patterns
- Resource Quality Signals
- WARNING: Anti-Patterns
- Feedback Checklist

---

## Current Feedback Channels

The site has three Formspree forms defined in `src/_data/site.json` under `formspree`:

| Form | Location | Captures |
|------|----------|----------|
| Contact | `/contact/` | Name, email, subject (6 types), message |
| Submit Resource | `/submit-resource/` | Resource name, website, location, category, description, contact info, submitter email |
| Newsletter | Homepage, footer | Email only |

The contact form's subject dropdown already captures intent:

```html
{# src/pages/contact.njk #}
<option value="general">General Question</option>
<option value="resource-suggestion">Resource Suggestion</option>
<option value="partnership">Partnership Inquiry</option>
<option value="share-story">Share a Story</option>
<option value="feedback">Feedback</option>
<option value="other">Other</option>
```

This is the only qualitative feedback mechanism. There are no in-page feedback widgets, no ratings, no "Was this helpful?" prompts.

---

## Capturing Guidance Effectiveness Signals

To know whether tooltips, help text, and guidance elements are working, measure indirect signals since you can't A/B test with statistical rigor on a low-traffic static site.

### Signal 1: Contact Form Subject Distribution

If "Resource Suggestion" and "Feedback" subjects increase after adding guidance, guidance is driving engagement. Add a hidden field to track which page referred the user:

```html
{# src/pages/contact.njk — add inside form #}
<input type="hidden" name="_referrer" id="contact-referrer">

<script>
  document.getElementById('contact-referrer').value = document.referrer;
</script>
```

### Signal 2: Resource Submission Volume

Track whether inline guidance on the submit form (field help text, examples, placeholders) increases submission quality. Add a hidden field:

```html
{# src/pages/submit-resource.njk — inside form #}
<input type="hidden" name="_guidance_version" value="v1">
```

When you update help text, change the version. Compare Formspree submissions before/after.

### Signal 3: Newsletter Signup Source

```html
{# Homepage newsletter #}
<input type="hidden" name="_source" value="homepage-hero">

{# Footer newsletter #}
<input type="hidden" name="_source" value="footer">

{# Podcast empty state newsletter #}
<input type="hidden" name="_source" value="podcast-prelaunch">

{# Resource directory bottom #}
<input type="hidden" name="_source" value="resources-cta">
```

Formspree captures these hidden fields in the submission data, giving you per-placement conversion data without any analytics tool.

---

## Form-Based Feedback Patterns

### DO: Add "Was This Helpful?" to Educational Pages

```html
{# Bottom of therapy-guide, school-iep, adaptive-equipment #}
<div class="card p-6 mt-8 text-center"
  style="background-color: var(--color-warm-light);">
  <p class="font-semibold mb-3" style="color: var(--color-primary);">
    Was this guide helpful?
  </p>
  <div class="flex gap-3 justify-center">
    <a href="/contact/?subject=feedback&helpful=yes&page={{ page.url | urlencode }}"
      class="btn-primary no-underline text-sm">
      Yes, very helpful
    </a>
    <a href="/contact/?subject=feedback&helpful=no&page={{ page.url | urlencode }}"
      class="btn-secondary no-underline text-sm">
      Could be better
    </a>
  </div>
</div>
```

This routes to the existing contact form with the subject pre-selected to "Feedback." No new infrastructure needed. The URL params encode which page and sentiment.

### DON'T: Build a Custom Rating System

```javascript
// BAD — custom star rating with localStorage persistence
class StarRating extends HTMLElement {
  // 80 lines of custom element code...
}
```

**Why this breaks:** A custom rating system requires:
- Persistence (localStorage or backend)
- Aggregation logic
- Display of aggregated ratings
- Spam prevention

This is massive overkill for a static site. Route to the existing contact form instead.

### Pre-Populating Contact Form from URL Params

The contact form can accept URL params to pre-select the subject. Add this JS to the contact page:

```javascript
// Add to bottom of src/pages/contact.njk or create src/js/contactPrefill.js
document.addEventListener('DOMContentLoaded', function() {
  var params = new URLSearchParams(window.location.search);
  var subject = params.get('subject');
  if (subject) {
    var select = document.getElementById('contact-subject');
    if (select) select.value = subject;
  }
  var page = params.get('page');
  if (page) {
    var msg = document.getElementById('contact-message');
    if (msg && !msg.value) {
      msg.value = 'Feedback about: ' + decodeURIComponent(page) + '\n\n';
      msg.focus();
    }
  }
});
```

---

## Resource Quality Signals

### DO: Track Broken Resource Links

Resources link to external websites that may go down. Add a periodic link check:

```python
# scrapers/sources/link_checker.py
import httpx
import json
import os

def check_links():
    """Check all resource websites for broken links."""
    data_dir = os.path.join('src', '_data', 'resources')
    broken = []

    for filename in os.listdir(data_dir):
        if not filename.endswith('.json'):
            continue
        with open(os.path.join(data_dir, filename)) as f:
            resources = json.load(f)

        for resource in resources:
            url = resource.get('website', '')
            if not url:
                continue
            try:
                resp = httpx.head(url, timeout=10, follow_redirects=True)
                if resp.status_code >= 400:
                    broken.append({
                        'name': resource['name'],
                        'url': url,
                        'status': resp.status_code
                    })
            except httpx.RequestError:
                broken.append({
                    'name': resource['name'],
                    'url': url,
                    'status': 'unreachable'
                })

    return broken
```

Run this alongside the weekly scrape in GitHub Actions. See the **python** skill for scraper conventions.

### DO: Let Users Report Issues

```html
{# src/pages/resources.njk — add inside each resource card, after website link #}
<a href="/contact/?subject=resource-suggestion&page={{ resource.name | urlencode }}"
  class="text-xs mt-2 block no-underline" style="color: var(--color-text-light);">
  Report an issue with this listing
</a>
```

### DON'T: Add Upvote/Downvote to Resource Cards

```html
<!-- BAD — requires backend state -->
<button onclick="upvote('{{ resource.name }}')">+1</button>
<span>{{ resource.votes }}</span>
```

**Why this breaks:** Voting requires a database, authentication (or spam prevention), and real-time aggregation. None of this exists in a static site architecture. Use the contact form to collect qualitative feedback instead.

---

## WARNING: Anti-Patterns

### WARNING: Collecting PII in Feedback Without Privacy Notice

**The Problem:**

```html
<!-- BAD — collecting email in feedback widget without explanation -->
<form action="formspree-endpoint" method="POST">
  <input type="email" name="email" required placeholder="Your email">
  <textarea name="feedback" required></textarea>
  <button type="submit">Send Feedback</button>
</form>
```

**Why This Breaks:**
1. No indication of how email will be used
2. No privacy policy link
3. Caregivers may be providing feedback about sensitive disability-related topics
4. Email field marked `required` when it shouldn't be for anonymous feedback

**The Fix:**
Make email optional. Add a privacy note. Link to privacy policy:

```html
<p class="text-xs mt-2" style="color: var(--color-text-light);">
  Your email is optional and only used if we need to follow up.
  See our <a href="/privacy/" style="color: var(--color-accent);">privacy policy</a>.
</p>
<input type="email" name="email" class="form-input" placeholder="Optional email">
```

### WARNING: Auto-Submitting Feedback Without User Action

```javascript
// BAD — sends data without explicit user consent
window.addEventListener('beforeunload', () => {
  navigator.sendBeacon('/feedback', JSON.stringify({
    page: location.pathname,
    timeSpent: Date.now() - startTime
  }));
});
```

**Why this breaks:** Silently collecting browsing behavior on a healthcare-adjacent site erodes trust. All data collection must be triggered by explicit user action (clicking a button, submitting a form).

---

## Feedback Checklist

Copy this checklist and track progress:

- [ ] Add hidden `_referrer` field to contact form
- [ ] Add hidden `_guidance_version` field to submit-resource form
- [ ] Add hidden `_source` fields to all newsletter forms
- [ ] Add "Was this helpful?" CTA to therapy guide, equipment, and IEP pages
- [ ] Add contact form URL param pre-fill JS
- [ ] Add "Report an issue" link to resource cards
- [ ] Create link checker script in `scrapers/sources/`
- [ ] Add link checker to weekly scrape workflow
- [ ] Ensure all feedback forms have privacy note and optional email
- [ ] Verify no PII is collected without user action
- [ ] Run `npm run build` to verify templates

See the **triaging-user-feedback** skill for processing feedback once collected.
