# JavaScript Patterns Reference

## Contents
- DOM Ready Pattern
- Element Targeting and Guard Clauses
- Data-Attribute Filtering
- URL Parameter Hydration
- ARIA State Management
- Event Binding
- Anti-Patterns

## DOM Ready Pattern

Every browser script wraps in `DOMContentLoaded`. This project does NOT use `defer` or `async` attributes on script tags, so the listener is mandatory.

```javascript
// GOOD — consistent entry point across all scripts
document.addEventListener('DOMContentLoaded', function() {
  // All DOM access goes here
});
```

```javascript
// BAD — accessing DOM at top level risks null elements
const btn = document.getElementById('mobile-menu-btn'); // might be null
btn.addEventListener('click', handler); // TypeError
```

Use `function()` syntax, not arrow functions — this codebase targets broad browser compatibility.

## Element Targeting and Guard Clauses

ALWAYS target elements by ID. ALWAYS null-check before binding events or reading properties.

```javascript
// GOOD — guard clause prevents errors on pages where element doesn't exist
const searchInput = document.getElementById('search-input');
const resourceGrid = document.getElementById('resource-grid');
if (!resourceGrid) return; // early exit on non-resource pages
```

```javascript
// BAD — querying by class risks matching unrelated elements
const cards = document.querySelectorAll('.card'); // matches ALL cards site-wide
```

The resource filter uses `.resource-card` (not `.card`) specifically to avoid matching non-resource card elements. This distinction matters — `.card` is a general-purpose CSS class used across many pages.

## Data-Attribute Filtering

Resource cards store filterable data in `data-*` attributes, rendered by Nunjucks templates. See the **nunjucks** skill for how these are generated.

The contract between templates and JS:

```html
<!-- Rendered by Nunjucks in resources.njk -->
<div class="card p-6 resource-card"
     data-location="{{ resource.location }}"
     data-category="{{ resource.category | join(',') }}"
     data-name="{{ resource.name | lower }}"
     data-description="{{ resource.description | lower }}">
```

```javascript
// Read in resourceFilter.js
const name = card.getAttribute('data-name') || '';           // already lowercase
const description = card.getAttribute('data-description') || ''; // already lowercase
const location = card.getAttribute('data-location') || '';   // exact case: "Northern Virginia"
const categories = card.getAttribute('data-category') || ''; // "therapy,education"
```

Key details:
- `data-name` and `data-description` are **lowercased at render time** via the Nunjucks `| lower` filter — so `searchTerm` must also be lowercased before comparison
- `data-category` is a comma-separated string — use `String.includes()` for matching, not strict equality
- `data-location` is the **full display name** ("Northern Virginia"), not the slug ("nova")

### Filtering Logic

```javascript
function filterResources() {
  const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const selectedLocation = locationFilter ? locationFilter.value : '';
  const selectedCategory = categoryFilter ? categoryFilter.value : '';
  let visibleCount = 0;

  cards.forEach(function(card) {
    let show = true;

    // Each filter is independent — ALL must pass
    if (searchTerm && !name.includes(searchTerm) && !description.includes(searchTerm)) {
      show = false;
    }
    if (selectedLocation && location !== selectedLocation) {
      show = false;
    }
    if (selectedCategory && !categories.includes(selectedCategory)) {
      show = false;
    }

    card.style.display = show ? '' : 'none';
    if (show) visibleCount++;
  });
}
```

## URL Parameter Hydration

The resource filter reads URL params on page load to support deep-linking (e.g., from homepage location buttons).

```javascript
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('location') && locationFilter) {
  const locationMap = {
    'nova': 'Northern Virginia',
    'portland': 'Portland',
    'national': 'National'
  };
  const loc = urlParams.get('location');
  if (locationMap[loc]) {
    locationFilter.value = locationMap[loc];
  }
}
```

The URL uses **slugs** (`?location=nova`) but `<select>` values and `data-location` use **display names** ("Northern Virginia"). The `locationMap` bridges this gap.

## ARIA State Management

The mobile menu toggle must update `aria-expanded` to remain accessible.

```javascript
// GOOD — read as string, toggle boolean, set back
const isExpanded = menuBtn.getAttribute('aria-expanded') === 'true';
menuBtn.setAttribute('aria-expanded', !isExpanded);
mobileMenu.classList.toggle('hidden');
```

```javascript
// BAD — forgetting ARIA update. Screen readers won't know menu state changed
mobileMenu.classList.toggle('hidden'); // visually works, but inaccessible
```

See the **frontend-design** skill for broader accessibility guidelines.

## Event Binding

This project binds events individually per element, not via delegation:

```javascript
if (searchInput) searchInput.addEventListener('input', filterResources);   // fires on every keystroke
if (locationFilter) locationFilter.addEventListener('change', filterResources); // fires on selection
if (categoryFilter) categoryFilter.addEventListener('change', filterResources);
```

Use `'input'` for text fields (real-time filtering). Use `'change'` for `<select>` elements (fires on commit).

## Anti-Patterns

### WARNING: Using Frameworks or Build Tools for Browser JS

**The Problem:** This is a static site with two tiny scripts. Adding React, Vue, or even a bundler introduces massive complexity for zero benefit.

**Why This Breaks:**
1. Eleventy passthrough-copies `src/js/` as-is — no build step, no transpilation
2. Adding a bundler means a third concurrent process alongside Eleventy and Tailwind
3. Framework code dwarfs the entire site's JS payload

**The Fix:** Keep it vanilla. If a new feature genuinely needs reactivity, consider Alpine.js (3KB) before anything heavier.

### WARNING: Using `innerHTML` for Dynamic Content

**The Problem:**

```javascript
// BAD — XSS vulnerability if resource data contains user-submitted content
card.innerHTML = '<h3>' + resource.name + '</h3>';
```

**Why This Breaks:**
1. Resource data comes from scrapers and community submissions — it's untrusted
2. `innerHTML` executes embedded scripts and event handlers

**The Fix:**

```javascript
// GOOD — textContent is safe, style.display for visibility
card.style.display = show ? '' : 'none';
// If creating elements:
const h3 = document.createElement('h3');
h3.textContent = resource.name; // auto-escaped
```

### WARNING: querySelector Without Scoping

```javascript
// BAD — matches first .resource-card anywhere in DOM
const card = document.querySelector('.resource-card');

// GOOD — scope to the grid container
const cards = resourceGrid.querySelectorAll('.resource-card');
```
