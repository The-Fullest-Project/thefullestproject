# Tailwind Workflows Reference

## Contents
- Adding a New Page Section
- Adding a New Custom Component Class
- Modifying Design Tokens
- Build and Dev Pipeline
- Debugging CSS Issues
- Adding a New Page

---

## Adding a New Page Section

Copy this checklist and track progress:
- [ ] Step 1: Choose section background (plain, `.section-warm`, or inline `style` with custom property)
- [ ] Step 2: Use the standard container wrapper
- [ ] Step 3: Add responsive grid if needed
- [ ] Step 4: Apply colors via inline `style` attributes, NOT Tailwind color classes
- [ ] Step 5: Verify at mobile, `sm`, `md`, and `lg` breakpoints

### Section Template

```html
<section class="py-16 section-warm">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 class="text-3xl font-bold text-center mb-4" style="color: var(--color-primary);">Section Title</h2>
    <p class="text-center mb-12" style="color: var(--color-text-light);">Subtitle or description.</p>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <!-- Card or content items -->
    </div>
  </div>
</section>
```

**Alternating backgrounds:** Alternate between plain `<section class="py-16">` and `<section class="py-16 section-warm">` for visual rhythm. Use a full-color section (`style="background-color: var(--color-primary);"`) for CTAs.

---

## Adding a New Custom Component Class

Only add a component class when the same set of styles appears 3+ times and includes hover/transition behavior that utilities alone cannot elegantly express.

### Where to Add

All custom classes go in `src/css/styles.css`, **after** the `@theme` block and base styles.

### Template

```css
/* Component name — brief purpose */
.component-name {
  /* Use CSS custom properties for brand values */
  background-color: var(--color-warm-light);
  border-radius: 0.5rem;
  padding: 1rem;
  transition: background-color 0.2s;
}

.component-name:hover {
  background-color: var(--color-warm);
}
```

### Validation

1. Add the class to `src/css/styles.css`
2. Use it in a template: `<div class="component-name">`
3. Run dev server: `npm run dev`
4. Verify the class appears in `_site/css/output.css`
5. If it doesn't appear, check that Tailwind's content scanning sees your `.njk` files

```bash
# Quick check: does the class exist in output?
grep "component-name" _site/css/output.css
```

### WARNING: Don't Create Component Classes for One-Off Styles

```css
/* BAD — used once on the about page */
.about-hero-special-margin {
  margin-top: 3rem;
  margin-bottom: 2rem;
}
```

Use Tailwind utilities directly: `class="mt-12 mb-8"`. Component classes are for **reusable patterns with interactive states**.

---

## Modifying Design Tokens

All design tokens live in the `@theme` block at the top of `src/css/styles.css`.

### Adding a New Color

```css
@theme {
  /* existing tokens... */
  --color-new-token: #HEX;
}
```

Then use it in templates:

```html
<div style="color: var(--color-new-token);">Content</div>
```

Or in custom classes:

```css
.some-class {
  background-color: var(--color-new-token);
}
```

### Changing an Existing Token

Update the hex value in `@theme`. Every template and custom class referencing that variable updates automatically — that's the point of the token system.

### Validation

1. Edit `src/css/styles.css`
2. Run `npm run dev`
3. Verify visually in browser
4. Check contrast ratios for text colors (WCAG AA: 4.5:1 for normal text, 3:1 for large text)

---

## Build and Dev Pipeline

### Development

```bash
npm run dev
```

Runs concurrently:
- `@tailwindcss/cli --watch` — recompiles CSS on any change to `src/css/styles.css` or templates
- `@11ty/eleventy --serve` — rebuilds HTML and serves at `localhost:8080`

**Input:** `src/css/styles.css` → **Output:** `_site/css/output.css`

### Production

```bash
npm run build
```

Runs sequentially:
1. `npm run build:11ty` — Eleventy generates `_site/`
2. `npm run build:css` — Tailwind compiles with `--minify`

**Order matters:** Eleventy must run first so `_site/` exists before Tailwind writes `output.css` into it.

### CSS-Only Build

```bash
npm run build:css
```

Useful when you only changed `styles.css` and don't need Eleventy to rebuild templates.

### Feedback Loop

1. Make CSS or template changes
2. Check browser at `localhost:8080` (auto-reloads in dev)
3. If styles don't apply, check the browser devtools for the computed property
4. If a class is missing from output, ensure the template file is scanned by Tailwind
5. Repeat until correct

---

## Debugging CSS Issues

### Custom Class Not Appearing in Output

Tailwind 4.x scans source files for class names. If a custom class from `styles.css` doesn't appear in `_site/css/output.css`:

1. Verify the class is written directly in `styles.css` (not dynamically generated)
2. Restart the dev server — watch mode can sometimes miss initial changes
3. Check for typos in the class name between `styles.css` and the template

### Utility Class Not Working

```bash
# Check if the class exists in compiled output
grep "the-class-name" _site/css/output.css
```

If missing: The class might not be used in any scanned template. Tailwind 4.x auto-detects content sources, but only finds classes written as complete strings in source files.

### WARNING: Dynamic Class Names

**The Problem:**

```html
<!-- BAD — Tailwind cannot detect dynamically constructed classes -->
{% set cols = "3" %}
<div class="grid-cols-{{ cols }}">
```

**Why This Breaks:** Tailwind scans source files for static strings. `grid-cols-{{ cols }}` never appears as a complete class name, so it's purged from output.

**The Fix:**

```html
<!-- GOOD — use complete class strings -->
{% if items | length > 4 %}
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
{% else %}
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
{% endif %}
```

Or for truly dynamic cases, use inline styles:

```html
<div style="grid-template-columns: repeat({{ cols }}, minmax(0, 1fr));">
```

### Inline Styles Not Rendering

If `style="color: var(--color-primary);"` shows the wrong color or no color:
1. Open devtools, inspect the element's computed styles
2. Verify the `@theme` block in `styles.css` defines the variable
3. Check for typos in the variable name (`--color-primray` vs `--color-primary`)

---

## Adding a New Page

When adding a new `.njk` page that needs Tailwind styles:

Copy this checklist and track progress:
- [ ] Step 1: Create `src/pages/page-name.njk` with YAML front matter (see the **nunjucks** skill)
- [ ] Step 2: Use the standard section/container pattern for layout
- [ ] Step 3: Apply colors via `style` attributes with CSS custom properties
- [ ] Step 4: Use existing custom classes (`.card`, `.btn-primary`, `.tag`) before creating new ones
- [ ] Step 5: Add responsive breakpoints (`sm:`, `md:`, `lg:`) for grids and typography
- [ ] Step 6: Include `sr-only` labels on form inputs without visible labels
- [ ] Step 7: Use `aria-hidden="true"` on decorative elements
- [ ] Step 8: Test at all breakpoints in browser devtools

See the **eleventy** skill for page registration and the **nunjucks** skill for front matter format.
