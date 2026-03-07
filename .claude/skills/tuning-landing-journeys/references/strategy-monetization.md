# Strategy & Monetization Reference

## Contents
- Three-Phase Business Model
- Current Revenue Surface (Phase 1)
- Services Page as Phase 2/3 Soft Launch
- Monetization Paths in the Codebase
- WARNING: Anti-Patterns
- Strategy Checklist

## Three-Phase Business Model

The about page (`src/pages/about.njk`) outlines three phases:

| Phase | Focus | Revenue Model | Status |
|-------|-------|---------------|--------|
| 1. Consolidate Resources | Resource directory + educational content | None (audience building) | Active |
| 2. Build Community | Blog, podcast, partnerships | Sponsorships, partnership fees | Emerging |
| 3. Empower Caregivers | Gig platform, coaching, shop | Transaction fees, coaching fees, merchandise | Future |

The site currently operates in Phase 1 with Phase 2/3 elements soft-launched on the services page.

## Current Revenue Surface (Phase 1)

Phase 1 generates no revenue. The conversion goal is audience capture (newsletter signups) and community contribution (resource submissions). The resource directory is the primary value proposition driving traffic.

```njk
{# The entire Phase 1 funnel: #}
{# Educational content → Resource discovery → Newsletter capture #}

{# Homepage hero drives to resources #}
<a href="/resources/" class="btn-secondary">Find Resources</a>

{# Mid-page captures email #}
<form action="https://formspree.io/f/{{ site.formspree.newsletter }}" method="POST">
  <input type="email" name="email" required class="form-input">
  <button type="submit" class="btn-secondary">Subscribe</button>
</form>
```

**Strategic insight:** Phase 1 success is measured entirely by newsletter list size and resource directory completeness. Every landing page change should optimize for one of these two metrics.

## Services Page as Phase 2/3 Soft Launch

`src/pages/services/index.njk` introduces future revenue streams without over-promising:

### Non-Profit Coaching (Phase 2)

```njk
{# Active service — links to contact form #}
<a href="/contact/?subject=partnership" class="btn-primary">Learn More</a>
```

This is the only currently monetizable service. The CTA routes to the contact form with a pre-populated subject.

### Group Life Coaching (Phase 2)

```njk
{# Same pattern — routes to contact #}
<a href="/contact/?subject=partnership" class="btn-primary">Get Started</a>
```

### Gig Platform (Phase 3 — Coming Soon)

```njk
{# Visual differentiation: dashed border + "Coming Soon" tag #}
<div class="card p-8 border-2 border-dashed" style="border-color: var(--color-accent);">
  <span class="tag" style="background-color: var(--color-accent); color: white;">Coming Soon</span>
  {# ... description ... #}
  <form action="https://formspree.io/f/{{ site.formspree.newsletter }}" method="POST">
    <input type="hidden" name="interest" value="gig-platform">
    <input type="email" name="email" required class="form-input">
    <button type="submit" class="btn-primary">Notify Me</button>
  </form>
</div>
```

**Pattern:** Coming-soon features use dashed borders, accent color tags, and email capture instead of action CTAs.

### Shop (Phase 3 — Coming Soon)

```njk
{# Routes to contact with shop subject #}
<a href="/contact/?subject=shop" class="btn-primary">Shop Coming Soon</a>
```

## Monetization Paths in the Codebase

| Path | Template | CTA | Formspree Field |
|------|----------|-----|----------------|
| Coaching inquiry | `services/index.njk` | "Learn More" / "Get Started" | `subject=partnership` |
| Gig platform waitlist | `services/index.njk` | "Notify Me" | `interest=gig-platform` |
| Shop interest | `services/index.njk` | "Shop Coming Soon" | `subject=shop` |
| General partnership | `contact.njk` | "Partnership Opportunity" (dropdown) | `subject` field |

### WARNING: All Revenue Paths Route to a Single Contact Form

**The Problem:** Coaching, partnerships, gig platform, and shop inquiries all funnel through the same contact form or newsletter endpoint. There is no way to prioritize or route high-intent leads.

**Why This Breaks:**
1. A coaching inquiry worth $500+ sits in the same Formspree inbox as a general question
2. No automated follow-up for high-value leads
3. Response time is the same for "share my story" and "I want to hire a coach"

**The Fix:** Use Formspree's webhook feature to route submissions by subject:

```json
// Formspree form settings — add webhook integration
// Route "Partnership Opportunity" subjects to a separate notification channel
```

Or use hidden fields to tag priority:

```njk
{# On services page coaching CTA, add priority tagging #}
<form action="https://formspree.io/f/{{ site.formspree.contact }}" method="POST">
  <input type="hidden" name="subject" value="Partnership Opportunity">
  <input type="hidden" name="_priority" value="high">
  <input type="hidden" name="_source" value="services-coaching">
  {# ... visible fields ... #}
</form>
```

See the **triaging-user-feedback** skill for building a triage workflow.
See the **structuring-offer-ladders** skill for pricing and packaging.

## WARNING: No Dedicated Landing Pages for Paid Services

**The Problem:** Coaching services share a page with a coming-soon gig platform and a coming-soon shop. The coaching CTA competes with two unlaunchable features.

**Why This Breaks:** A potential coaching client sees "Coming Soon" tags and may perceive the entire business as not-yet-ready. The coaching service — which IS available — gets diluted.

**The Fix:** When coaching is ready to actively sell, create a dedicated page:

```yaml
---
layout: layouts/page.njk
title: "Non-Profit Business Coaching"
description: "Specialized coaching for disability-focused non-profits."
permalink: /services/coaching/
---
```

This gives the service its own URL for sharing, its own meta description for search, and removes visual competition from coming-soon features.

## Strategy Checklist

- [ ] Phase 1 metrics defined: newsletter subscriber count + resource directory size
- [ ] Services page visually separates active services from coming-soon features
- [ ] Coaching CTA links to `/contact/?subject=partnership` with clear pre-population
- [ ] Gig platform signup captures email with `interest=gig-platform` hidden field
- [ ] Contact form submissions tagged by source page (`_source` hidden field)
- [ ] High-value leads (coaching, partnerships) have priority routing in Formspree
- [ ] Coming-soon features use dashed borders and accent color tags consistently
- [ ] Blog/podcast content plan aligns with Phase 2 community building goals

See the **designing-lifecycle-messages** skill for post-signup nurture sequences.
See the **clarifying-market-fit** skill for ICP and positioning alignment.
