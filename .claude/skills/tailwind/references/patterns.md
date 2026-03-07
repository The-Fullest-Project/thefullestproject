# Tailwind Patterns Reference

## Contents
- Section Layout Pattern
- Card Composition
- Responsive Navigation
- Form Layout
- Accessibility Patterns
- Anti-Patterns

---

## Section Layout Pattern

Every page section follows this container structure:

```html
<section class="py-16">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 class="text-3xl font-bold text-center mb-12" style="color: var(--color-primary);">Section Title</h2>
    <!-- content -->
  </div>
</section>
```

**Rules:**
- `max-w-7xl mx-auto` centers the container
- `px-4 sm:px-6 lg:px-8` provides responsive horizontal padding
- Alternating sections use `.section-warm` for visual rhythm
- Full-bleed colored sections use inline `style` on `<section>`:

```html
<section class="py-16" style="background-color: var(--color-primary);">
  <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
    <!-- newsletter CTA content -->
  </div>
</section>
```

---

## Card Composition

Cards combine the `.card` custom class with Tailwind utilities. The `.card` class handles box-shadow, border-radius, hover lift, and white background. Tailwind handles padding and internal layout.

### Standard Content Card

```html
<a href="/resources/" class="card p-8 no-underline block" style="color: var(--color-text);">
  <div class="text-4xl mb-4" aria-hidden="true">&#x1F4CD;</div>
  <h3 class="text-xl font-bold mb-3" style="color: var(--color-primary);">Resource Directory</h3>
  <p style="color: var(--color-text-light);">Description text here.</p>
</a>
```

### Resource Card (with data attributes for filtering)

```html
<div class="card p-6 resource-card"
     data-location="{{ resource.location }}"
     data-category="{{ resource.category | join(',') }}"
     data-name="{{ resource.name | lower }}"
     data-description="{{ resource.description | lower }}">
  <div class="flex items-start justify-between mb-3">
    <h3 class="text-lg font-bold" style="color: var(--color-primary);">{{ resource.name }}</h3>
  </div>
  <div class="flex flex-wrap gap-2 mb-3">
    {% for cat in resource.category %}
    <span class="tag" style="background-color: var(--color-warm); color: var(--color-primary);">{{ cat }}</span>
    {% endfor %}
  </div>
  <p class="text-sm mb-4" style="color: var(--color-text-light);">{{ resource.description }}</p>
  {% if resource.website %}
  <a href="{{ resource.website }}" target="_blank" rel="noopener noreferrer"
     class="text-sm font-semibold no-underline inline-block mt-2"
     style="color: var(--color-secondary);">Visit Website &rarr;</a>
  {% endif %}
</div>
```

**Key:** The `data-*` attributes are consumed by `resourceFilter.js` for client-side filtering. See the **javascript** skill for filter logic.

### Blog Post Card

```html
<article class="card overflow-hidden">
  <div class="p-6">
    <span class="tag" style="background-color: var(--color-warm); color: var(--color-primary);">{{ post.data.category or "Story" }}</span>
    <h3 class="text-lg font-bold mt-3 mb-2">
      <a href="{{ post.url }}" class="no-underline" style="color: var(--color-text);">{{ post.data.title }}</a>
    </h3>
    <p class="text-sm" style="color: var(--color-text-light);">{{ post.data.excerpt }}</p>
    <time class="text-xs mt-3 block" style="color: var(--color-text-light);">{{ post.date | dateFormat }}</time>
  </div>
</article>
```

### Card Grid

Cards always live in responsive grids:

```html
<!-- 1 → 2 → 3 columns -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

<!-- 1 → 2 → 4 columns (footer) -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

<!-- 1 → 3 columns (location cards) -->
<div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
```

---

## Responsive Navigation

Desktop nav is a horizontal flex list; mobile is a toggleable vertical menu. See the **nunjucks** skill for the component include pattern.

```html
<!-- Desktop: hidden on mobile, flex on lg -->
<ul class="hidden lg:flex items-center gap-6 text-sm font-medium" role="menubar">
  <li role="none">
    <a href="/" role="menuitem" class="no-underline hover:underline" style="color: var(--color-text);">Home</a>
  </li>
  <!-- CTA link uses btn-primary -->
  <li role="none">
    <a href="/contact/" role="menuitem" class="btn-primary text-sm no-underline">Contact</a>
  </li>
</ul>

<!-- Mobile: hidden by default, toggled via JS -->
<div id="mobile-menu" class="lg:hidden hidden pb-4" role="menu">
  <ul class="flex flex-col gap-3 text-sm font-medium">
    <li><a href="/" class="block py-2 no-underline" style="color: var(--color-text);">Home</a></li>
  </ul>
</div>
```

---

## Form Layout

Forms combine `.form-input` / `.filter-select` custom classes with Tailwind layout:

```html
<form action="https://formspree.io/f/{{ site.formspree.newsletter }}" method="POST"
      class="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
  <label for="home-email" class="sr-only">Email address</label>
  <input type="email" id="home-email" name="email" placeholder="Enter your email" required
    class="form-input flex-grow" style="color: var(--color-text);">
  <button type="submit" class="btn-secondary whitespace-nowrap">Subscribe</button>
</form>
```

**Pattern:** `flex-col` stacks on mobile, `sm:flex-row` goes horizontal on small screens. The `.form-input` class handles borders, padding, focus states. `flex-grow` makes the input fill remaining space.

---

## Accessibility Patterns

### Skip Navigation

Already in `base.njk` — never remove or modify:

```html
<a href="#main-content" class="skip-nav">Skip to main content</a>
```

### Screen-Reader-Only Labels

Use Tailwind's `sr-only` for inputs without visible labels:

```html
<label for="footer-email" class="sr-only">Email address</label>
```

### Decorative Elements

Hide decorative content from screen readers:

```html
<div class="text-4xl mb-4" aria-hidden="true">&#x1F4CD;</div>
```

### Focus Styles

Global `*:focus-visible` is set in `styles.css` using `--color-accent`. NEVER override with `outline-none` unless you provide an alternative visible focus indicator.

---

## Anti-Patterns

### WARNING: Tailwind Color Classes Instead of CSS Custom Properties

**The Problem:**

```html
<!-- BAD -->
<h2 class="text-teal-700 bg-amber-100">Title</h2>
<button class="bg-teal-600 hover:bg-teal-800 text-white">Click</button>
```

**Why This Breaks:**
1. Brand colors are defined as CSS custom properties in `@theme` — Tailwind color classes bypass them entirely
2. Changing the brand palette means hunting through every template instead of updating one `@theme` block
3. Produces inconsistent hex values across the site

**The Fix:**

```html
<!-- GOOD -->
<h2 style="color: var(--color-primary); background-color: var(--color-warm);">Title</h2>
<button class="btn-primary">Click</button>
```

### WARNING: Recreating Custom Component Styles with Utilities

**The Problem:**

```html
<!-- BAD — duplicating .card styles -->
<div class="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 p-6">
```

**Why This Breaks:**
1. Inconsistent shadow values, border-radius, and transition timings across cards
2. When the card design changes, you update one class vs. hunting every instance
3. Bloats the HTML with repeated utility strings

**The Fix:**

```html
<!-- GOOD — use the custom class, add only unique utilities -->
<div class="card p-6">
```

### WARNING: Removing outline-none Without Alternative Focus Indicator

**The Problem:**

```html
<!-- BAD -->
<button class="outline-none">Click me</button>
```

**Why This Breaks:**
1. Keyboard users cannot see which element is focused
2. Violates WCAG 2.1 SC 2.4.7 (Focus Visible)
3. The global `*:focus-visible` rule in this project uses `--color-accent` — removing it degrades accessibility

**The Fix:**

Never add `outline-none` to interactive elements. The global focus-visible style handles it.
