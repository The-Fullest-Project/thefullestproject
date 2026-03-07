# Strategy & Monetization Reference

## Contents
- Revenue Model and Phase Plan
- Current Monetization Surfaces
- Services Page Messaging Strategy
- WARNING: "Coming Soon" Without Capture
- Shop Messaging Strategy
- Gig Platform Positioning
- Monetization Messaging Checklist

## Revenue Model and Phase Plan

This is a non-profit with a phased approach defined on the about page (`src/pages/about.njk`):

| Phase | Focus | Revenue Model |
|-------|-------|---------------|
| Phase 1 | Consolidate resource directory | None (free public good) |
| Phase 2 | Content + community engagement (blog, podcast, social) | Sponsorships, partnerships |
| Phase 3 | Gig platform + coaching services + shop | Service fees, coaching fees, merchandise |

The site is currently in **Phase 1 with Phase 3 surfaces already built** (services page, shop section). This creates a messaging challenge: how to present future revenue services without undermining the free-resource core.

## Current Monetization Surfaces

| Surface | File | Status | Revenue Type |
|---------|------|--------|-------------|
| Non-profit coaching | `src/pages/services/index.njk` | Active (links to contact) | Service fee |
| Group life coaching | `src/pages/services/index.njk` | Active (links to contact) | Service fee |
| Gig platform | `src/pages/services/index.njk` | Waitlist only | Future: transaction fees |
| Shop | `src/pages/services/index.njk` | "Coming Soon" | Merchandise |
| Resource directory | `src/pages/resources.njk` | Free, always | None (core mission) |

## Services Page Messaging Strategy

The services page (`src/pages/services/index.njk`) presents three service offerings plus a shop. The messaging must:

1. Position services as **extensions of the mission**, not pivots away from it
2. Use qualifying language to attract the right audience for each service

### DO: Lead with Mission Alignment

```njk
{# src/pages/services/index.njk — page intro #}
<p class="text-center mb-12 max-w-3xl mx-auto" style="color: var(--color-text-light);">
  Beyond our resource directory, we offer services designed to empower
  caregivers and strengthen the organizations that support them.
</p>
```

"Beyond our resource directory" establishes that the free directory is the foundation. Services are an addition, not a replacement.

### DO: Qualify Coaching Audiences

```njk
{# Non-profit coaching — targets organizations, not individual caregivers #}
<h2 class="text-2xl font-bold mb-4" style="color: var(--color-primary);">
  Non-Profit Business Coaching
</h2>
<p class="mb-6" style="color: var(--color-text-light);">
  Specialized coaching for disability-focused non-profits looking to grow
  their impact, improve operations, and better serve their communities.
</p>
```

```njk
{# Life coaching — targets caregivers personally #}
<h2 class="text-2xl font-bold mb-4" style="color: var(--color-primary);">
  Group Life Coaching
</h2>
<p class="mb-6" style="color: var(--color-text-light);">
  Group coaching designed specifically for caregivers of individuals
  with disabilities. A safe space to process challenges, set goals,
  build resilience, and connect with others who understand your journey.
</p>
```

### DON'T: Mix Audiences in One Section

```njk
{# BAD — who is this for? #}
<p>We offer coaching for everyone — non-profits, caregivers, and anyone
   looking to make a difference in the disability space.</p>
```

**Why this breaks:** A non-profit executive and a parent of a newly diagnosed child have completely different needs. Lumping them together dilutes the value prop for both.

## WARNING: "Coming Soon" Without Capture

**The Problem:** The shop section has a "Coming Soon" button that links to the contact page:

```njk
{# src/pages/services/index.njk — shop section #}
<a href="/contact/?subject=shop" class="btn-primary no-underline">Shop Coming Soon</a>
```

**Why This Breaks:**
1. "Coming Soon" as button text is not a CTA — it's a status label
2. Linking to the contact form to express shop interest adds friction
3. No way to measure demand for the shop

**The Fix:** Use the same waitlist pattern as the gig platform:

```njk
<form action="https://formspree.io/f/{{ site.formspree.newsletter }}" method="POST"
      class="flex flex-col gap-2 max-w-sm mx-auto">
  <input type="hidden" name="interest" value="shop">
  <label for="shop-email" class="sr-only">Email to get notified</label>
  <input type="email" id="shop-email" name="email"
         placeholder="Get notified when we launch" class="form-input text-sm">
  <button type="submit" class="btn-secondary text-sm text-center">Notify Me</button>
</form>
```

The gig platform section already uses this pattern correctly:

```njk
{# src/pages/services/index.njk — gig platform waitlist #}
<form action="https://formspree.io/f/{{ site.formspree.newsletter }}" method="POST"
      class="flex flex-col gap-2">
  <input type="hidden" name="interest" value="gig-platform">
  <input type="email" id="gig-email" name="email"
         placeholder="Get notified at launch" class="form-input text-sm">
  <button type="submit" class="btn-secondary text-sm text-center">Notify Me</button>
</form>
```

## Gig Platform Positioning

The gig platform has the most complex positioning challenge. It's a two-sided marketplace targeting:

- **Demand side:** Caregivers who need help with tasks (research, sewing modifications, errands)
- **Supply side:** Fellow caregivers who have skills but can't work traditional jobs

Current messaging handles this well:

```njk
<p class="mb-6" style="color: var(--color-text-light);">
  A gig-economy platform designed to empower caregivers. Need help with
  research, sewing modifications, or other tasks? Connect with individuals
  who have the skills and flexibility to help — often fellow caregivers
  who can't work traditional full-time jobs.
</p>
```

### DO: Lead with the Demand Side

Caregivers seeking help are the primary audience of this page. The supply-side value prop ("additional income") is secondary and should come after the "how it works" list.

### DON'T: Position as a Generic Gig Platform

```njk
{# BAD — sounds like TaskRabbit, loses the mission #}
<p>Post jobs and find freelancers for any task.</p>
```

## Shop Messaging Strategy

The shop section positions merchandise as disability-positive apparel:

```njk
<p class="mb-6 max-w-2xl mx-auto" style="color: var(--color-text-light);">
  Disability-positive apparel and accessories that celebrate the fullness
  of life. Empowering tees, mugs, prints, and OT-inspired products —
  all designed to spark conversation and support our mission.
</p>
```

### DO: Tie Purchases to Mission

"Support our mission" makes the purchase feel like a contribution, not just a transaction. Keep this framing.

### DON'T: Lead with Product Features

```njk
{# BAD — sounds like any merch store #}
<p>High-quality cotton tees in multiple sizes and colors. Fast shipping available.</p>
```

## Monetization Messaging Checklist

Copy this checklist when writing or revising service/monetization pages:

- [ ] Services intro references the free resource directory as the foundation
- [ ] Each service clearly states its target audience (non-profits vs. caregivers)
- [ ] "Coming Soon" features have email capture forms, not dead-end labels
- [ ] Gig platform leads with the demand side (who needs help), not supply
- [ ] Shop purchases are framed as mission support, not transactions
- [ ] Hidden form fields (`name="interest" value="..."`) segment waitlist signups
- [ ] CTAs on service cards use specific language: "Learn More", "Get Started", "Notify Me"
- [ ] No service section undermines the free-resource core value proposition

See the **structuring-offer-ladders** skill for pricing and packaging strategy. See the **clarifying-market-fit** skill for audience segmentation and positioning.
