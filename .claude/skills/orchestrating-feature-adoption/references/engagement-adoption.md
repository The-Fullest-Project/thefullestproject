# Engagement & Adoption Reference

## Contents
- Cross-Section Linking Strategy
- URL Param Deep Linking
- Newsletter Multi-Touch Strategy
- Resource Submission Funnel
- WARNING: Orphaned Content Sections
- WARNING: Missing Source Tracking on Forms
- Engagement Patterns by Page Type

## Cross-Section Linking Strategy

The site has six content sections (resources, therapy guide, equipment, IEP, blog, podcast) plus three engagement surfaces (contact, submit-resource, newsletter). Adoption depends on connecting these sections so visitors flow naturally between them.

### Current Cross-Links

| From Page | To Page | Mechanism |
|-----------|---------|-----------|
| Therapy Guide | Resources | `/resources/?category=therapy` |
| Equipment | Resources | `/resources/?category=equipment` |
| IEP Guide | Resources | `/resources/?category=legal` |
| Resources | Submit Resource | Bottom-of-page card |
| Homepage | All sections | Six-card grid + blog feed |
| Services | Contact | `/contact/?subject=partnership` |

### Adding a Cross-Link

```html
{# Pattern: contextual CTA at the end of any content section #}
<div class="mt-12 p-8 bg-gray-50 rounded-lg text-center">
  <h3 class="text-xl font-bold mb-2">{{ ctaHeading }}</h3>
  <p class="text-gray-600 mb-4">{{ ctaDescription }}</p>
  <a href="/resources/?category={{ relevantCategory }}" class="btn-primary">
    {{ ctaButtonText }}
  </a>
</div>
```

**DO:** Make every cross-link contextual. A therapy guide page links to therapy resources, not the generic resource page.

**DON'T:** Use generic "Learn More" or "Click Here" CTAs. The link text must communicate what the visitor gets.

## URL Param Deep Linking

`resourceFilter.js` reads URL search params on page load and applies them to the filter UI. This is the primary mechanism for contextual navigation.

### Supported Params

```javascript
// src/js/resourceFilter.js — params read on DOMContentLoaded
const urlParams = new URLSearchParams(window.location.search);
const locationParam = urlParams.get('location');
const categoryParam = urlParams.get('category');
```

### Usage Patterns

```html
{# Pre-filter by category #}
<a href="/resources/?category=therapy">Therapy Resources</a>

{# Pre-filter by location #}
<a href="/resources/?location=Virginia">Virginia Resources</a>

{# Pre-filter by both #}
<a href="/resources/?location=Virginia&category=therapy">VA Therapy</a>

{# Contact form with pre-selected subject #}
<a href="/contact/?subject=partnership">Partnership Inquiry</a>
```

**DO:** Always use URL params when linking to the resource page from a content section. A visitor clicking "Find Therapy Providers" should land on a filtered view, not the full directory.

**DON'T:** Link to `/resources/` without params from content pages. The unfiltered view is only appropriate from the top-level nav.

## Newsletter Multi-Touch Strategy

Newsletter capture appears in three locations. Each should include a hidden field to track the source.

```html
{# 1. Homepage — hero section #}
<form action="https://formspree.io/f/{{ site.formspree.newsletter }}" method="POST">
  <input type="hidden" name="source" value="homepage-hero">
  <input type="email" name="email" required class="form-input">
  <button type="submit" class="btn-primary">Subscribe</button>
</form>

{# 2. Footer — every page #}
<form action="https://formspree.io/f/{{ site.formspree.newsletter }}" method="POST">
  <input type="hidden" name="source" value="footer">
  <input type="email" name="email" required class="form-input">
  <button type="submit" class="btn-secondary">Subscribe</button>
</form>

{# 3. Services page — gig platform interest #}
<form action="https://formspree.io/f/{{ site.formspree.newsletter }}" method="POST">
  <input type="hidden" name="interest" value="gig-platform">
  <input type="hidden" name="source" value="services-gig">
  <input type="email" name="email" required class="form-input">
  <button type="submit" class="btn-primary">Notify Me</button>
</form>
```

### WARNING: Missing Source Tracking on Forms

**The Problem:**

```html
<!-- BAD — newsletter form with no source attribution -->
<form action="https://formspree.io/f/{{ site.formspree.newsletter }}" method="POST">
  <input type="email" name="email" required>
  <button type="submit">Subscribe</button>
</form>
```

**Why This Breaks:**
1. Formspree submissions all look identical — you cannot tell which page converted
2. Without source data, you cannot measure which CTAs drive signups
3. You lose the ability to segment newsletter subscribers by interest

**The Fix:**

```html
<!-- GOOD — hidden fields capture source and page context -->
<form action="https://formspree.io/f/{{ site.formspree.newsletter }}" method="POST">
  <input type="hidden" name="source" value="therapy-guide">
  <input type="hidden" name="interest" value="therapy">
  <input type="email" name="email" required class="form-input">
  <button type="submit" class="btn-primary">Subscribe</button>
</form>
```

## Resource Submission Funnel

The submit-resource form is a key engagement metric — visitors who submit resources are the most invested community members. The funnel has two entry points:

1. **Bottom of resource directory** — "Know a Resource We're Missing?" card
2. **Footer "Get Involved" section** — "Submit a Resource" link

### Maximizing Submission Rate

```html
{# Place submission nudge after resource cards, not in a sidebar #}
<div class="card text-center p-8 mt-8 border-2 border-dashed border-gray-300">
  <h3 class="text-xl font-bold mb-2" style="color: var(--color-primary);">
    Know a Resource We're Missing?
  </h3>
  <p class="text-gray-600 mb-4">
    Help other caregivers by sharing organizations and programs you've found helpful.
  </p>
  <a href="/submit-resource/" class="btn-secondary">Submit a Resource</a>
</div>
```

### WARNING: Orphaned Content Sections

**The Problem:** Content pages that don't connect back to the resource directory or engagement forms.

**Why This Breaks:** Every page that educates without offering a next step wastes the visitor's built-up intent. A caregiver who reads the entire IEP rights section is primed to search for legal advocates — if the page doesn't offer that path, they leave.

**The Fix:** Audit every content section for exit CTAs. See the Adoption Flow Checklist in SKILL.md.

## Engagement Patterns by Page Type

| Page Type | Primary Engagement Action | Secondary Action |
|-----------|--------------------------|------------------|
| Homepage | Find Resources CTA | Newsletter signup |
| Resource Directory | Filter + browse resources | Submit a resource |
| Guide Pages | Link to filtered resources | Newsletter signup |
| Blog/Podcast | Read content | Newsletter signup |
| Services | Contact for coaching | Gig platform waitlist |
| About | Find Resources CTA | Contact form |
| Contact | Submit inquiry | Newsletter signup (footer) |

See the **crafting-page-messaging** skill for CTA copy patterns and the **tuning-landing-journeys** skill for homepage conversion optimization.
