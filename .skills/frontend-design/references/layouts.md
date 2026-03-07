# Layouts Reference

## Contents
- Layout Chain
- Page Structure Patterns
- Grid Systems
- Responsive Breakpoints
- Container Widths
- WARNING: Layout Anti-Patterns

## Layout Chain

Templates chain through Nunjucks layouts. See the **nunjucks** skill for template syntax.

```
Content page (.njk/.md)
  └── layouts/page.njk or layouts/post.njk
        └── layouts/base.njk
```

### `base.njk` Structure

```html
<body class="min-h-screen flex flex-col">
  <a href="#main-content" class="skip-nav">Skip to main content</a>
  {% include "components/nav.njk" %}
  <main id="main-content" class="flex-grow">
    {{ content | safe }}
  </main>
  {% include "components/footer.njk" %}
</body>
```

`flex flex-col` + `flex-grow` on `<main>` ensures the footer sticks to the bottom on short pages.

### `page.njk` — Standard Content Pages

```njk
<div class="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
  {% if title %}
  <h1 class="text-4xl font-bold mb-8" style="color: var(--color-primary);">{{ title }}</h1>
  {% endif %}
  {{ content | safe }}
</div>
```

### `post.njk` — Blog/Podcast Articles

```njk
<article class="max-w-3xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
  <header class="mb-8">
    <p class="text-sm font-semibold uppercase tracking-wider mb-2" style="color: var(--color-secondary);">
      {{ category }}
    </p>
    <h1 class="text-4xl font-bold mb-4" style="color: var(--color-primary);">{{ title }}</h1>
    <div class="flex items-center gap-4 text-sm" style="color: var(--color-text-light);">
      <time>{{ date | dateFormat }}</time>
      {% if author %}<span>by {{ author }}</span>{% endif %}
    </div>
  </header>
  <div class="prose prose-lg max-w-none">{{ content | safe }}</div>
</article>
```

## Page Structure Patterns

Most pages follow a **section-based structure** with alternating backgrounds:

```njk
{# Hero or page header #}
<section class="py-16 section-warm">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <h1>...</h1>
  </div>
</section>

{# Content section — white background #}
<section class="py-16">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2>...</h2>
  </div>
</section>

{# Alternating warm section #}
<section class="py-16 section-warm">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2>...</h2>
  </div>
</section>

{# Full-color CTA banner #}
<section class="py-16" style="background-color: var(--color-primary);">
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
    <h2>...</h2>
  </div>
</section>
```

The pattern is: **hero/header > content sections (alternating white/warm) > CTA banner**. Pages consistently end with a colored CTA section.

## Grid Systems

### 3-Column Card Grid (Homepage, Resources)

```njk
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
  {# Cards here #}
</div>
```

### 2-Column Grid (Founder Bios)

```njk
<div class="grid grid-cols-1 md:grid-cols-2 gap-12">
  {# Content blocks #}
</div>
```

### 3-Column Equal Grid (Location Cards)

```njk
<div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
  {# Small cards #}
</div>
```

### 4-Column Footer Grid

```njk
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
  {# Footer sections #}
</div>
```

## Responsive Breakpoints

The project follows Tailwind's default breakpoints with mobile-first design:

| Breakpoint | Width | Typical Change |
|------------|-------|----------------|
| Default | 0px+ | Single column, stacked layout |
| `sm:` | 640px+ | Inline form layouts, 3-col location grid |
| `md:` | 768px+ | 2-column grids activate |
| `lg:` | 1024px+ | 3-4 column grids, desktop nav visible |

Navigation switches at `lg:` — mobile hamburger below, full menu bar above:

```njk
<ul class="hidden lg:flex items-center gap-6" role="menubar">...</ul>
<div id="mobile-menu" class="lg:hidden hidden pb-4" role="menu">...</div>
```

## Container Widths

| Content Type | Max Width | Example Pages |
|-------------|-----------|---------------|
| Card grids, resource lists | `max-w-7xl` | Homepage, Resources |
| Prose content, about text | `max-w-4xl` | About, page.njk layout |
| Blog/podcast articles | `max-w-3xl` | post.njk layout |
| Forms, CTA banners | `max-w-2xl` | Contact, Submit Resource |
| Inline newsletter forms | `max-w-md` | Footer, homepage CTA |

All containers include responsive horizontal padding: `px-4 sm:px-6 lg:px-8`.

## WARNING: Layout Anti-Patterns

### Missing Horizontal Padding

**The Problem:**

```njk
{# BAD — No padding, content touches edges on mobile #}
<div class="max-w-7xl mx-auto">
```

**Why This Breaks:** On mobile, content bleeds to screen edges with no breathing room. Every other section in the codebase uses `px-4 sm:px-6 lg:px-8`.

**The Fix:**

```njk
{# GOOD — Consistent responsive padding #}
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
```

### Wrong Container Width for Content Type

**The Problem:**

```njk
{# BAD — Full-width container for a single form #}
<section class="py-16">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <form class="space-y-6">...</form>
  </div>
</section>
```

**Why This Breaks:** Form inputs stretch to absurd widths on desktop. The contact and submit-resource pages use `max-w-2xl` for a reason — optimal reading/input width is 50-75 characters.

**The Fix:**

```njk
{# GOOD — Narrow container for form content #}
<section class="py-16">
  <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
    <form class="space-y-6">...</form>
  </div>
</section>
```

### Inconsistent Section Padding

Every `<section>` in the project uses `py-16` (or `py-20 lg:py-28` for the hero). NEVER use `py-8`, `py-12`, or other values — it breaks the vertical rhythm that makes the site feel cohesive.

See the **eleventy** skill for how layouts, collections, and passthrough copies are configured.
