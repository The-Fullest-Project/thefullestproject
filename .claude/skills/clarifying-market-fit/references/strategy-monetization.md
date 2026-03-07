# Strategy & Monetization Reference

## Contents
- Revenue Model Overview
- Three-Phase Strategy in the Codebase
- Offer Ladder
- Positioning Against Alternatives
- Pricing Surfaces
- Anti-Patterns

## Revenue Model Overview

The Fullest Project currently generates **no revenue**. The site is a free resource hub. Revenue plans exist in the codebase as "Coming Soon" features, not as implemented monetization.

| Revenue Stream | Status | Location in Codebase |
|---------------|--------|---------------------|
| Resource directory | Free, always | `src/pages/resources.njk` |
| Non-profit coaching | Active (inquiry-based) | `src/pages/services/index.njk` |
| Group life coaching | Active (inquiry-based) | `src/pages/services/index.njk` |
| Gig platform | Coming Soon | `src/pages/services/index.njk` |
| Shop (merch) | Coming Soon | `src/pages/services/index.njk` |

## Three-Phase Strategy in the Codebase

The about page codifies the strategic roadmap:

```njk
{# src/pages/about.njk — Phase 1 #}
<h3 class="text-xl font-bold mb-3" style="color: var(--color-secondary);">
  Phase 1: Consolidate Resources
</h3>
<p>Conduct research and develop a comprehensive directory for national
   resources and two pilot locations: Northern Virginia and Portland, OR.
   Resources are also crowdsourced by users, so new information is
   constantly being added.</p>
```

```njk
{# Phase 2 #}
<h3 style="color: var(--color-secondary);">Phase 2: Build Knowledge Through Community</h3>
<p>Continue to share information and build knowledge through community
   engagement via our blog, podcast, social media, and partnerships
   with established organizations.</p>
```

```njk
{# Phase 3 #}
<h3 style="color: var(--color-secondary);">Phase 3: Empower & Support Caregivers</h3>
<p>Develop a gig-economy platform connecting caregivers who need help with
   individuals who have the skills to support them. Establish life coaching
   for caregivers and business coaching for disability-focused non-profits.</p>
```

**Current state:** Phase 1 is active (directory + scrapers). Phase 2 is early (one blog post, no podcast episodes). Phase 3 services are live on the services page but inquiry-based (no booking, no payment).

## Offer Ladder

The offer ladder moves visitors from free value to paid services:

```
Free: Resource Directory → Therapy Guide → School & IEP Guide → Equipment Guide
  ↓
Free: Newsletter subscription (ongoing relationship)
  ↓
Free: Community resource submission (investment/ownership)
  ↓
Paid (inquiry): Group Life Coaching
  ↓
Paid (inquiry): Non-Profit Business Coaching
  ↓
Future: Gig Platform (transaction fee model)
  ↓
Future: Shop (product revenue)
```

### How the Ladder Appears in Code

```njk
{# src/pages/services/index.njk — services positioned AFTER free value #}
<p class="text-center mb-12 max-w-3xl mx-auto" style="color: var(--color-text-light);">
  Beyond our resource directory, we offer services designed to empower
  caregivers and strengthen the organizations that support them.
</p>
```

The phrase "Beyond our resource directory" is critical — it positions paid services as an extension of free value, not the primary offering. See the **structuring-offer-ladders** skill for detailed offer architecture.

## Positioning Against Alternatives

The competitive positioning is implicit in the about page copy:

```njk
{# The competitive wedge — fragmentation #}
<p>There is no centralized place to find them. Finding the right resource
   often depends on who you know or how well you can search.</p>
```

| Alternative | Weakness TFP Exploits |
|------------|----------------------|
| Google Search | Generic results, no curation, no disability-specific filtering |
| Facebook groups | Unstructured, hard to search, content disappears |
| Government sites | Bureaucratic, hard to navigate, incomplete |
| Individual org websites | Siloed — each covers only their own services |
| 211/helplines | Phone-only, not browsable, limited hours |

### Positioning Statement Formula

```
For [caregivers of individuals with disabilities]
who [struggle to find the right resources because it depends on who you know],
The Fullest Project is a [connection hub]
that [consolidates local and national resources, programs, education, and community into one searchable directory].
Unlike [fragmented Google searches and word-of-mouth],
we [curate, verify, and keep resources current through automated scraping and community submissions].
```

This positioning statement is not on the site verbatim — it's the **strategic underpinning** that all on-page copy should support.

## Pricing Surfaces

Currently there are **no pricing pages or payment flows**. Coaching services funnel to the contact form:

```njk
{# Services CTA — inquiry-based, not self-serve #}
<a href="/contact/?subject=partnership" class="btn-primary no-underline">Learn More</a>
<a href="/contact/?subject=partnership" class="btn-primary no-underline">Get Started</a>
```

The `?subject=partnership` query param pre-selects the contact form dropdown, routing coaching inquiries to the right category.

### When Pricing Is Added

If coaching gets pricing, add it to the services page as a card with:
1. Price or price range
2. What's included (session count, group size)
3. CTA that either links to a booking page or pre-fills the contact form

Do not add a pricing page as a separate URL until there are 3+ priced offerings. A single priced service belongs on the services page.

## Anti-Patterns

### WARNING: Monetizing Before the Free Value Is Proven

**The Problem:** Adding payment flows, pricing tiers, or premium features before the resource directory has consistent traffic and the newsletter has a meaningful subscriber base.

**Why This Breaks:**
1. Visitors who see paywalls on a sparse site assume it's a scam
2. Coaching inquiries require trust — trust requires demonstrated expertise (blog, podcast, directory depth)
3. The gig platform needs a two-sided marketplace, which requires significant volume on both sides

**The Fix:** Stick to the three-phase plan. Phase 1 (free directory) must reach critical mass before Phase 3 (paid services) can succeed. The services page's current "inquiry-based" model (contact form, no pricing) is appropriate for this stage.

### WARNING: Positioning Coaching as the Primary Offer

**The Problem:**

```njk
{# BAD — leads with paid services #}
<h1>Expert Coaching for Caregivers</h1>
<p>Get professional support from coaches who understand your journey.</p>
<a href="/services/">View Our Services</a>
```

**Why This Breaks:** The ICP arrives looking for free resources, not coaching. Leading with paid services repels the core audience and undermines the "connection hub" positioning.

**The Fix:** Always lead with the free value (resource directory, guides, community), then present services as a natural extension:

```njk
{# GOOD — free value first, services second #}
<h1>Living Life to the Fullest</h1>
<p>Your connection hub for disability resources, programs, education, and community.</p>
<a href="/resources/">Find Resources</a>
```

### WARNING: Splitting Focus Across Too Many Revenue Streams

The services page lists four potential revenue streams (coaching x2, gig platform, shop). At the current stage, this creates a "mall under construction" impression.

**The Fix:** Keep all four listed (transparency about the roadmap is good), but ensure "Coming Soon" items have waitlist capture (the gig platform does) and don't visually compete with active offerings. See the **orchestrating-feature-adoption** skill for phased feature visibility.
