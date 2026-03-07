# Strategy & Monetization Reference

## Contents
- Revenue Surfaces in This Codebase
- Three-Phase Approach Copy
- Services Page Voice
- Shop Section Voice
- Gig Platform Pre-Launch Copy
- WARNING: Monetization Copy That Undermines Mission
- Pricing and Services Copy Checklist

## Revenue Surfaces in This Codebase

The Fullest Project is a **mission-driven organization** with three planned revenue channels. Copy on revenue pages must balance business needs with brand trust.

| Revenue Channel | Status | Surface | File |
|----------------|--------|---------|------|
| Non-profit business coaching | Active | Services page | `src/pages/services/index.njk` |
| Group life coaching | Active | Services page | `src/pages/services/index.njk` |
| Caregiver gig platform | Pre-launch | Services page + waitlist form | `src/pages/services/index.njk` |
| Shop (apparel, mugs, prints) | Coming soon | Services page | `src/pages/services/index.njk` |

## Three-Phase Approach Copy

The about page outlines the organization's strategic roadmap. This copy anchors all monetization messaging.

```njk
{# src/pages/about.njk — strategic phases #}
<h2>Our Three-Phase Approach</h2>

{# Phase 1: current focus #}
<h3>Phase 1: Consolidate Resources</h3>
<p>Conduct research and develop a comprehensive directory for national
   resources and two pilot locations: Northern Virginia and Portland, OR.</p>

{# Phase 2: content + community #}
<h3>Phase 2: Build Knowledge Through Community</h3>
<p>Continue to share information and build knowledge through community
   engagement via our blog, podcast, social media, and partnerships.</p>

{# Phase 3: monetization #}
<h3>Phase 3: Empower & Support Caregivers</h3>
<p>Develop a gig-economy platform connecting caregivers who need help
   with individuals who have the skills to support them. Establish life
   coaching for caregivers and business coaching for disability-focused
   non-profits.</p>
```

**Voice rule:** Phase 3 is framed as "Empower & Support" — not "Monetize." Every revenue channel must be positioned as a service that fulfills the mission, not a revenue stream.

## Services Page Voice

### Non-Profit Business Coaching

```njk
{# src/pages/services/index.njk #}
<h2>Non-Profit Business Coaching</h2>
<p>Specialized coaching for disability-focused non-profits looking to grow
   their impact, improve operations, and better serve their communities.
   Drawing on real-world business expertise and deep understanding of the
   disability space.</p>
```

**Voice analysis:**
- "grow their impact" — mission-first framing (impact, not revenue)
- "real-world business expertise" — establishes authority without jargon
- "deep understanding of the disability space" — insider credibility

### Group Life Coaching

```njk
<h2>Group Life Coaching</h2>
<p>Group coaching designed specifically for caregivers of individuals with
   disabilities. A safe space to process challenges, set goals, build
   resilience, and connect with others who understand your journey.</p>
```

**Voice analysis:**
- "safe space" — acknowledges emotional weight of caregiving
- "others who understand your journey" — peer community framing
- No price mentioned on the page — the copy sells the value first

### DO: Lead with the Caregiver's Need

```njk
<p>A safe space to process challenges, set goals, build resilience, and
   connect with others who understand your journey.</p>
```

### DON'T: Lead with the Service Features

```njk
{# BAD — features-first, not needs-first #}
<p>Our 8-week coaching program includes weekly 90-minute group sessions,
   workbooks, and access to a private community forum.</p>
```

**Why this breaks:** A caregiver visits this page feeling isolated and overwhelmed. They need to see themselves in the copy before they care about session length.

## Shop Section Voice

```njk
{# src/pages/services/index.njk — shop section #}
<h2>Shop</h2>
<p>Disability-positive apparel and accessories that celebrate the fullness
   of life. Empowering tees, mugs, prints, and OT-inspired products — all
   designed to spark conversation and support our mission.</p>
```

**Voice rules for shop copy:**
- "Disability-positive" — frames products as identity affirmation, not charity merch
- "spark conversation" — the product is a tool for advocacy
- "support our mission" — ties purchase to impact

### DON'T: Generic E-Commerce Voice

```njk
{# BAD — sounds like any merch store #}
<p>Browse our collection of t-shirts, mugs, and accessories. Free shipping
   on orders over $50!</p>
```

**Why this breaks:** Strips the mission context. The shop exists to fund the organization and spread awareness — the copy must reflect that.

## Gig Platform Pre-Launch Copy

```njk
{# src/pages/services/index.njk — gig platform section #}
<span class="tag">Coming Soon</span>
<h2>Caregiver Gig Platform</h2>
<p>A gig-economy platform designed to empower caregivers. Need help with
   research, sewing modifications, or other tasks? Connect with individuals
   who have the skills and flexibility to help — often fellow caregivers
   who can't work traditional full-time jobs.</p>
```

**Voice analysis:**
- "designed to empower caregivers" — both sides of the marketplace are caregivers
- "research, sewing modifications" — concrete examples make it real
- "can't work traditional full-time jobs" — acknowledges the economic reality without pity

### Pre-Launch Waitlist CTA

```njk
<p class="mb-4">Be the first to know when the platform launches:</p>
<input type="email" placeholder="Your email" required>
<button type="submit" class="btn-primary">Notify Me</button>
```

**Voice rule:** "Notify Me" is better than "Sign Up" for a pre-launch. It sets the right expectation — you'll hear from us when it's ready, not before.

## WARNING: Monetization Copy That Undermines Mission

**The Problem:**

```njk
<h2>Premium Coaching Packages</h2>
<p>Unlock exclusive access to our expert coaching services. Invest in
   yourself today with our gold, silver, and bronze tiers.</p>
```

**Why This Breaks:**
1. "Premium," "exclusive," "unlock" — paywall language alienates caregivers who already feel financially strained
2. "Gold, silver, bronze" — tiered naming implies the cheaper option is inferior
3. "Invest in yourself" — corporate self-help framing, not caregiver-empathetic

**The Fix:**

```njk
<h2>Group Life Coaching</h2>
<p>Group coaching designed specifically for caregivers of individuals with
   disabilities. A safe space to process challenges, set goals, build
   resilience, and connect with others who understand your journey.</p>
<a href="/contact/?subject=partnership" class="btn-primary">Get Started</a>
```

Lead with the human need. Discuss pricing in the contact conversation, not on the marketing page.

**When You Might Be Tempted:** When adding pricing tiers, launch promotions, or upsell flows. Always check: does this copy sound like it's helping a caregiver or selling to a customer?

## Pricing and Services Copy Checklist

Copy this checklist when writing or editing revenue-facing copy:

- [ ] Service descriptions lead with the caregiver's need, not feature specs
- [ ] No paywall language ("premium," "exclusive," "unlock," "tier")
- [ ] Revenue channels are framed as mission fulfillment, not business operations
- [ ] Shop copy connects products to identity/advocacy, not just merchandise
- [ ] Pre-launch sections use "Notify Me" or "Get Notified" — not "Sign Up"
- [ ] The three-phase approach on the about page stays mission-framed
- [ ] CTAs on services pages link to contact form (soft conversion), not hard checkout
- [ ] No fabricated urgency ("Limited spots!" "Enroll before...!")

## Related Skills

- See the **structuring-offer-ladders** skill for service tier strategy
- See the **clarifying-market-fit** skill for ICP and positioning decisions
- See the **crafting-page-messaging** skill for writing new services copy
- See the **designing-lifecycle-messages** skill for nurturing leads from services pages
