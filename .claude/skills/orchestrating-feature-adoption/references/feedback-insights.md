# Feedback & Insights Reference

## Contents
- Feedback Collection Surfaces
- Contact Form Subject Analysis
- Resource Submission Insights
- Newsletter Segmentation Signals
- WARNING: No Structured Feedback Loop
- Turning Formspree Data into Product Decisions
- Feedback Triage Workflow

## Feedback Collection Surfaces

The site has three Formspree forms that double as feedback channels:

| Form | Location | Feedback Signal |
|------|----------|----------------|
| Contact | `/contact/` | Subject dropdown reveals intent: General Inquiry, Resource Suggestion, Partnership, Share My Story, Website Feedback, Other |
| Submit Resource | `/submit-resource/` | Community members contributing data — highest engagement signal |
| Newsletter | Homepage, footer, services | Interest segmentation via hidden fields |

There is no dedicated feedback widget, no NPS survey, no in-page rating system.

## Contact Form Subject Analysis

The contact form subject dropdown is the richest feedback signal on the site:

```html
{# src/pages/contact.njk — subject options reveal visitor intent #}
<select id="subject" name="subject" required class="form-input">
  <option value="">Select a subject</option>
  <option value="general">General Inquiry</option>
  <option value="resource">Resource Suggestion</option>
  <option value="partnership">Partnership Opportunity</option>
  <option value="story">Share My Story</option>
  <option value="feedback">Website Feedback</option>
  <option value="other">Other</option>
</select>
```

### What Each Subject Tells You

| Subject | Signal | Action |
|---------|--------|--------|
| Resource Suggestion | Visitor found the site useful but incomplete | Add suggested resource to data pipeline |
| Partnership Opportunity | Organization wants to collaborate | Evaluate for directory listing or co-marketing |
| Share My Story | Community building interest | Queue for blog content (when launched) |
| Website Feedback | UX issues or feature requests | Triage for product backlog |
| General Inquiry | Broad engagement | Respond and probe for specific needs |

### Adding Hidden Context to Contact Links

```html
{# Deep-link to contact with pre-selected subject #}
<a href="/contact/?subject=resource">Suggest a Resource</a>
<a href="/contact/?subject=partnership">Partner With Us</a>
<a href="/contact/?subject=feedback">Give Feedback</a>
```

For this to work, add URL param reading to the contact page:

```html
{# Add to src/pages/contact.njk before </body> or in a script block #}
<script>
  var params = new URLSearchParams(window.location.search);
  var subject = params.get('subject');
  if (subject) {
    var select = document.getElementById('subject');
    if (select) {
      for (var i = 0; i < select.options.length; i++) {
        if (select.options[i].value === subject) {
          select.selectedIndex = i;
          break;
        }
      }
    }
  }
</script>
```

**DO:** Use `?subject=` params from contextual CTAs so the contact form arrives pre-filled. This reduces friction and gives you better data about what drove the outreach.

**DON'T:** Add too many subject options. Six is the current max — more than that creates decision paralysis.

## Resource Submission Insights

Every resource submission tells you:
- **What category** the community values (from the category dropdown)
- **What location** has gaps (from the location dropdown)
- **What organizations** are known to caregivers but missing from your data

### Extracting Patterns

```
Monthly: Export Formspree submit-resource submissions
Group by: category → identify underserved categories
Group by: location → identify locations needing more scraper coverage
Look for: repeated organization names → prioritize adding them
```

### Feeding Submissions Back to the Pipeline

When a submitted resource is validated:

```json
// Add to src/_data/resources/nova.json (or relevant location file)
{
  "name": "Community Resource Name",
  "category": ["category-from-submission"],
  "location": "Northern Virginia",
  "description": "Description from submission",
  "website": "https://submitted-url.org",
  "source": "community-submission",
  "lastScraped": "2026-03-06"
}
```

Use `"source": "community-submission"` to distinguish community-contributed resources from scraped ones. See the **python** skill for scraper pipeline conventions.

## Newsletter Segmentation Signals

Hidden form fields on newsletter signups provide segmentation data:

```html
{# Services page — gig platform interest #}
<input type="hidden" name="interest" value="gig-platform">

{# Proposed: add source to all newsletter forms #}
<input type="hidden" name="source" value="homepage-hero">
<input type="hidden" name="source" value="footer">
<input type="hidden" name="source" value="therapy-guide">
```

### What Segments Tell You

| Segment | Signal | Product Decision |
|---------|--------|-----------------|
| `interest=gig-platform` | Demand for caregiver gig marketplace | Validate building the platform |
| `source=therapy-guide` | Engaged with therapy content | Therapy resources are high-value |
| `source=homepage-hero` | Converted on first impression | Hero messaging resonates |
| `source=footer` | Read deep enough to reach footer | Content is engaging |

## WARNING: No Structured Feedback Loop

**The Problem:** Formspree submissions land in an inbox (or Formspree dashboard) but there is no process to:
- Triage feedback by type
- Track feedback themes over time
- Close the loop with the submitter
- Feed insights into product decisions

**Why This Breaks:**
1. Feedback accumulates without action, creating a perception that submissions go nowhere
2. Repeated suggestions for the same feature go unnoticed because they're not aggregated
3. Community-submitted resources sit in email instead of entering the data pipeline
4. Partnership inquiries go cold if not responded to promptly

**The Fix:** Establish a lightweight triage workflow (below) and review submissions weekly.

## Turning Formspree Data into Product Decisions

### Weekly Triage Process

1. Export all Formspree submissions from the past week
2. Categorize by form type (contact, submit-resource, newsletter)
3. For contact submissions, tag by subject
4. For resource submissions, check if the resource already exists in JSON data
5. Create a simple tally:

```
This week:
- Resource suggestions: 3 (2 therapy, 1 legal)
- Partnership inquiries: 1
- Website feedback: 2 (both about filter UX)
- Newsletter signups: 8 (3 from homepage, 2 from footer, 3 from services)
- Stories shared: 1
```

### Decision Framework

| Signal | Threshold | Action |
|--------|-----------|--------|
| 3+ resource suggestions in same category | Weekly | Add scraper source for that category |
| 3+ feedback items about same UX issue | Monthly | Prioritize fix in next sprint |
| 5+ newsletter signups from one source | Weekly | That page's CTA is working — replicate pattern |
| Partnership inquiry | Each one | Respond within 48 hours |
| Story submission | Each one | Queue for blog when launched |

## Feedback Triage Workflow

1. Open Formspree dashboard
2. Review new submissions since last triage
3. For each submission:
   - Resource suggestion → validate URL, add to appropriate JSON file
   - Website feedback → create issue in project backlog
   - Partnership → forward to founders with 48-hour response deadline
   - Story → save for blog content pipeline
   - Newsletter → no action needed (auto-captured)
4. Update tally in project notes
5. If any category has 3+ signals, flag for product discussion

### Validation Loop

1. Review Formspree submissions weekly
2. Tally by type and subject
3. If a pattern emerges (3+ signals), take action
4. After action, monitor if the signal drops (problem solved) or continues (more work needed)
5. Repeat weekly

See the **triaging-user-feedback** skill for comprehensive feedback management and the **scoping-feature-work** skill for turning feedback patterns into feature slices.
