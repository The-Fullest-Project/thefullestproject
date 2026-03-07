---
name: frontend-design
description: |
  Designs UI with Tailwind 4.x custom components, brand color tokens, and accessible Nunjucks patterns for The Fullest Project.
  Use when: creating new pages, adding UI components, styling elements, choosing colors, building forms, or making layout decisions.
allowed-tools: Read, Edit, Write, Glob, Grep, Bash
---

# Frontend Design Skill

The Fullest Project uses Tailwind 4.x with `@theme` design tokens in `src/css/styles.css`, Nunjucks templates, and a handful of custom component classes (`.card`, `.btn-primary`, `.btn-secondary`, `.tag`, `.form-input`, `.filter-select`). The visual identity is warm and trustworthy — teal primary, amber secondary, blue accent — with Nunito headings and Open Sans body text. All color application uses CSS custom properties via inline `style` attributes, NOT Tailwind color utilities.

## Quick Start

### New Page Skeleton

```njk
---
layout: layouts/base.njk
title: Page Title
description: "One-sentence page description."
permalink: /page-slug/
---

<section class="py-16">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h1 class="text-4xl font-bold mb-4 text-center" style="color: var(--color-primary);">Page Title</h1>
    <p class="text-center mb-12" style="color: var(--color-text-light);">Subtitle text.</p>
    <!-- Content here -->
  </div>
</section>
```

### Card Component

```njk
<a href="/path/" class="card p-8 no-underline block" style="color: var(--color-text);">
  <div class="text-4xl mb-4" aria-hidden="true">&#x1F4CD;</div>
  <h3 class="text-xl font-bold mb-3" style="color: var(--color-primary);">Card Title</h3>
  <p style="color: var(--color-text-light);">Card description text.</p>
</a>
```

### Button Pair (CTA Section)

```njk
<div class="flex flex-col sm:flex-row gap-4 justify-center">
  <a href="/primary-action/" class="btn-secondary text-lg px-8 py-4 no-underline">Primary CTA</a>
  <a href="/secondary-action/" class="bg-white/20 hover:bg-white/30 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors no-underline">Secondary CTA</a>
</div>
```

## Key Concepts

| Concept | Rule | Example |
|---------|------|---------|
| Brand colors | Always via `var(--color-*)`, never Tailwind `text-teal-*` | `style="color: var(--color-primary);"` |
| Headings | Nunito via `var(--font-heading)`, weight 700 | Set globally in `styles.css` |
| Body text | Open Sans via `var(--font-body)`, line-height 1.7 | Set globally in `styles.css` |
| Section padding | `py-16` standard, `py-20 lg:py-28` for hero | Consistent vertical rhythm |
| Content width | `max-w-7xl` for grids, `max-w-4xl` for prose, `max-w-2xl` for forms | Match existing pages |
| Alternating bg | `.section-warm` for every other section | Cream background variety |

## Common Patterns

### Form with Labels

**When:** Any user input form (contact, submit-resource, newsletter)

```njk
<form action="https://formspree.io/f/{{ site.formspree.contact }}" method="POST" class="space-y-6">
  <div>
    <label for="field-id" class="block text-sm font-semibold mb-2">Label</label>
    <input type="text" id="field-id" name="fieldName" required class="form-input" placeholder="Hint text">
  </div>
  <div>
    <button type="submit" class="btn-primary w-full text-center text-lg">Submit</button>
  </div>
</form>
```

### Full-Width CTA Banner

**When:** End of page, conversion action

```njk
<section class="py-16" style="background-color: var(--color-primary);">
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
    <h2 class="text-3xl font-bold mb-4">Heading</h2>
    <p class="mb-8 opacity-90">Supporting text.</p>
    <a href="/action/" class="btn-secondary no-underline">Call to Action</a>
  </div>
</section>
```

### Tag / Badge

**When:** Category labels on resource cards, blog posts

```njk
<span class="tag" style="background-color: var(--color-warm); color: var(--color-primary);">{{ category }}</span>
```

## Design Validation Checklist

Copy this checklist when building new pages:

- [ ] Colors use `var(--color-*)` custom properties, not Tailwind color classes
- [ ] Headings are primary color, body text is `--color-text` or `--color-text-light`
- [ ] Section padding uses `py-16` (standard) or `py-20 lg:py-28` (hero)
- [ ] Container uses appropriate `max-w-*` for content type
- [ ] Interactive elements have `no-underline` class on links styled as buttons
- [ ] Decorative elements have `aria-hidden="true"`
- [ ] Form inputs use `sr-only` labels when no visible label exists
- [ ] Focus states work (global `*:focus-visible` handles this)

## See Also

- [aesthetics](references/aesthetics.md) - Color system, typography, visual identity
- [components](references/components.md) - Cards, buttons, tags, forms, filters
- [layouts](references/layouts.md) - Page structure, grids, responsive patterns
- [motion](references/motion.md) - Transitions, hover states, micro-interactions
- [patterns](references/patterns.md) - DO/DON'T pairs, anti-patterns, consistency rules

## Related Skills

- See the **tailwind** skill for Tailwind 4.x `@theme` configuration and utility usage
- See the **nunjucks** skill for template syntax, includes, and data access
- See the **eleventy** skill for collections, filters, and build configuration
- See the **javascript** skill for client-side interactivity (menu toggle, resource filter)
- See the **crafting-page-messaging** skill for content hierarchy and CTA placement
- See the **tuning-landing-journeys** skill for page flow and conversion design
- See the **adding-structured-signals** skill for SEO-relevant markup patterns
