# In-App Guidance Reference

## Contents
- Tooltip System
- Inline Help Text
- Progressive Disclosure
- Guided Navigation
- WARNING: Anti-Patterns
- Accessibility Requirements
- Implementation Checklist

---

## Tooltip System

The codebase has no tooltip component. Build one using CSS + HTML with no JS dependency. The tooltip must work on hover (desktop), focus (keyboard), and tap (mobile via `tabindex="0"`).

### Reusable Nunjucks Macro

```nunjucks
{# src/_includes/components/tooltip.njk #}
{% macro tip(abbr, full) %}
<span class="tooltip-trigger" tabindex="0"
  aria-describedby="tip-{{ abbr | lower | replace(' ', '-') | replace('/', '-') }}">
  {{ abbr }}<span class="tooltip"
    id="tip-{{ abbr | lower | replace(' ', '-') | replace('/', '-') }}"
    role="tooltip">{{ full }}</span>
</span>
{% endmacro %}
```

### CSS Component

```css
/* src/css/styles.css — add after .filter-select */
.tooltip-trigger {
  position: relative;
  cursor: help;
  border-bottom: 1px dotted var(--color-accent);
}

.tooltip {
  display: none;
  position: absolute;
  bottom: calc(100% + 0.5rem);
  left: 50%;
  transform: translateX(-50%);
  padding: 0.5rem 0.75rem;
  background: var(--color-text);
  color: white;
  border-radius: 0.375rem;
  font-size: 0.8125rem;
  line-height: 1.4;
  white-space: nowrap;
  max-width: 280px;
  z-index: 50;
  pointer-events: none;
}

/* Arrow */
.tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: var(--color-text);
}

.tooltip-trigger:hover .tooltip,
.tooltip-trigger:focus .tooltip {
  display: block;
}

/* Wrapping for long definitions */
.tooltip--wide {
  white-space: normal;
  width: 280px;
}
```

### Usage in Templates

```nunjucks
{# src/pages/therapy-guide/index.njk #}
{% from "components/tooltip.njk" import tip %}

<h2>Occupational Therapy ({{ tip("OT", "Occupational Therapy") }})</h2>
<p>...including fine motor skills, {{ tip("sensory processing",
  "How the brain organizes and responds to sensory input like touch, sound, and movement") }}...</p>
```

```nunjucks
{# src/pages/school-iep/index.njk — legal terms #}
{% from "components/tooltip.njk" import tip %}

<p>Under {{ tip("IDEA", "Individuals with Disabilities Education Act — federal law guaranteeing free appropriate public education") }},
your child is entitled to {{ tip("FAPE", "Free Appropriate Public Education") }}
in the {{ tip("LRE", "Least Restrictive Environment — your child should be educated with non-disabled peers to the maximum extent appropriate") }}.</p>
```

### Priority Locations for Tooltips

| Page | Terms Needing Tooltips |
|------|----------------------|
| Therapy Guide | OT, PT, ABA, AAC, SLP, sensory processing, gross/fine motor |
| School/IEP | IDEA, FAPE, LRE, IEP, 504, ESY, PLOP, due process |
| Equipment | AAC devices, environmental controls, switch access |
| Resources | Category definitions in filter dropdown |

---

## Inline Help Text

For form fields and filter controls. Uses `aria-describedby` so screen readers announce the help when the field is focused.

### DO: Help Text Below Label, Above Input

```html
{# src/pages/submit-resource.njk #}
<div>
  <label for="resource-location" class="block text-sm font-semibold mb-1">
    Location *
  </label>
  <p id="location-help" class="text-xs mb-2" style="color: var(--color-text-light);">
    Select "National" if the resource serves all U.S. states.
    Otherwise, choose the primary state served.
  </p>
  <select id="resource-location" name="location" required class="form-input"
    aria-describedby="location-help">
    <option value="">Select location...</option>
    <option value="National">National</option>
    {% for state in states %}
    <option value="{{ state.name }}">{{ state.name }}</option>
    {% endfor %}
  </select>
</div>
```

### DON'T: Put Help Text Inside Placeholder

```html
<!-- BAD — placeholder disappears on focus, gone when user types -->
<input type="text" placeholder="Enter the official organization name as it appears on their website, not an abbreviation">
```

**Why this breaks:** Placeholders vanish the moment the user starts typing. Long placeholder text gets truncated. Screen readers may skip placeholder text entirely. Use a separate `<p>` with `aria-describedby`.

### Resource Directory Filter Help

```html
{# src/pages/resources.njk — enhanced filter section #}
<div class="flex-grow">
  <label for="search-input" class="block text-sm font-semibold mb-1">Search</label>
  <p id="search-help" class="text-xs mb-2" style="color: var(--color-text-light);">
    Searches resource names and descriptions
  </p>
  <input type="text" id="search-input" placeholder="Search resources..."
    class="form-input" aria-describedby="search-help">
</div>
```

---

## Progressive Disclosure

For content-heavy educational pages (Therapy Guide has 8 therapy cards, IEP Guide has 5 major sections), progressive disclosure reduces cognitive load.

### DO: Collapsible Detail Sections

```html
{# Therapy Guide — collapsible "When It's Beneficial" #}
<details class="mt-3">
  <summary class="font-semibold cursor-pointer" style="color: var(--color-primary);">
    When It's Beneficial
  </summary>
  <ul class="list-disc list-inside space-y-1 text-sm mt-2"
    style="color: var(--color-text-light);">
    <li>Difficulty with fine motor tasks</li>
    <li>Sensory processing challenges</li>
    <li>Trouble with self-care activities</li>
  </ul>
</details>
```

The `<details>/<summary>` element is native HTML, requires no JavaScript, and is accessible out of the box (keyboard-toggleable, screen reader announced).

### DON'T: Hide Critical Information Behind Disclosure

```html
<!-- BAD — rights info should be immediately visible -->
<details>
  <summary>Your Legal Rights</summary>
  <p>Under IDEA, your child is entitled to FAPE...</p>
</details>
```

**Why this breaks:** Legal rights on the IEP page are the primary content, not supplementary detail. Progressive disclosure is for supporting information (examples, lists, extended descriptions), not the core message.

---

## Guided Navigation

### Jump Links for Long Pages

The School/IEP page already has a "In This Guide" jump navigation. Apply this pattern to other long pages:

```html
{# Top of any page with 3+ sections #}
<nav class="card p-4 mb-8" aria-label="Page contents">
  <p class="text-sm font-semibold mb-2" style="color: var(--color-primary);">
    In This Guide
  </p>
  <ul class="flex flex-wrap gap-3 text-sm">
    <li><a href="#section-1" style="color: var(--color-accent);">Section 1</a></li>
    <li><a href="#section-2" style="color: var(--color-accent);">Section 2</a></li>
  </ul>
</nav>
```

### Contextual "Where Am I?" Breadcrumbs

```html
{# src/_includes/layouts/page.njk — add before content #}
<nav class="max-w-7xl mx-auto px-4 py-3 text-sm" aria-label="Breadcrumb">
  <ol class="flex gap-2" style="color: var(--color-text-light);">
    <li><a href="/" style="color: var(--color-accent);">Home</a></li>
    <li aria-hidden="true">/</li>
    <li aria-current="page">{{ title }}</li>
  </ol>
</nav>
```

---

## WARNING: Anti-Patterns

### WARNING: JS-Dependent Tooltips Without Fallback

**The Problem:**

```javascript
// BAD — tooltip only works if JS loads
document.querySelectorAll('[data-tooltip]').forEach(el => {
  el.addEventListener('mouseenter', () => showTooltip(el));
});
```

**Why This Breaks:**
1. If JS fails to load (network issue, blocker), all tooltips disappear
2. No progressive enhancement — content is lost without JS
3. The site's convention is minimal JS; CSS-first is the correct approach

**The Fix:**
Use the CSS tooltip pattern above. The content is always in the DOM. CSS handles show/hide. JS is not required.

### WARNING: Tooltip on Category Filter Options

**The Problem:**

```html
<!-- BAD — can't tooltip individual <option> elements -->
<option value="early-intervention" title="Ages 0-3 programs">
  Early Intervention (0-3)
</option>
```

**Why This Breaks:**
The `title` attribute on `<option>` elements is inconsistently rendered across browsers and completely ignored by most screen readers. Instead, add help text above the select or use a description list alongside the dropdown.

---

## Accessibility Requirements

Every guidance element MUST meet these criteria:

| Requirement | Implementation |
|------------|----------------|
| Keyboard accessible | `tabindex="0"` on tooltip triggers |
| Screen reader announced | `role="tooltip"` + `aria-describedby` |
| Dismissable | Tooltips dismiss on `Escape` (add JS) or on blur (CSS) |
| No content dependence | Page makes sense with tooltips hidden |
| Touch accessible | `:focus` fallback covers tap-to-focus |
| Color independent | Dotted underline indicates tooltip, not just color |

### Escape Key Dismissal (Enhancement)

```javascript
// src/js/main.js — append
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    document.activeElement.blur();
  }
});
```

---

## Implementation Checklist

Copy this checklist and track progress:

- [ ] Create `src/_includes/components/tooltip.njk` macro
- [ ] Add tooltip CSS to `src/css/styles.css`
- [ ] Add tooltips to Therapy Guide page (OT, PT, ABA, AAC, SLP)
- [ ] Add tooltips to School/IEP page (IDEA, FAPE, LRE, IEP, 504, ESY)
- [ ] Add `aria-describedby` help text to submit-resource form fields
- [ ] Add `aria-describedby` help text to resource directory filters
- [ ] Add breadcrumbs to page layout
- [ ] Add jump links to Therapy Guide and Equipment pages
- [ ] Test with keyboard-only navigation (Tab, Enter, Escape)
- [ ] Test tooltips on mobile (tap to focus)
- [ ] Validate `npm run build` succeeds

1. Add tooltip macro and CSS
2. Add tooltips to one page (Therapy Guide)
3. Validate: `npm run build && npm run serve` — check tooltip rendering
4. If build fails, fix Nunjucks syntax and repeat step 3
5. Only proceed to other pages when Therapy Guide tooltips work correctly

See the **nunjucks** skill for macro syntax and the **tailwind** skill for utility class integration.
