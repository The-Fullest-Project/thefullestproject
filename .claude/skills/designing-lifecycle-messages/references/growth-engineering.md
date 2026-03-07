# Growth Engineering Reference

## Contents
- Subscriber Acquisition Loops
- Content-Driven Growth
- WARNING: No Referral Mechanism
- Resource Submission as Growth Loop
- Scraper Pipeline as Content Engine
- Progressive Profiling

---

## Subscriber Acquisition Loops

The site has a natural growth loop: visitors find resources → subscribe for updates → receive emails → return to site → discover more resources → share with other caregivers.

### Current Acquisition Points

```
Homepage "Stay Connected"     → Newsletter subscriber
Footer (every page)           → Newsletter subscriber
Services "Notify Me"          → Gig platform interest
Blog empty state              → Newsletter promise
Podcast empty state           → Newsletter promise
```

### Missing Acquisition Points

These high-intent pages lack newsletter prompts:

```njk
{# src/pages/resources.njk — after resource grid, before footer #}
{# MISSING: "Get new resources delivered to your inbox" signup #}

{# src/pages/therapy-guide/index.njk — after therapy cards #}
{# MISSING: "Get therapy tips and updates" signup #}

{# src/pages/school-iep/index.njk — after IEP guide #}
{# MISSING: "Get IEP prep resources" signup #}

{# src/pages/adaptive-equipment.njk — after equipment section #}
{# MISSING: "Equipment deals and loaner program updates" signup #}
```

### Adding a Newsletter CTA to Content Pages

Follow the existing footer pattern but with page-specific copy and segmentation:

```njk
{# Example: Add to resources.njk above the "Know a Resource We're Missing?" section #}
<section class="py-12 text-center" style="background-color: var(--color-primary);">
  <h2 class="text-2xl font-bold text-white mb-4">Get New Resources in Your Inbox</h2>
  <p class="text-white/90 mb-6 max-w-xl mx-auto">
    We add new resources every week. Subscribe to get notified.
  </p>
  <form action="https://formspree.io/f/{{ site.formspree.newsletter }}" method="POST"
        class="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
    <input type="hidden" name="source" value="resources">
    <input type="hidden" name="interest" value="new-resources">
    <input type="email" name="email" placeholder="Your email" required
           class="flex-1 px-4 py-2 rounded-lg">
    <button type="submit" class="btn-secondary">Notify Me</button>
  </form>
</section>
```

See the **crafting-page-messaging** skill for writing page-specific newsletter prompts. See the **eleventy** skill for template includes.

---

## Content-Driven Growth

### Blog → Email → Return Visit Loop

```
1. Blog post published (src/blog/*.md)
2. ESP sends notification to tagged subscribers
3. Subscriber clicks → visits blog post
4. Blog post includes related resource links
5. Visitor browses resources → finds value
6. Shares with another caregiver (word of mouth)
7. New visitor → subscribes → enters lifecycle
```

### Maximizing Blog Post Lifecycle Value

Every blog post should feed into the lifecycle system:

```markdown
# In blog post front matter (src/blog/*.md)
---
layout: layouts/post.njk
title: "5 Questions to Ask at Your Next IEP Meeting"
category: Education
tags: [iep, school, advocacy]
email_segment: "iep-interested"
---

# In the blog post body, include a CTA that maps to a lifecycle sequence
"Want more IEP prep resources? [Subscribe for weekly tips](/newsletter/?interest=iep)"
```

### Resource Count as Social Proof

The homepage already displays resource stats:

```njk
{# src/pages/index.njk lines 128-149 — Nationwide Coverage section #}
{# Shows: resource count, 51 locations, 29 categories #}
```

Use these numbers in lifecycle emails as social proof:

```markdown
Subject: "We added 47 new resources this month"
Body: "Our directory now covers {{totalResources}} resources across 51 locations..."
```

---

## WARNING: No Referral Mechanism

**The Problem:** No way for subscribers to share the site or invite other caregivers. The only "viral" channel is organic word-of-mouth.

**Why This Breaks:**
1. Caregivers naturally share resources with each other (support groups, therapy waiting rooms, school meetings)
2. Without a share mechanism, this sharing happens outside the site with no attribution
3. Missed opportunity for the strongest growth channel (peer recommendation)

**The Fix:** Add share functionality to lifecycle emails and key pages:

```markdown
# In every lifecycle email footer:
"Know another caregiver who could use this? Forward this email or share:
[Share on Facebook] [Copy Link] [Email a Friend]"
```

```njk
{# Add to resource cards or guide pages #}
<div class="flex gap-2 mt-4">
  <a href="mailto:?subject=Check out this resource&body=I found this on The Fullest Project: {{ site.url }}{{ page.url }}"
     class="text-sm underline" style="color: var(--color-accent);">
    Email to a friend
  </a>
</div>
```

---

## Resource Submission as Growth Loop

The resource submission form (`src/pages/submit-resource.njk`) is a growth lever. Submitters are engaged community members who should enter a lifecycle sequence.

### Submission → Subscriber Pipeline

```
1. Caregiver submits resource at /submit-resource/
2. Formspree receives submission (includes optional email)
3. Webhook triggers:
   a. Resource goes into review queue
   b. If email provided → add to ESP with tag "resource-submitter"
4. Lifecycle sequence:
   Day 0: "Thanks for sharing! Here's what happens next."
   Day 7: "Your resource is now live" (or "under review")
   Day 14: "Want to help more? Subscribe to our newsletter."
```

### Encouraging More Submissions via Email

The welcome sequence (Day 7) already invites submissions. Reinforce in regular newsletters:

```markdown
# Monthly newsletter section
"## Help Us Grow
Know of a program, therapist, or organization we're missing?
[Submit a Resource →](/submit-resource/)
This month, community members submitted 12 new resources."
```

---

## Scraper Pipeline as Content Engine

The weekly scraper pipeline (`.github/workflows/scrape.yml`) generates fresh content automatically. Use it to fuel lifecycle emails.

### Automated "New Resources" Email Trigger

```markdown
## Pipeline: Scraper → Commit → Email

1. scrape.yml runs every Sunday at midnight UTC
2. Scrapers update src/_data/resources/*.json
3. If diff shows new resources:
   a. Commit + deploy (existing behavior)
   b. Trigger ESP broadcast: "New resources this week"
4. ESP sends to "newsletter-active" subscribers
```

### Tracking New Resources for Email Content

The scraper commits to the repo. A post-deploy webhook could count new resources:

```bash
# In GitHub Actions, after scrape commit:
# Count new resources added
git diff HEAD~1 --stat src/_data/resources/ | grep "insertions"
```

This count feeds into email subject lines: "23 new resources added this week."

---

## Progressive Profiling

Collect subscriber preferences over time through lifecycle emails rather than upfront forms.

### Welcome Sequence Profiling

```markdown
## Email 2 (Day 3) — Implicit Profiling
Include links to different content areas.
Track which links each subscriber clicks:
- Clicked /therapy-guide/ → tag "interested-therapy"
- Clicked /school-iep/ → tag "interested-iep"
- Clicked /adaptive-equipment/ → tag "interested-equipment"

## Email 3 (Day 7) — Explicit Ask
"What topics matter most to you?
→ Therapy options
→ School & IEP navigation
→ Adaptive equipment
→ All of the above"

Each link goes to the relevant page WITH a UTM tag that the ESP tracks.
```

### Location Profiling

The site serves Northern Virginia, Portland, and national audiences. Profile location through email engagement:

```markdown
# In a lifecycle email, include location-specific CTAs:
"Browse resources near you:
→ Northern Virginia resources (/resources/?location=nova)
→ Portland resources (/resources/?location=portland)
→ National resources (/resources/?location=national)"

# Track clicks to tag subscriber location preference
```

See the **mapping-user-journeys** skill for the full user journey that lifecycle messages support.
