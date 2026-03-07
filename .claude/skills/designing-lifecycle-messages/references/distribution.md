# Distribution Reference

## Contents
- Formspree Webhook Pipeline
- ESP Integration Patterns
- WARNING: No ESP Currently Configured
- Sequence Delivery Architecture
- List Hygiene and Segmentation
- Cross-Channel Distribution

---

## Formspree Webhook Pipeline

All subscriber data enters through Formspree. The distribution pipeline connects Formspree to an ESP that delivers the lifecycle sequences.

### Current Form Endpoints

```
Newsletter:          https://formspree.io/f/{{ site.formspree.newsletter }}
Contact:             https://formspree.io/f/{{ site.formspree.contact }}
Resource Submission:  https://formspree.io/f/{{ site.formspree.submitResource }}
```

Formspree supports webhooks and integrations. The recommended pipeline:

```
Formspree Form Submit
  → Formspree Webhook
    → ESP API (add subscriber + tags)
      → Automation trigger (lifecycle sequence)
        → Email delivery
```

### Formspree Webhook Configuration

Formspree Pro supports webhooks to arbitrary URLs. Configure a webhook that POSTs form data to your ESP's subscriber API:

```json
{
  "email": "subscriber@example.com",
  "source": "homepage",
  "interest": "general",
  "_formspree_form": "newsletter"
}
```

Your webhook handler maps these fields to ESP tags/segments.

---

## ESP Integration Patterns

### Recommended ESPs for This Project

| ESP | Best For | Formspree Integration | Cost |
|-----|----------|----------------------|------|
| Buttondown | Simple newsletter, low volume | Webhook | Free < 100 subs |
| ConvertKit | Automation sequences, creator focus | Webhook + Zapier | Free < 1000 subs |
| Mailchimp | Broad features, templates | Native Formspree integration | Free < 500 subs |

### Buttondown Integration (Recommended for Start)

Buttondown is the simplest option for early-stage. Formspree webhook → Buttondown API:

```bash
# Buttondown API to add subscriber with tags
curl -X POST https://api.buttondown.com/v1/subscribers \
  -H "Authorization: Token YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "subscriber@example.com",
    "tags": ["general", "homepage"],
    "metadata": {"source": "homepage"}
  }'
```

### ConvertKit Integration (Recommended for Sequences)

ConvertKit handles multi-step automations natively. Map Formspree hidden fields to ConvertKit tags:

```
interest=general      → Tag: "general-newsletter"
interest=gig-platform → Tag: "gig-platform-interest"
interest=blog         → Tag: "blog-subscriber"
source=homepage       → Tag: "source-homepage"
source=footer         → Tag: "source-footer"
```

Each tag triggers a different automation (sequence) in ConvertKit.

---

## WARNING: No ESP Currently Configured

**Detected:** No email service provider in dependencies or configuration. All forms submit to Formspree only.

**Impact:**
1. No automated lifecycle sequences possible
2. No subscriber list management
3. No analytics on email engagement (opens, clicks)
4. Newsletter signups go into a Formspree inbox with no follow-up

### Recommended Solution

1. Choose an ESP (Buttondown for simplicity, ConvertKit for automations)
2. Configure Formspree webhook to push new subscribers to ESP
3. Build sequences in the ESP's automation builder
4. Add `_next` redirect to custom thank-you page (see [conversion-optimization](conversion-optimization.md))

### Quick Start with ConvertKit

```markdown
Copy this checklist and track progress:
- [ ] Create ConvertKit account (free tier)
- [ ] Create form in ConvertKit (for API endpoint)
- [ ] Set up tags: general-newsletter, gig-platform-interest, blog-subscriber
- [ ] Create Welcome Sequence automation (3 emails, Day 0/3/7)
- [ ] Configure Formspree webhook to POST to ConvertKit API
- [ ] Test end-to-end: form submit → webhook → subscriber added → sequence starts
- [ ] Monitor first 50 subscribers for deliverability issues
```

---

## Sequence Delivery Architecture

### Timing Model

```
Day 0: Welcome (immediate after signup)
Day 3: Depth content (guide or resource highlight)
Day 7: Community invite (submit resource, share story)
Day 14+: Regular newsletter cadence (weekly or biweekly)
```

### Segment-Specific Sequences

| Segment Tag | Sequence | Emails | Cadence |
|-------------|----------|--------|---------|
| `general-newsletter` | Welcome Drip | 3 | Day 0, 3, 7 |
| `gig-platform-interest` | Launch Countdown | 2-3 | Day 0, then on-launch |
| `blog-subscriber` | Content Welcome | 2 | Day 0, then on-publish |
| `resource-submitter` | Thank You + Invite | 1-2 | Day 0, Day 14 |
| `contact-story` | Story Follow-up | 1 | Day 2 |

### Sequence → Regular Newsletter Transition

After the onboarding sequence completes, subscribers move to the regular newsletter. In ConvertKit, this is handled by removing the sequence tag and ensuring they're on the main broadcast list.

```
Welcome Sequence (Day 0-7)
  → Sequence completes
    → Add tag: "newsletter-active"
    → Remove tag: "onboarding"
    → Subscriber receives regular broadcasts
```

---

## List Hygiene and Segmentation

### Segmentation Fields to Capture

Every form should pass these hidden fields to enable proper lifecycle routing:

```njk
{# Minimum fields for any newsletter form #}
<input type="hidden" name="source" value="{{ page.url }}">
<input type="hidden" name="interest" value="general">
<input type="hidden" name="signup_date" value="">
<script>
  document.querySelector('[name="signup_date"]').value = new Date().toISOString().split('T')[0];
</script>
```

### DO: Clean Inactive Subscribers

```markdown
# Re-engagement trigger
If subscriber has not opened any email in 60 days:
  → Send re-engagement sequence (2 emails)
  → If no engagement after re-engagement:
    → Tag as "inactive"
    → Exclude from regular broadcasts
    → Purge after 90 days inactive
```

### DON'T: Send to Unengaged Lists

Sending to subscribers who never open emails tanks deliverability. ESP reputation suffers, and eventually emails land in spam for your engaged subscribers too.

---

## Cross-Channel Distribution

### Blog Post → Email Notification

When a new blog post is published (committed to `src/blog/`), the lifecycle system should notify subscribers tagged `blog-subscriber`:

```markdown
Subject: "New: {{ post.title }}"
Body:
- 2-sentence excerpt from the post
- CTA: "Read the Full Post" → {{ post.url }}
- Footer: link to /blog/ for more posts
```

### Podcast Episode → Email Notification

Same pattern for podcast episodes in `src/podcast/`:

```markdown
Subject: "[Podcast] {{ episode.title }}"
Body:
- Episode description
- Listen links (Spotify, Apple Podcasts)
- CTA: "Listen Now" → {{ episode.url }}
```

### Resource Updates → Email Digest

The weekly scraper pipeline (`.github/workflows/scrape.yml`) updates resource data every Sunday. A monthly digest email could summarize new resources:

```markdown
Subject: "47 new resources added this month"
Body:
- Count of new resources by location
- Top 3 featured resources
- CTA: "Browse All Resources" → /resources/
```

See the **github-actions** skill for the scraper workflow that triggers resource data updates.
