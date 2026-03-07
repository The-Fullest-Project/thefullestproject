# Conversion Optimization Reference

## Contents
- Conversion Surfaces in This Codebase
- CTA Hierarchy Pattern
- Newsletter Signup Optimization
- Resource Submission Funnel
- Form Friction Reduction
- Anti-Patterns

## Conversion Surfaces in This Codebase

This is a **static Eleventy site with Formspree forms** — there are no server-side A/B tests, no dynamic personalization, no paywall. Conversion optimization means maximizing form submissions (newsletter, contact, resource submission) and resource directory engagement through copy, layout, and CTA placement.

| Surface | File | Conversion Goal |
|---------|------|-----------------|
| Homepage hero | `src/pages/index.njk` | Click "Find Resources" or "Learn More" |
| Newsletter section | `src/pages/index.njk`, footer | Email signup via Formspree |
| Resource submit CTA | `src/pages/resources.njk` | Navigate to `/submit-resource/` |
| Contact form | `src/pages/contact.njk` | Form submission |
| Gig platform waitlist | `src/pages/services/index.njk` | Email capture with hidden `interest` field |
| Services CTAs | `src/pages/services/index.njk` | Navigate to contact with `?subject=` param |

## CTA Hierarchy Pattern

Every page should have **one primary CTA** and optionally one secondary. Never compete with three equal-weight buttons.

```njk
{# GOOD — clear primary/secondary hierarchy from index.njk #}
<div class="flex flex-col sm:flex-row gap-4 justify-center">
  <a href="/resources/" class="btn-secondary text-lg px-8 py-4 no-underline">Find Resources</a>
  <a href="/about/" class="bg-white/20 hover:bg-white/30 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors no-underline">Learn More</a>
</div>
```

```njk
{# BAD — three equal-weight CTAs cause decision paralysis #}
<div class="flex gap-4 justify-center">
  <a href="/resources/" class="btn-primary">Find Resources</a>
  <a href="/about/" class="btn-primary">Learn More</a>
  <a href="/contact/" class="btn-primary">Contact Us</a>
</div>
```

**Why this breaks:** Equal visual weight across three buttons splits attention. Caregivers arriving stressed will click nothing. The `btn-secondary` (amber) draws the eye; the translucent button is clearly secondary.

## Newsletter Signup Optimization

The newsletter form appears in two locations — the homepage section and the footer. Both use Formspree.

```njk
{# src/pages/index.njk — newsletter with benefit-driven lead-in #}
<section class="py-16" style="background-color: var(--color-primary);">
  <div class="max-w-2xl mx-auto px-4 text-center text-white">
    <h2 class="text-3xl font-bold mb-4">Stay Connected</h2>
    <p class="mb-8 opacity-90">Get updates on new resources, blog posts, podcast
      episodes, and community news delivered to your inbox.</p>
    <form action="https://formspree.io/f/{{ site.formspree.newsletter }}" method="POST"
          class="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
      <label for="home-email" class="sr-only">Email address</label>
      <input type="email" id="home-email" name="email" placeholder="Enter your email"
             required class="form-input flex-grow" style="color: var(--color-text);">
      <button type="submit" class="btn-secondary whitespace-nowrap">Subscribe</button>
    </form>
  </div>
</section>
```

### DO / DON'T

| DO | DON'T | Why |
|----|-------|-----|
| State what the subscriber gets ("new resources, blog posts") | Say "Join our newsletter" | Caregivers need to know the ROI of their email |
| Use `sr-only` label on the input | Skip the label | Accessibility is a hard requirement — see the **frontend-design** skill |
| Single email field + submit | Ask for name, location, interests | Every extra field drops submission rate on a static form |

## Resource Submission Funnel

The submit-resource page is a **community contribution funnel** — the more resources submitted, the more valuable the directory becomes.

```njk
{# src/pages/resources.njk — CTA card at bottom of resource grid #}
<div class="mt-12 text-center card p-8">
  <h2 class="text-2xl font-bold mb-4" style="color: var(--color-primary);">
    Know a Resource We're Missing?
  </h2>
  <p class="mb-6" style="color: var(--color-text-light);">
    Help us grow our directory by submitting resources you know about.
  </p>
  <a href="/submit-resource/" class="btn-primary no-underline">Submit a Resource</a>
</div>
```

**Optimization levers:**
1. Place this CTA **after** the user has scrolled the resource grid — they've seen the value and may know gaps
2. The question format ("Know a Resource We're Missing?") is more effective than a statement because it triggers recall
3. "Help us grow" frames submission as community contribution, not free labor

## Form Friction Reduction

### WARNING: Overloading Formspree Forms With Optional Fields

**The Problem:**

```njk
{# BAD — too many fields for a submission form #}
<input type="text" name="resource-name" required>
<input type="text" name="website">
<input type="text" name="address">
<input type="text" name="phone">
<input type="text" name="contact-name">
<input type="email" name="contact-email">
<textarea name="hours"></textarea>
<select name="category">...</select>
<select name="location">...</select>
<textarea name="description" required></textarea>
```

**Why This Breaks:**
1. Formspree has no server-side validation beyond required fields — optional fields add visual noise with no data guarantee
2. Caregivers are time-poor; 10+ fields feel like a chore
3. Most optional fields will arrive empty, creating low-quality submissions

**The Fix:** Keep required fields minimal (name + description), make location/category easy dropdowns, make everything else optional and visually de-emphasized.

## Anti-Patterns

### WARNING: "Coming Soon" Without a Capture Mechanism

**The Problem:** Pages or sections labeled "Coming Soon" with no way to capture interest.

```njk
{# BAD — dead end #}
<span class="tag">Coming Soon</span>
<h2>Caregiver Gig Platform</h2>
<p>A gig-economy platform designed to empower caregivers.</p>
<a href="#" class="btn-primary">Coming Soon</a>
```

**The Fix:** The services page already does this correctly with a waitlist form:

```njk
{# GOOD — captures interest with hidden field for segmentation #}
<form action="https://formspree.io/f/{{ site.formspree.newsletter }}"
      method="POST" class="flex flex-col gap-2">
  <input type="hidden" name="interest" value="gig-platform">
  <input type="email" name="email" placeholder="Get notified at launch" class="form-input text-sm">
  <button type="submit" class="btn-secondary text-sm text-center">Notify Me</button>
</form>
```

The `hidden` interest field lets you segment subscribers by intent when the feature launches.

### WARNING: Repeating the Same CTA Target Everywhere

If every page funnels to `/resources/`, visitors who aren't ready for the directory have nowhere to go. Balance with newsletter, contact, and content CTAs. See the **orchestrating-feature-adoption** skill for cross-linking strategy.
