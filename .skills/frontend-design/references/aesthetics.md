# Aesthetics Reference

## Contents
- Color System
- Typography
- Visual Identity
- WARNING: Color Application Anti-Patterns
- Iconography

## Color System

All colors are defined as Tailwind 4.x `@theme` tokens in `src/css/styles.css` and applied via CSS custom properties.

| Token | Hex | Semantic Use |
|-------|-----|-------------|
| `--color-primary` | `#2B6B4F` | Headings, links, nav logo, CTA backgrounds |
| `--color-primary-light` | `#3D9970` | Hero gradient midpoint |
| `--color-primary-dark` | `#1E4D39` | Button hover, footer background |
| `--color-secondary` | `#E8913A` | Primary CTA buttons, phase headings, "Visit Website" links |
| `--color-secondary-light` | `#F0A85C` | Reserved for lighter amber accents |
| `--color-accent` | `#5B8DB8` | Phone links, focus-visible outlines |
| `--color-accent-light` | `#7CADD4` | Reserved for lighter blue accents |
| `--color-warm` | `#F5E6D3` | Tag backgrounds, warm section backgrounds |
| `--color-warm-light` | `#FBF5ED` | `.section-warm` alternating backgrounds |
| `--color-text` | `#2D3436` | Primary body text, strong emphasis |
| `--color-text-light` | `#636E72` | Secondary text, descriptions, metadata |
| `--color-success` | `#27AE60` | Success states |
| `--color-error` | `#E74C3C` | Error states |

### Color Pairing Rules

Primary (`teal`) and secondary (`amber`) are the dominant brand pair. Use them with intent:

```njk
{# Heading — always primary #}
<h2 class="text-3xl font-bold mb-6" style="color: var(--color-primary);">Section Title</h2>

{# Subheading — secondary for phase/step labels #}
<h3 class="text-xl font-bold mb-3" style="color: var(--color-secondary);">Phase 1: Name</h3>

{# Body text — text-light for descriptions #}
<p style="color: var(--color-text-light);">Description paragraph.</p>

{# Emphasis within body — full text color #}
<strong style="color: var(--color-text);">Key point.</strong>
```

### Hero Gradient

The hero uses a three-stop diagonal gradient — primary to primary-light to accent:

```css
.hero-gradient {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 50%, var(--color-accent) 100%);
}
```

NEVER simplify this to a two-color gradient. The three stops create depth that distinguishes the hero from flat primary backgrounds used in CTA banners.

## Typography

| Element | Font | Weight | Line Height | Size Range |
|---------|------|--------|-------------|------------|
| Headings (h1-h6) | Nunito | 700 | 1.3 | `text-lg` to `text-6xl` |
| Hero h1 | Nunito | 800 (`font-extrabold`) | 1.3 | `text-4xl sm:text-5xl lg:text-6xl` |
| Body | Open Sans | 400 | 1.7 | Base (`1rem`) |
| Labels | Open Sans | 600 | Default | `text-sm` |
| Tags | Open Sans | 600 | Default | `text-xs` + `uppercase tracking-wider` |
| Metadata (dates) | Open Sans | 400 | Default | `text-xs` or `text-sm` |

### Font Loading

Fonts load via Google Fonts in `base.njk` `<head>`:

```html
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Open+Sans:wght@400;500;600&display=swap" rel="stylesheet">
```

The `display=swap` ensures text renders immediately with fallback fonts.

### WARNING: Typography Anti-Patterns

**The Problem:**

```njk
{# BAD — Using Tailwind font classes instead of theme fonts #}
<h2 class="font-sans text-3xl">Title</h2>
```

**Why This Breaks:**
1. Tailwind's default `font-sans` resolves to system fonts, not Nunito
2. Creates visual inconsistency — some headings look different from others
3. The `@theme` declaration already sets `--font-heading` globally on h1-h6

**The Fix:**

Headings inherit Nunito automatically from `styles.css`. Only use explicit `font-family` when an element isn't a heading tag:

```njk
{# GOOD — Logo uses explicit font-heading since it's an <a> tag #}
<a href="/" style="font-family: var(--font-heading); color: var(--color-primary);">The Fullest Project</a>
```

## Visual Identity

The Fullest Project's visual identity centers on **warmth and trust**:

- **Teal green** evokes growth, health, and reliability — appropriate for a caregiver resource hub
- **Warm amber** provides energy and approachability — used sparingly for CTAs and highlights
- **Cream backgrounds** (`.section-warm`) create a cozy, non-clinical feel that distinguishes this site from typical healthcare directories
- **Rounded corners** (`rounded-lg`, `rounded-xl` on cards) soften the interface

NEVER shift the palette toward clinical blues/whites or cold grays. The warm-toned palette is a deliberate choice to feel welcoming, not institutional.

## Iconography

Icons are Unicode emoji characters with `aria-hidden="true"`:

```njk
<div class="text-4xl mb-4" aria-hidden="true">&#x1F4CD;</div>
```

This approach avoids icon library dependencies. When adding new card icons, use meaningful emoji that maps to the section content. Current mappings:

| Section | Emoji | Code |
|---------|-------|------|
| Resource Directory | Pin | `&#x1F4CD;` |
| Therapy Guide | Brain | `&#x1F9E0;` |
| Adaptive Equipment | Wheelchair | `&#x267F;` |
| School & IEP | Graduation | `&#x1F393;` |
| Blog | Memo | `&#x1F4DD;` |
| Podcast | Headphones | `&#x1F3A7;` |
