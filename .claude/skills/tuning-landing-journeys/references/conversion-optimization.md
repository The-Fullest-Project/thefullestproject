# Conversion Optimization Reference

## Contents
- Conversion Endpoints in This Project
- CTA Hierarchy Patterns
- Form Optimization
- Pre-Filtered Resource Handoffs
- WARNING: Anti-Patterns
- Optimization Checklist

## Conversion Endpoints in This Project

Every conversion on this static site terminates at one of three Formspree endpoints or an external resource link. There is no client-side routing, no auth flow, no paywall — just HTML pages leading to forms.

| Endpoint | Location | Purpose |
|----------|----------|---------|
| `site.formspree.newsletter` | Homepage, footer, services page | Email capture |
| `site.formspree.contact` | `/contact/` | Inquiries, partnerships, stories |
| `site.formspree.submitResource` | `/submit-resource/` | Community resource contributions |
| External resource URLs | `/resources/` cards | Resource discovery (primary value) |

## CTA Hierarchy Patterns

### Dual-CTA Hero (Homepage)

The homepage hero demonstrates the correct primary/secondary CTA pattern:

```njk
{# src/pages/index.njk — hero section #}
<a href="/resources/" class="btn-secondary px-8 py-4 text-lg">Find Resources</a>
<a href="/about/" class="border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white/10">
  Learn More
</a>
```

**Why this works:** `btn-secondary` (amber) draws the eye for the primary action. The ghost button provides a low-commitment alternative without competing visually.

### Single-CTA Sections

```njk
{# GOOD — one action per section, centered #}
<section class="py-12 text-center">
  <div class="card p-8 max-w-2xl mx-auto">
    <h2>Know a Resource We're Missing?</h2>
    <p class="mt-2">Help us grow our directory...</p>
    <a href="/submit-resource/" class="btn-primary mt-4 inline-block">Submit a Resource</a>
  </div>
</section>
```

```njk
{# BAD — competing CTAs in the same section dilute intent #}
<section>
  <a href="/submit-resource/" class="btn-primary">Submit a Resource</a>
  <a href="/contact/" class="btn-primary">Contact Us</a>
  <a href="/resources/" class="btn-secondary">Browse Resources</a>
</section>
```

**Why competing CTAs break:** Each additional equal-weight CTA in a section reduces click-through on ALL of them. A visitor with three equal choices often chooses none.

## Form Optimization

### Contact Form Subject Pre-Population

The services page links to the contact form with a pre-populated subject:

```njk
{# src/pages/services/index.njk #}
<a href="/contact/?subject=partnership" class="btn-primary">Learn More</a>
```

This reduces friction — one fewer field to fill. Extend this pattern for any page that feeds the contact form.

### WARNING: Missing Form Success States

**The Problem:**

```njk
{# Current: form submits to Formspree with no on-page confirmation #}
<form action="https://formspree.io/f/{{ site.formspree.contact }}" method="POST">
  {# ... fields ... #}
  <button type="submit" class="btn-primary w-full">Send Message</button>
</form>
```

**Why This Breaks:**
1. Formspree redirects to its own thank-you page by default — the visitor leaves your site
2. No opportunity to suggest a next action (browse resources, read blog, etc.)
3. Breaks the journey; the visitor has no reason to return

**The Fix:**

```njk
{# Add a _next hidden field to redirect back to your site #}
<form action="https://formspree.io/f/{{ site.formspree.contact }}" method="POST">
  <input type="hidden" name="_next" value="{{ site.url }}/thank-you/">
  {# ... fields ... #}
  <button type="submit" class="btn-primary w-full">Send Message</button>
</form>
```

Then create a `/thank-you/` page with next-step CTAs. See the **eleventy** skill for adding the page template.

### Newsletter Form Field Minimalism

```njk
{# GOOD — single field, low friction #}
<form action="https://formspree.io/f/{{ site.formspree.newsletter }}" method="POST">
  <input type="email" name="email" placeholder="Your email" required class="form-input">
  <button type="submit" class="btn-primary">Subscribe</button>
</form>
```

NEVER add name, phone, or preference fields to a newsletter signup. Every additional field reduces completion rate by ~15%.

## Pre-Filtered Resource Handoffs

Educational pages link to the resource directory with URL params that `resourceFilter.js` reads on page load:

```javascript
// src/js/resourceFilter.js — reads URL params
const urlParams = new URLSearchParams(window.location.search);
const locationParam = urlParams.get('location');
const categoryParam = urlParams.get('category');
```

**Active handoff links in the codebase:**

| Source Page | Link | Param |
|-------------|------|-------|
| Therapy Guide | `/resources/?category=therapy` | category=therapy |
| Adaptive Equipment | `/resources/?category=equipment` | category=equipment |
| School & IEP | `/resources/?category=legal` | category=legal |

### WARNING: Broken Category Slugs

**The Problem:** If the `?category=` param doesn't exactly match a value in the resource card's `data-category` attribute, the filter silently shows zero results.

**The Fix:** Always verify the slug exists in the resource data before adding a pre-filtered link. The category values are set in `src/pages/resources.njk`:

```njk
data-category="{{ resource.category | join(',') }}"
```

Validate against the actual JSON in `src/_data/resources/` before creating new handoff links.

## Optimization Checklist

Copy this checklist when optimizing any landing page:

- [ ] Page has ONE primary CTA above the fold
- [ ] Primary CTA uses `btn-secondary` (amber) or `btn-primary` (teal) — not both at equal weight
- [ ] Secondary CTA is visually subordinate (ghost/outline style)
- [ ] Sections alternate backgrounds for visual rhythm
- [ ] Newsletter signup appears on pages > 3 scroll heights
- [ ] Forms include `_next` hidden field pointing to a thank-you page
- [ ] Pre-filtered `/resources/?category=X` links use verified category slugs
- [ ] Mobile layout stacks CTAs vertically, primary on top
- [ ] Empty states (no blog posts, no podcast episodes) include a newsletter CTA

### Validation Loop

1. Edit the page template in `src/pages/`
2. Run `npm run dev` and check the page in browser
3. Verify CTA visibility, section order, and mobile layout
4. If the page links to `/resources/?category=X`, test the filter works
5. Repeat until all checklist items pass
