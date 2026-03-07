# In-App Guidance Reference

## Contents
- Guidance Approach for Static Sites
- Filter Guidance Patterns
- Contextual Help Text
- Terminology Tooltips
- WARNING: No Accessibility on Dynamic Tooltips
- Progressive Disclosure

## Guidance Approach for Static Sites

No JS tooltip library. No React portals. No server-side personalization. All guidance must be:

1. **Rendered in Nunjucks templates** (visible in HTML source)
2. **Toggle-able with vanilla JS** (show/hide via class manipulation)
3. **Accessible** (ARIA attributes, keyboard operable, screen reader compatible)
4. **Lightweight** (no external dependencies)

See the **designing-inapp-guidance** skill for the comprehensive tooltip and tour implementation patterns.

## Filter Guidance Patterns

The resource filter (`src/js/resourceFilter.js`) is the core product surface. New visitors don't understand the 29 categories or know which location to pick.

### DO: Add inline hint text to filter controls

```html
<!-- src/pages/resources.njk — enhance the filter panel -->
<div class="card p-6 mb-8">
  <p class="text-sm text-gray-500 mb-4">
    Narrow results by location, category, or keyword. Not sure where to start?
    <a href="/resources/?location=National" class="text-teal-700 underline">Try national resources</a>.
  </p>

  <label for="search-input" class="block text-sm font-medium text-gray-700">
    Search
    <span class="sr-only">by resource name or description</span>
  </label>
  <input type="text" id="search-input" class="form-input" placeholder="e.g., autism support, respite care">

  <label for="location-filter" class="block text-sm font-medium text-gray-700 mt-4">
    Location
  </label>
  <select id="location-filter" class="filter-select">
    <option value="">All Locations</option>
    <!-- state options -->
  </select>

  <label for="category-filter" class="block text-sm font-medium text-gray-700 mt-4">
    Category
    <span class="text-gray-400 text-xs ml-1">(therapy, advocacy, equipment, etc.)</span>
  </label>
  <select id="category-filter" class="filter-select">
    <option value="">All Categories</option>
    <!-- category options -->
  </select>
</div>
```

### DON'T: Use placeholder text as the only instruction

```html
<!-- BAD — placeholder disappears on focus, invisible to screen readers -->
<input type="text" placeholder="Search resources by name, category, or location...">

<!-- GOOD — persistent label + helpful placeholder -->
<label for="search-input" class="block text-sm font-medium text-gray-700">Search Resources</label>
<input type="text" id="search-input" placeholder="e.g., autism support, respite care" class="form-input">
```

Placeholders vanish when the user starts typing. They're not announced by all screen readers. Always use visible labels. See the **frontend-design** skill for form accessibility patterns.

## Contextual Help Text

### DO: Add explanatory text to complex content pages

The IEP page already does this well with its comparison cards:

```njk
{# Existing pattern in school-iep/index.njk — IEP vs 504 comparison #}
<div class="grid md:grid-cols-2 gap-6">
  <div class="card p-6">
    <h3 class="text-xl font-bold">IEP (Individualized Education Program)</h3>
    <p class="mt-2">For students who need specialized instruction...</p>
    <ul class="mt-4 space-y-2">
      <li>Covers 13 disability categories</li>
      <li>Requires evaluation by school</li>
    </ul>
  </div>
  <div class="card p-6">
    <h3 class="text-xl font-bold">504 Plan</h3>
    <p class="mt-2">For students who need accommodations...</p>
  </div>
</div>
```

Replicate this comparison-card pattern for any content where visitors need to choose between options (therapy types, equipment categories, service tiers).

### DO: Use expandable sections for detailed explanations

```html
<details class="mt-4 border rounded-lg p-4">
  <summary class="font-semibold cursor-pointer">What does "advocacy" mean in this context?</summary>
  <p class="mt-2 text-gray-600">
    Advocacy resources help you navigate systems (schools, insurance, government programs)
    on behalf of your family member. This includes legal advocates, parent training centers,
    and disability rights organizations.
  </p>
</details>
```

The `<details>` element is native HTML, requires no JavaScript, and is accessible by default. Use it for terminology explanations, FAQ sections, and "learn more" expansions.

### DON'T: Build custom accordion components when `<details>` exists

```javascript
// BAD — unnecessary JS for something HTML handles natively
document.querySelectorAll('.accordion-header').forEach(header => {
  header.addEventListener('click', () => {
    header.nextElementSibling.classList.toggle('hidden');
    header.setAttribute('aria-expanded',
      header.getAttribute('aria-expanded') === 'true' ? 'false' : 'true');
  });
});
```

The `<details>` element handles expand/collapse, keyboard navigation, and ARIA semantics for free.

## WARNING: No Accessibility on Dynamic Tooltips

**The Problem:** Adding JavaScript-powered tooltips that appear on hover breaks keyboard navigation and screen readers.

**Why This Breaks:**
1. Hover-only tooltips are invisible to keyboard users
2. Screen readers won't announce dynamically injected content without `aria-live`
3. Touch devices have no hover state — tooltip never appears

**The Fix:** Use `<details>` for expandable help text, or `title` attributes for simple tooltips. For anything more complex:

```html
<!-- Accessible inline tooltip pattern -->
<button type="button"
        aria-describedby="category-help"
        class="text-gray-400 hover:text-gray-600 ml-1">
  <span aria-hidden="true">?</span>
  <span class="sr-only">What are categories?</span>
</button>
<div id="category-help" role="tooltip" class="hidden absolute bg-white shadow-lg rounded p-3 text-sm max-w-xs z-10">
  Categories group resources by type: therapy providers, advocacy organizations, equipment suppliers, etc.
</div>
```

```javascript
// Toggle tooltip on click (not hover) for accessibility
document.querySelectorAll('[aria-describedby]').forEach(btn => {
  btn.addEventListener('click', () => {
    const tooltip = document.getElementById(btn.getAttribute('aria-describedby'));
    tooltip.classList.toggle('hidden');
  });
});
```

## Progressive Disclosure

### DO: Show the simplest view first, let users dig deeper

The services page demonstrates this with its three-card layout — each card shows a summary with a "Learn More" CTA. Apply the same pattern to:

- **Resource cards:** Show name + description + location, expand for phone/address/tags
- **Therapy guide:** Show therapy name + one-line description, expand for "When It's Beneficial"
- **IEP steps:** Show step number + title, expand for detailed instructions

```njk
{# Progressive disclosure on resource cards #}
<div class="card p-4">
  <h3 class="font-semibold">{{ resource.name }}</h3>
  <p class="text-sm text-gray-600 mt-1">{{ resource.description | truncate(120) }}</p>
  <details class="mt-2">
    <summary class="text-sm text-teal-700 cursor-pointer">Contact & Details</summary>
    <div class="mt-2 text-sm space-y-1">
      {% if resource.phone %}<p>Phone: {{ resource.phone }}</p>{% endif %}
      {% if resource.address %}<p>Address: {{ resource.address }}</p>{% endif %}
      {% if resource.website %}<a href="{{ resource.website }}" class="text-teal-700 underline">Visit Website</a>{% endif %}
    </div>
  </details>
</div>
```

### DON'T: Hide critical information behind progressive disclosure

Resource website links and phone numbers are the core value. Don't bury them — show the most important contact method upfront and use progressive disclosure only for secondary details like address, age range, and tags.
