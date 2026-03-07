# Design Patterns Reference

## Contents
- Color Application Pattern
- Section Alternation Pattern
- Accessibility Patterns
- CTA Hierarchy Pattern
- WARNING: Design Anti-Patterns
- New Page Checklist

## Color Application Pattern

**Rule:** Brand colors are applied via `style="color: var(--color-*)"`, NEVER via Tailwind color classes.

### DO:

```njk
{# GOOD — Custom properties from @theme #}
<h2 style="color: var(--color-primary);">Title</h2>
<p style="color: var(--color-text-light);">Description</p>
<a href="/link/" style="color: var(--color-secondary);">Link &rarr;</a>
```

### DON'T:

```njk
{# BAD — Tailwind color utilities bypass the design token system #}
<h2 class="text-teal-700">Title</h2>
<p class="text-gray-500">Description</p>
<a href="/link/" class="text-amber-500">Link &rarr;</a>
```

**Why:** The project uses Tailwind 4.x `@theme` tokens that define brand colors as custom properties. Tailwind's default color palette (`teal-700`, `gray-500`) doesn't match the brand values. Using custom properties means a palette change in `@theme` propagates everywhere. See the **tailwind** skill for `@theme` configuration.

**Exception:** Tailwind utility colors are acceptable for:
- White text: `text-white` (no custom property needed)
- Opacity modifiers: `opacity-80`, `opacity-90`
- White background with opacity: `bg-white/20`

## Section Alternation Pattern

Pages use alternating section backgrounds to create visual rhythm:

```
Section 1: white (default)     or section-warm or hero-gradient
Section 2: section-warm             or white
Section 3: white                    or section-warm
...
Final: var(--color-primary) background (CTA banner)
```

### DO:

```njk
<section class="py-16">...</section>
<section class="py-16 section-warm">...</section>
<section class="py-16">...</section>
<section class="py-16" style="background-color: var(--color-primary);">...</section>
```

### DON'T:

```njk
{# BAD — Three consecutive white sections #}
<section class="py-16">...</section>
<section class="py-16">...</section>
<section class="py-16">...</section>
```

**Why:** Without background variation, sections visually merge and the page feels like a single undifferentiated wall of content. The warm/white alternation creates natural visual breaks that guide scanning.

## Accessibility Patterns

### Skip Navigation

Present on every page via `base.njk`:

```njk
<a href="#main-content" class="skip-nav">Skip to main content</a>
```

### ARIA Roles

```njk
<header role="banner">
<nav aria-label="Main navigation">
<ul role="menubar">
  <li role="none"><a role="menuitem">...</a></li>
</ul>
<footer role="contentinfo">
```

### Mobile Menu ARIA

```njk
<button id="mobile-menu-btn" aria-expanded="false" aria-controls="mobile-menu" aria-label="Toggle navigation menu">
```

The `aria-expanded` attribute is toggled by JavaScript. See the **javascript** skill for the event handler.

### Decorative Elements

```njk
{# Emoji icons on homepage cards — hidden from screen readers #}
<div class="text-4xl mb-4" aria-hidden="true">&#x1F4CD;</div>
```

### Screen Reader Labels

```njk
{# Footer newsletter — no visible label, so sr-only provides context #}
<label for="footer-email" class="sr-only">Email address</label>
<input type="email" id="footer-email" ...>
```

### DO:

```njk
{# GOOD — Every form input has a label #}
<label for="name" class="block text-sm font-semibold mb-2">Name</label>
<input type="text" id="name" name="name" class="form-input">
```

### DON'T:

```njk
{# BAD — No label, placeholder is not a substitute #}
<input type="text" name="name" class="form-input" placeholder="Name">
```

**Why:** Placeholders disappear when typing, leaving the user with no context. Screen readers may not announce placeholder text as a label. WCAG 2.1 requires programmatically associated labels.

## CTA Hierarchy Pattern

Each page ends with a clear call-to-action. The hierarchy is:

1. **Primary CTA** — `.btn-secondary` (amber, high contrast) for the main desired action
2. **Secondary CTA** — ghost button (`bg-white/20`) for alternative action
3. **Tertiary** — text link with `color: var(--color-secondary)` and arrow (`&rarr;`)

```njk
{# Full CTA banner — primary + secondary #}
<section class="py-16" style="background-color: var(--color-primary);">
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
    <h2 class="text-3xl font-bold mb-4">Join Our Community</h2>
    <p class="mb-8 opacity-90">Supporting text.</p>
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <a href="/resources/" class="btn-secondary no-underline">Find Resources</a>
      <a href="/contact/" class="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-semibold transition-colors no-underline">Get in Touch</a>
    </div>
  </div>
</section>
```

Note: `.btn-secondary` (amber) is used as the **primary** CTA button because it creates maximum contrast against the teal background. `.btn-primary` (teal) would disappear against its own background color.

## WARNING: Design Anti-Patterns

### Generic AI Aesthetic

**The Problem:** Suggesting Inter/Roboto fonts, purple-blue gradients, glassmorphism effects, or generic SaaS patterns.

**Why This Breaks:** The Fullest Project has a deliberate warm, trust-building identity for caregivers. Clinical or trendy tech aesthetics undermine the emotional connection. Nunito + Open Sans were chosen specifically for their warmth and readability.

### Overusing the Secondary Color

**The Problem:**

```njk
{# BAD — Amber everywhere #}
<h2 style="color: var(--color-secondary);">Section Title</h2>
<p style="color: var(--color-secondary);">Body text in amber.</p>
<a style="color: var(--color-secondary);">Link</a>
```

**Why This Breaks:** Secondary amber is a highlight color. Overuse dilutes its impact and reduces CTA visibility. In the codebase, amber is reserved for: CTA buttons, phase/step headings, "Visit Website" action links.

**The Fix:** Section headings are always `--color-primary`. Body text is `--color-text` or `--color-text-light`. Only action elements and step labels use `--color-secondary`.

### Adding Dark Mode

The project has no dark mode and should not have one added speculatively. The warm cream/white palette is core to the brand identity. Dark mode would require rethinking the entire color system, and the audience (caregivers seeking resources) doesn't typically expect it from a non-profit resource hub.

## New Page Checklist

Copy this checklist when creating a new page:

- [ ] Front matter includes `layout`, `title`, `description`, `permalink`
- [ ] Page starts with hero/header section (`section-warm` or `hero-gradient`)
- [ ] Sections alternate between white and `section-warm` backgrounds
- [ ] Page ends with a colored CTA banner (`background-color: var(--color-primary)`)
- [ ] All headings use `var(--color-primary)` except step/phase labels
- [ ] Body text uses `var(--color-text)` or `var(--color-text-light)`
- [ ] Links styled as buttons include `no-underline`
- [ ] Container width matches content type (7xl/4xl/3xl/2xl)
- [ ] All containers have `px-4 sm:px-6 lg:px-8` padding
- [ ] Section padding is `py-16` (standard) or `py-20 lg:py-28` (hero only)
- [ ] Decorative elements have `aria-hidden="true"`
- [ ] All form inputs have labels (visible or `sr-only`)

Validation loop:

1. Build the page: `npm run dev`
2. Check at mobile (375px), tablet (768px), and desktop (1280px) widths
3. Tab through all interactive elements — verify focus ring visibility
4. If any check fails, fix and rebuild
5. Only proceed when all responsive layouts and focus states work
