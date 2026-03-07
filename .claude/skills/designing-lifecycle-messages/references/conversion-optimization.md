# Conversion Optimization Reference

## Contents
- Newsletter Signup Conversion Points
- Form Friction Reduction
- CTA Placement Patterns
- WARNING: Missing Post-Submit Experience
- Segmentation via Hidden Fields
- Cross-Page Conversion Funnels

---

## Newsletter Signup Conversion Points

The site has three newsletter entry points. Each serves a different intent — optimize accordingly.

### Homepage "Stay Connected" (High Intent)

```njk
{# src/pages/index.njk lines 114-126 #}
<section class="py-16 text-center" style="background-color: var(--color-primary);">
  <h2 class="text-3xl font-bold text-white mb-4">Stay Connected</h2>
  <p class="text-white/90 mb-8 max-w-2xl mx-auto">
    Get updates on new resources, blog posts, podcast episodes, and community news delivered to your inbox.
  </p>
  <form action="https://formspree.io/f/{{ site.formspree.newsletter }}" method="POST">
    <input type="email" name="email" id="home-email" placeholder="Your email" required>
    <button type="submit" class="btn-primary">Subscribe</button>
  </form>
</section>
```

**Optimization levers:** This is the highest-intent placement — visitor scrolled past all content. Subject line in the welcome email should reference what they just browsed.

### Footer (Low Friction, Every Page)

```njk
{# src/_includes/components/footer.njk lines 37-47 #}
<h3 class="text-lg font-bold text-white mb-4">Stay Connected</h3>
<p class="text-white/70 mb-4">Get updates on new resources, blog posts, and community news.</p>
<form action="https://formspree.io/f/{{ site.formspree.newsletter }}" method="POST">
  <input type="email" name="email" id="footer-email" placeholder="Your email" required
         class="w-full px-4 py-2 rounded-lg">
  <button type="submit" class="w-full btn-primary mt-2">Subscribe</button>
</form>
```

**Optimization lever:** Footer converts on content pages (blog posts, guides). Add a hidden field to track which page the signup came from:

```njk
{# DO — track source page for lifecycle segmentation #}
<input type="hidden" name="source" value="{{ page.url }}">
```

### Gig Platform Notify (Product Interest)

```njk
{# src/pages/services/index.njk lines 65-70 #}
<input type="hidden" name="interest" value="gig-platform">
<input type="email" name="email" id="gig-email" required>
<button type="submit">Notify Me</button>
```

**Optimization lever:** This is product-launch intent, not general newsletter. The lifecycle sequence for this segment should be a launch countdown, not the standard welcome drip.

---

## Form Friction Reduction

### DO: Single-Field Newsletter Forms

The current newsletter forms ask only for email — this is correct. NEVER add name, location, or preference fields to the initial signup.

```njk
{# GOOD — single field, low friction #}
<input type="email" name="email" required>
<button type="submit">Subscribe</button>
```

```njk
{# BAD — adding fields kills conversion rate #}
<input type="text" name="name" required>
<input type="email" name="email" required>
<select name="location" required>...</select>
<button type="submit">Subscribe</button>
```

**Why:** Every additional field drops conversion 10-25%. Collect preferences in Email 2 or 3 of the welcome sequence, not at signup.

### DO: Match Submit Button Text to Intent

| Form | Current Button | Better Alternative |
|------|---------------|-------------------|
| Homepage newsletter | "Subscribe" | "Get Updates" (softer) |
| Footer newsletter | "Subscribe" | "Subscribe" (fine — footer is explicit) |
| Gig platform | "Notify Me" | "Notify Me" (correct — matches intent) |

---

## WARNING: Missing Post-Submit Experience

**The Problem:** All three newsletter forms submit to Formspree with no custom redirect. After submit, the user sees a generic Formspree "Thank you" page — completely off-brand.

**Why This Breaks:**
1. User leaves your site entirely (sees formspree.io domain)
2. No opportunity to deliver next-step CTA
3. Kills the momentum of the signup moment

**The Fix:** Add a `_next` hidden field pointing to a custom thank-you page:

```njk
{# Add to every Formspree form #}
<input type="hidden" name="_next" value="{{ site.url }}/thank-you/">
```

Then create `src/pages/thank-you.njk`:

```njk
---
layout: layouts/page.njk
title: "You're In!"
description: "Thanks for subscribing to The Fullest Project newsletter."
permalink: /thank-you/
---
<div class="text-center py-16 max-w-2xl mx-auto">
  <h1 class="text-4xl font-bold mb-4" style="color: var(--color-primary);">You're In!</h1>
  <p class="text-lg text-gray-600 mb-8">
    Check your inbox for a welcome message from hello@thefullestproject.org.
  </p>
  <div class="flex flex-col sm:flex-row gap-4 justify-center">
    <a href="/resources/" class="btn-primary">Browse Resources</a>
    <a href="/blog/" class="btn-secondary">Read the Blog</a>
  </div>
</div>
```

See the **eleventy** skill for adding this page to the build. See the **crafting-page-messaging** skill for writing the thank-you copy.

---

## Segmentation via Hidden Fields

Use Formspree hidden fields to route subscribers into different lifecycle sequences:

```njk
{# Pattern: tag every form with source and interest #}
<input type="hidden" name="source" value="homepage">
<input type="hidden" name="interest" value="general">

{# Pattern: gig platform interest #}
<input type="hidden" name="source" value="services">
<input type="hidden" name="interest" value="gig-platform">

{# Pattern: podcast launch interest #}
<input type="hidden" name="source" value="podcast">
<input type="hidden" name="interest" value="podcast-launch">
```

Your ESP webhook should route based on the `interest` field value to select the correct sequence.

---

## Cross-Page Conversion Funnels

Map how lifecycle emails drive visitors back to specific pages:

| Sequence | Email | CTA Destination | Conversion Goal |
|----------|-------|----------------|-----------------|
| Welcome (Day 0) | Welcome | /resources/ | First resource view |
| Welcome (Day 3) | Depth | /school-iep/ or /therapy-guide/ | Guide engagement |
| Welcome (Day 7) | Community | /submit-resource/ | Resource contribution |
| Gig Launch (Day 0) | Confirmation | /services/ | Re-read services page |
| Gig Launch (Launch Day) | Announcement | /services/#gig-platform | Platform signup |
| Re-engagement (Day 1) | "We miss you" | /resources/ | Return visit |

See the **mapping-conversion-events** skill for instrumenting these funnel steps. See the **tuning-landing-journeys** skill for optimizing the destination pages.
