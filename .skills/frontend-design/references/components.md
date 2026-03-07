# Components Reference

## Contents
- Card
- Buttons
- Tags
- Forms
- Filter Controls
- WARNING: Component Anti-Patterns

## Card

The `.card` class in `src/css/styles.css` provides the base container with hover lift:

```css
.card {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  transition: box-shadow 0.2s, transform 0.2s;
}
.card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  transform: translateY(-2px);
}
```

### Card as Link (Clickable Card)

Used on the homepage for section navigation:

```njk
<a href="/resources/" class="card p-8 no-underline block" style="color: var(--color-text);">
  <div class="text-4xl mb-4" aria-hidden="true">&#x1F4CD;</div>
  <h3 class="text-xl font-bold mb-3" style="color: var(--color-primary);">Resource Directory</h3>
  <p style="color: var(--color-text-light);">Description text here.</p>
</a>
```

Key details: `no-underline` removes link decoration, `block` makes entire card clickable, `style` overrides link color.

### Card as Container (Non-clickable)

Used for content blocks like founder bios and filter bars:

```njk
<div class="card p-8">
  <h3 class="text-xl font-bold mb-3" style="color: var(--color-secondary);">Phase 1: Title</h3>
  <p style="color: var(--color-text-light);">Content paragraph.</p>
</div>
```

### Resource Card (Data-Driven)

Rendered from JSON data with `data-*` attributes for client-side filtering:

```njk
<div class="card p-6 resource-card"
     data-location="{{ resource.location }}"
     data-category="{{ resource.category | join(',') }}"
     data-name="{{ resource.name | lower }}"
     data-description="{{ resource.description | lower }}">
  <h3 class="text-lg font-bold" style="color: var(--color-primary);">{{ resource.name }}</h3>
  <div class="flex flex-wrap gap-2 mb-3">
    {% for cat in resource.category %}
    <span class="tag" style="background-color: var(--color-warm); color: var(--color-primary);">{{ cat }}</span>
    {% endfor %}
  </div>
  <p class="text-sm mb-4" style="color: var(--color-text-light);">{{ resource.description }}</p>
  {% if resource.website %}
  <a href="{{ resource.website }}" target="_blank" rel="noopener noreferrer"
     class="text-sm font-semibold no-underline inline-block mt-2" style="color: var(--color-secondary);">
    Visit Website &rarr;
  </a>
  {% endif %}
</div>
```

See the **javascript** skill for the `resourceFilter.js` that reads `data-*` attributes.

## Buttons

Two custom button classes plus an inline ghost variant:

### `.btn-primary` — Teal, solid

```njk
<a href="/contact/" class="btn-primary no-underline">Contact</a>
<button type="submit" class="btn-primary w-full text-center text-lg">Submit</button>
```

### `.btn-secondary` — Amber, solid

```njk
<a href="/resources/" class="btn-secondary text-lg px-8 py-4 no-underline">Find Resources</a>
<button type="submit" class="btn-secondary text-sm text-center">Subscribe</button>
```

### Ghost Button — White/transparent on colored backgrounds

Not a CSS class — built inline for CTA sections:

```njk
<a href="/about/" class="bg-white/20 hover:bg-white/30 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors no-underline">
  Learn More
</a>
```

### WARNING: Button as Link Anti-Pattern

**The Problem:**

```njk
{# BAD — Button class on <a> without no-underline #}
<a href="/page/" class="btn-primary">Click Here</a>
```

**Why This Breaks:** Default link styling adds an underline that clashes with the button appearance, creating a visual inconsistency.

**The Fix:**

```njk
{# GOOD — Always add no-underline to button-styled links #}
<a href="/page/" class="btn-primary no-underline">Click Here</a>
```

## Tags

The `.tag` class creates pill-shaped category labels:

```css
.tag {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

Always style with warm background + primary text:

```njk
<span class="tag" style="background-color: var(--color-warm); color: var(--color-primary);">{{ category }}</span>
```

## Forms

All form inputs use `.form-input`. Labels are `block text-sm font-semibold mb-2`. Form containers use `space-y-6` for consistent vertical spacing.

```njk
<div>
  <label for="email" class="block text-sm font-semibold mb-2">Email</label>
  <input type="email" id="email" name="email" required class="form-input" placeholder="your@email.com">
</div>
```

For select dropdowns inside forms, use `.form-input` (not `.filter-select`):

```njk
<select id="subject" name="subject" class="form-input">
  <option value="general">General Inquiry</option>
</select>
```

For inline newsletter forms (footer, CTA banners), use flex layout:

```njk
<form class="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
  <label for="email-id" class="sr-only">Email address</label>
  <input type="email" id="email-id" name="email" placeholder="Enter your email" required class="form-input flex-grow">
  <button type="submit" class="btn-secondary whitespace-nowrap">Subscribe</button>
</form>
```

## Filter Controls

`.filter-select` is distinct from `.form-input` — smaller padding, used exclusively in the resource filter bar:

```njk
<div>
  <label for="location-filter" class="block text-sm font-semibold mb-2">Location</label>
  <select id="location-filter" class="filter-select">
    <option value="">All Locations</option>
    <option value="Northern Virginia">Northern Virginia</option>
  </select>
</div>
```

## WARNING: Component Anti-Patterns

### Mixing `.form-input` and `.filter-select`

`.form-input` is for full forms. `.filter-select` is for the resource filter bar. Using `.form-input` for filter dropdowns creates oversized controls. Using `.filter-select` in forms creates undersized inputs.

### Inline Styles Without Custom Properties

**The Problem:**

```njk
{# BAD — Hardcoded hex colors #}
<h2 style="color: #2B6B4F;">Title</h2>
```

**Why This Breaks:** If brand colors change in `@theme`, hardcoded values won't update. Creates maintenance burden and potential inconsistency.

**The Fix:**

```njk
{# GOOD — Custom properties from @theme #}
<h2 style="color: var(--color-primary);">Title</h2>
```

See the **tailwind** skill for `@theme` token configuration.
