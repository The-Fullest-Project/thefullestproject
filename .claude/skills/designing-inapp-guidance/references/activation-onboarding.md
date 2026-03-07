# Activation & Onboarding Reference

## Contents
- First-Visit Guidance Patterns
- Homepage Activation Flow
- Resource Directory First Use
- Form Onboarding
- WARNING: Anti-Patterns
- Implementation Checklist

---

## First-Visit Guidance Patterns

This site has no authentication, no user accounts, and no stored state. "Activation" means a visitor finds useful content and takes a meaningful action (filters resources, bookmarks a page, submits a resource, subscribes to newsletter). All onboarding must work with localStorage for persistence and degrade gracefully without it.

### localStorage First-Visit Detection

```javascript
// src/js/main.js — append after mobile menu toggle
(function() {
  if (localStorage.getItem('tfp-visited')) return;
  localStorage.setItem('tfp-visited', Date.now());
  document.body.classList.add('first-visit');
})();
```

```css
/* src/css/styles.css — first-visit hints only show once */
.first-visit-hint { display: none; }
.first-visit .first-visit-hint { display: block; }
```

This lets you conditionally show guidance elements via CSS class without extra JS per component.

---

## Homepage Activation Flow

The homepage (`src/pages/index.njk`) has two hero CTAs: "Find Resources" and "Learn More." New visitors need context for what the site offers before choosing.

### DO: Add a Role-Based Orientation Banner

```html
{# src/pages/index.njk — insert after hero section #}
<div class="first-visit-hint section-warm py-6">
  <div class="max-w-4xl mx-auto px-4 text-center">
    <p class="text-lg font-semibold mb-4" style="color: var(--color-primary);">
      Welcome! How can we help you today?
    </p>
    <div class="flex flex-col sm:flex-row gap-3 justify-center">
      <a href="/resources/" class="btn-primary no-underline">
        I'm looking for resources
      </a>
      <a href="/therapy-guide/" class="btn-secondary no-underline">
        I need therapy guidance
      </a>
      <a href="/school-iep/" class="bg-white border-2 px-6 py-3 rounded-lg font-semibold no-underline"
        style="border-color: var(--color-accent); color: var(--color-accent);">
        I need school/IEP help
      </a>
    </div>
  </div>
</div>
```

### DON'T: Show a Generic Welcome Modal

```html
<!-- BAD — modal on a static site with no dismiss persistence -->
<div class="modal-overlay">
  <div class="modal">
    <h2>Welcome to The Fullest Project!</h2>
    <p>We help caregivers find resources...</p>
    <button>Got it</button>
  </div>
</div>
```

**Why this breaks:** Modals block content, feel intrusive on an informational site, require JS for dismiss, and re-appear on every page load without session state. A banner within the page flow is less disruptive and naturally scrolls away.

---

## Resource Directory First Use

The resource directory (`src/pages/resources.njk`) is the core product surface. Users land here from the hero CTA, from therapy guide deep links (`?category=therapy`), and from direct navigation.

### DO: Show Filter Guidance Inline

```html
{# src/pages/resources.njk — insert after filter card, before results-count #}
<div id="filter-hint" class="first-visit-hint text-sm p-3 rounded-lg mb-4"
  style="background-color: var(--color-warm-light); color: var(--color-text-light);">
  <strong>Tip:</strong> Search by name or description. Use Location and Category
  dropdowns to narrow results. Filters work together — set both to find
  therapy providers in Virginia, for example.
</div>
```

### DON'T: Use a Step-by-Step Tour Overlay

```javascript
// BAD — heavyweight tour library for 3 filter controls
import Shepherd from 'shepherd.js';
const tour = new Shepherd.Tour({ ... });
tour.addStep({ attachTo: '#search-input', text: 'Type to search...' });
```

**Why this breaks:** Adding a JS tour library (Shepherd, Intro.js) to a site with only 2 vanilla JS files is massive overkill. It introduces a dependency, bundle size, and maintenance burden for a filter UI that a single inline hint explains perfectly. See the **javascript** skill for the project's vanilla-only JS convention.

---

## Form Onboarding

The submit-resource form (`src/pages/submit-resource.njk`) has 7 fields and 29 category options. Users abandon complex forms without guidance.

### DO: Add Contextual Help Per Field

```html
{# src/pages/submit-resource.njk — enhanced description field #}
<div>
  <label for="resource-description" class="block text-sm font-semibold mb-2">
    Description *
  </label>
  <p id="desc-help" class="text-xs mb-2" style="color: var(--color-text-light);">
    What services do they provide? Who do they serve? Include age ranges
    and geographic coverage if known.
  </p>
  <textarea id="resource-description" name="description" rows="4" required
    class="form-input" aria-describedby="desc-help"
    placeholder="Example: Provides free occupational therapy evaluations for children ages 0-5 in Fairfax County."></textarea>
</div>
```

### DON'T: Put All Help in a Single "Instructions" Block

```html
<!-- BAD — wall of text nobody reads -->
<div class="card p-6 mb-8">
  <h2>How to Submit a Resource</h2>
  <p>Please fill in the resource name as it appears on their website.
  For the location field, select National if the resource serves all states.
  The category should be the primary service type. For description, include
  what services they provide, who they serve, age ranges...</p>
</div>
```

**Why this breaks:** Users don't read instruction blocks before forms. Field-level help text is read at the point of decision. The `aria-describedby` attribute ensures screen readers announce the help when the field receives focus.

---

## WARNING: Anti-Patterns

### WARNING: Tooltip on Touch Devices Without Fallback

**The Problem:**

```css
/* BAD — hover-only tooltip */
.tooltip-trigger:hover .tooltip { display: block; }
```

**Why This Breaks:**
1. Touch devices have no hover state — tooltip never appears
2. Caregivers frequently browse on phones during appointments or commutes
3. Accessibility violation — no keyboard or tap access

**The Fix:**

```css
/* GOOD — hover + focus + touch */
.tooltip-trigger:hover .tooltip,
.tooltip-trigger:focus .tooltip,
.tooltip-trigger:focus-within .tooltip {
  display: block;
}
```

Add `tabindex="0"` to every tooltip trigger so it's keyboard-reachable.

### WARNING: Guidance That Blocks the Primary Action

Never place a tour step, modal, or banner between the user and the resource cards on `/resources/`. The whole point of the page is browsing resources. Guidance must be supplementary, not blocking.

---

## Implementation Checklist

Copy this checklist and track progress:

- [ ] Add localStorage first-visit detection to `src/js/main.js`
- [ ] Add `.first-visit` / `.first-visit-hint` CSS to `src/css/styles.css`
- [ ] Add role-based orientation banner to `src/pages/index.njk`
- [ ] Add filter guidance hint to `src/pages/resources.njk`
- [ ] Add field-level help text to `src/pages/submit-resource.njk`
- [ ] Add field-level help text to `src/pages/contact.njk`
- [ ] Test all guidance with keyboard-only navigation
- [ ] Test tooltip visibility on mobile (focus fallback)
- [ ] Verify `aria-describedby` links are correct
- [ ] Run `npm run build` to confirm no template errors

See the **designing-onboarding-paths** skill for the full first-run experience design.
