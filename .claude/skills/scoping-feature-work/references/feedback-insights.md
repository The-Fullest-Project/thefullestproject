# Feedback & Insights Scoping

## Contents
- Feedback Collection Surfaces
- Scoping Feedback Features
- Processing Community Resource Submissions
- Insight-Driven Scope Prioritization
- Anti-Patterns

## Feedback Collection Surfaces

The project collects feedback through three Formspree-powered forms. Each is a distinct feedback channel.

**Current feedback surfaces:**

| Form | Location | Formspree Key | Captures |
|------|----------|--------------|----------|
| Contact | /contact/ | `site.formspree.contact` | General inquiries, feedback, partnership requests |
| Submit Resource | /submit-resource/ | `site.formspree.submitResource` | Community-contributed resources |
| Newsletter | Homepage, footer, empty states | `site.formspree.newsletter` | Email addresses for engagement |

**Contact form subject options reveal user intent:**

```nunjucks
{# src/pages/contact.njk — subject dropdown #}
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

**These subject categories are feedback signals.** High volume on "resource" suggests the submit-resource form needs more visibility. High "partnership" volume signals community growth.

## Scoping Feedback Features

### Improving the Contact Form

```
Feature: "Add success confirmation to contact form"

Slice 1 (MVP): Formspree redirect to thank-you page
  Files: src/pages/contact.njk, src/pages/thank-you.njk (new)
  AC: Form has hidden _next field pointing to /thank-you/
  AC: Thank-you page has CTAs back to resources and home
  AC: Thank-you page uses page.njk layout

  Implementation:
  <input type="hidden" name="_next" value="{{ site.url }}/thank-you/">
```

### Improving Resource Submissions

The submit-resource form is the primary community contribution mechanism. It feeds back into the resource pipeline.

```
Feature: "Streamline resource submission to data pipeline"

Current flow:
  User fills form → Formspree inbox → Manual review → Manual JSON entry

Slice 1 (MVP): Add structured fields to form
  Files: src/pages/submit-resource.njk
  AC: Form fields match resource JSON schema
  AC: Category is a multi-select (resources can have multiple categories)
  AC: Location uses same dropdown as resource filter
  AC: Description has character guidance (50-200 chars)

Slice 2: Formspree webhook to GitHub
  AC: Formspree webhook triggers on submission
  AC: Webhook creates GitHub issue with structured data
  AC: Issue template matches resource schema for easy copy-paste

Slice 3: Automated PR from submission
  AC: GitHub Action converts issue to JSON entry
  AC: Creates PR with new resource for review
  AC: Reviewer approves → merges → auto-deploys
```

**Form-to-schema alignment:**

```nunjucks
{# submit-resource.njk — fields mapped to resource schema #}
<input name="name" required>           {# → resource.name #}
<input name="website" type="url">      {# → resource.website #}
<select name="location" required>      {# → resource.location #}
<select name="category" required>      {# → resource.category[0] #}
<textarea name="description" required> {# → resource.description #}
<input name="phone" type="tel">        {# → resource.phone #}
<input name="address">                 {# → resource.address #}
```

### DO: Match form fields to data schema

When scoping form improvements, ensure field names and types align with the resource JSON schema. This reduces manual translation during review.

### DON'T: Add form fields that don't map to the data model

```html
<!-- BAD — "rating" has no place in the resource schema -->
<select name="rating">
  <option value="5">Excellent</option>
  <option value="4">Good</option>
</select>
```

**Why:** Extra fields create data that can't be used. If you need a new field, scope the schema extension first (update resource JSON + resource card template), then add the form field.

## Processing Community Resource Submissions

Resource submissions are the most valuable feedback signal. Scope processing features to reduce the manual review burden.

**Submission validation checklist:**

```
Before adding a community-submitted resource to JSON:
- [ ] Resource name is real (not spam)
- [ ] Website URL is valid and loads
- [ ] Location matches states.json values exactly
- [ ] Category matches one of the 29 defined slugs
- [ ] Description is 50-200 characters
- [ ] No duplicate exists (check name + location pair)
- [ ] Schema is valid: all required fields present
```

**Scoping automated validation:**

```
Feature: "Validate resource submissions on the client"

Slice 1 (MVP): HTML5 validation enhancements
  Files: src/pages/submit-resource.njk
  AC: URL field has pattern validation
  AC: Description has minlength="50" maxlength="500"
  AC: Required fields are marked with visual indicator
  AC: All validation uses native HTML5 (no JS needed)

Slice 2: Schema-aligned field names
  Files: src/pages/submit-resource.njk
  AC: Form field names match resource JSON keys exactly
  AC: Formspree submission can be copy-pasted to JSON with minimal editing
```

## Insight-Driven Scope Prioritization

Without analytics, use these proxy signals to prioritize feature scoping.

### Build-Time Data Signals

```nunjucks
{# Measure data health to inform scope priorities #}

{# Signal: Which categories are thin? #}
{% for category in categories %}
  {{ category }}: {{ allResources | filterByCategory(category) | length }}
{% endfor %}
{# Thin categories need data-first slices, not UI features #}

{# Signal: Which states have no resources? #}
{# Count files in src/_data/resources/states/ vs total states #}
{# Empty states need scraper development, not page features #}
```

### Formspree Dashboard Signals

| Signal | Meaning | Scope Response |
|--------|---------|---------------|
| High contact volume on "resource" subject | Users can't find what they need | Scope better search/filter features |
| High contact volume on "partnership" | Organizations want to be listed | Scope bulk resource submission |
| High newsletter signups | Audience is growing | Scope content features (blog, podcast) |
| Resource submissions for uncovered states | Demand for geographic expansion | Scope new state data files and scrapers |
| Resource submissions with new categories | Existing categories don't cover needs | Scope category taxonomy expansion |

### Content Gap Analysis

```
Feature: "Identify and prioritize content gaps"

Slice 1: Build-time data health page
  Files: src/pages/admin/data-health.njk
  AC: Lists all categories with resource counts
  AC: Lists all states with resource counts
  AC: Highlights categories with < 5 resources
  AC: Highlights states with 0 resources
  AC: Not linked from public nav (admin-only)
```

## Anti-Patterns

### WARNING: Scoping User Accounts for Feedback

**The Problem:** Planning a user account system so users can track their submitted resources, save favorites, or leave reviews.

**Why This Breaks:** This is a static site deployed to GoDaddy shared hosting via FTP. There is no server, no database, no session management. User accounts require a fundamentally different architecture (backend API, auth provider, database). Scoping this as a "feature" underestimates the effort by 10x.

**The Fix:** Use Formspree for all user interactions. For "save favorites," scope a client-side localStorage feature. For "track submissions," direct users to their Formspree confirmation email. Stay within the static site architecture.

### WARNING: Building Feedback Forms Without Processing Workflows

**The Problem:** Scoping a new form (e.g., "Report Incorrect Resource") without scoping how submissions will be reviewed and acted on.

**Why This Breaks:** Forms without processing workflows create an inbox that grows forever. Users submit reports, nothing changes, trust erodes. The form becomes a black hole.

**The Fix:** Every form slice must have a companion "processing" slice. Even if processing is manual, define the workflow:

```
Slice 1: Report form
  AC: Form submits to Formspree

Slice 2: Processing workflow
  AC: Weekly review of submissions in Formspree dashboard
  AC: Documented process for updating/removing resources
  AC: Response template for acknowledging reports
```

### WARNING: Ignoring Form Spam in Scope

**The Problem:** Deploying Formspree forms without anti-spam measures.

**Why This Breaks:** Public forms attract bot submissions. Formspree has built-in spam filtering, but you should still scope basic protections.

**The Fix:** Include in every form slice:
```html
<!-- Formspree honeypot field — bots fill this, humans don't -->
<input type="text" name="_gotcha" style="display:none">
```

Acceptance criteria for any form:
```
- [ ] Honeypot field included
- [ ] HTML5 validation on all required fields
- [ ] Email field uses type="email"
- [ ] URL fields use type="url"
```
