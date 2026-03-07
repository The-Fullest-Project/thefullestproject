# Conversion Optimization Reference

## Contents
- Conversion Surfaces in This Codebase
- CTA Copy Patterns
- Form Conversion Copy
- Newsletter Signup Optimization
- Resource Submission Funnel
- WARNING: Generic CTA Anti-Pattern
- Voice-Aligned Conversion Checklist

## Conversion Surfaces in This Codebase

This is a **static Eleventy site** with no authentication or payment flows. "Conversion" means getting a caregiver to take one of these actions:

| Action | Surface | File |
|--------|---------|------|
| Browse resources | Resource directory | `src/pages/resources.njk` |
| Submit a resource | Formspree form | `src/pages/submit-resource.njk` |
| Subscribe to newsletter | Formspree form (homepage + footer) | `src/pages/index.njk`, `src/_includes/components/footer.njk` |
| Contact the team | Formspree form | `src/pages/contact.njk` |
| Sign up for gig platform | Formspree form | `src/pages/services/index.njk` |

Every conversion surface must use brand voice — warm, specific, and empowering.

## CTA Copy Patterns

### DO: Verb + Specific Noun

```njk
{# src/pages/index.njk — hero CTA #}
<a href="/resources/" class="btn-secondary text-lg px-8 py-4 no-underline">Find Resources</a>

{# src/pages/resources.njk — bottom CTA #}
<a href="/submit-resource/" class="btn-primary no-underline">Submit a Resource</a>

{# src/pages/about.njk — community CTA #}
<a href="/contact/" class="inline-block px-8 py-3 bg-white/20 ...">Get in Touch</a>
```

### DON'T: Vague or Passive Labels

```njk
{# BAD — tells the visitor nothing about the outcome #}
<a href="/resources/" class="btn-primary">Learn More</a>
<a href="/about/" class="btn-secondary">Click Here</a>
<a href="/services/" class="btn-primary">See Details</a>
```

**Why this breaks:** Caregivers are scanning under stress. A vague CTA forces them to guess what happens next, which increases bounce. "Find Resources" tells them exactly what they get.

### Pattern: Section CTA Cards

Every educational page (therapy guide, school/IEP, adaptive equipment) should end with a CTA card funneling readers to the resource directory:

```njk
<div class="mt-12 text-center card p-8">
  <h2 class="text-2xl font-bold mb-4" style="color: var(--color-primary);">
    Find Therapy Providers Near You
  </h2>
  <p class="mb-6" style="color: var(--color-text-light);">
    Search our directory for therapy providers in your area.
  </p>
  <a href="/resources/?category=therapy" class="btn-primary no-underline">
    Browse Therapy Providers
  </a>
</div>
```

The CTA button text should match the category filter it links to — don't say "Find Resources" when you can say "Browse Therapy Providers."

## Form Conversion Copy

### Lead-In Copy Formula

**Qualify the visitor** + **state the impact of their action**.

```njk
{# src/pages/submit-resource.njk — form intro #}
<p class="text-center mb-12 max-w-2xl mx-auto" style="color: var(--color-text-light);">
  Know of a program, service, or organization that supports individuals
  with disabilities? Help us build a more complete directory by sharing it below.
</p>
```

### DON'T: Start Forms Without Context

```njk
{# BAD — no motivation to complete the form #}
<h1>Submit a Resource</h1>
<form>...</form>
```

**Why this breaks:** Without the lead-in, the visitor doesn't understand why their submission matters or who it helps. The form feels transactional instead of community-driven.

## Newsletter Signup Optimization

Two newsletter placements exist: homepage section and footer component.

```njk
{# src/pages/index.njk — homepage newsletter #}
<h2>Stay Connected</h2>
<p>Get updates on new resources, blog posts, podcast episodes,
   and community news delivered to your inbox.</p>

{# src/_includes/components/footer.njk — footer newsletter #}
<h3>Stay Connected</h3>
<p>Get updates on new resources, blog posts, and community news.</p>
```

**Voice rule:** The newsletter promise must be specific. "Stay Connected" works as a heading only because the body copy lists exactly what subscribers receive.

### WARNING: Newsletter Copy Without Specifics

**The Problem:**
```njk
<h2>Subscribe to Our Newsletter</h2>
<p>Sign up to stay up to date.</p>
```

**Why This Breaks:**
1. "Stay up to date" is meaningless — up to date on what?
2. No reason to trust the email won't be spam
3. Misses the chance to reinforce the value proposition

**The Fix:**
```njk
<h2>Stay Connected</h2>
<p>Get updates on new resources, blog posts, podcast episodes,
   and community news delivered to your inbox.</p>
```

## Resource Submission Funnel

The submission form is a critical growth loop (see [growth-engineering](growth-engineering.md)). Voice must make submitters feel like community contributors, not data entry clerks.

```njk
{# src/pages/resources.njk — mid-page prompt #}
<h2>Know a Resource We're Missing?</h2>
<p>Help us grow our directory by submitting resources you know about.</p>
<a href="/submit-resource/" class="btn-primary">Submit a Resource</a>
```

**Why this works:** "We're Missing" admits imperfection (builds trust). "Help us grow" frames the visitor as a partner.

## Voice-Aligned Conversion Checklist

Copy this checklist when optimizing any conversion surface:

- [ ] CTA uses verb + specific noun (not "Learn More")
- [ ] Form has lead-in copy that qualifies the visitor and states impact
- [ ] Newsletter promise lists specific content types subscribers receive
- [ ] Empty states redirect to a related action (never a dead end)
- [ ] Page `description` front matter includes a search-relevant keyword
- [ ] Stats use live data from `_data/resources/` via Eleventy filters
- [ ] Tone is peer-to-peer — "we" (org) speaking to "you" (caregiver)

## Related Skills

- See the **crafting-page-messaging** skill for writing new CTA and hero copy
- See the **tuning-landing-journeys** skill for page-flow and CTA placement strategy
- See the **mapping-conversion-events** skill for tracking which CTAs drive actions
- See the **eleventy** skill for wiring `allResources` data into stats sections
