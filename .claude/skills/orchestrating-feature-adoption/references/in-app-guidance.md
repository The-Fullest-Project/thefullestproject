# In-App Guidance Reference

## Contents
- Guidance Surfaces in a Static Site
- Filter Instruction Patterns
- Contextual Help Text
- Progressive Disclosure with Nunjucks
- WARNING: Tooltip Overload in Static HTML
- WARNING: Guidance That Blocks Content
- Implementation Patterns

## Guidance Surfaces in a Static Site

Without JavaScript frameworks or user accounts, in-app guidance is limited to build-time patterns rendered by Nunjucks. Available guidance surfaces:

| Surface | Implementation | Best For |
|---------|---------------|----------|
| Inline help text | Static `<p>` or `<small>` below elements | Form fields, filter controls |
| Instructional banners | Conditional Nunjucks blocks | First-time tips, feature explanations |
| Section intros | Paragraph before content grids | Setting context for content sections |
| Breadcrumb-style headers | Page title + subtitle | Orientation within multi-section pages |
| In-page nav | Anchor links at top of long pages | IEP guide, therapy guide |

### In-Page Navigation (School & IEP Guide Pattern)

```html
{# src/pages/school-iep/index.njk — jump links for long content #}
<nav class="flex flex-wrap gap-2 mb-8" aria-label="Page sections">
  <a href="#iep-vs-504" class="tag">IEPs vs 504 Plans</a>
  <a href="#your-rights" class="tag">Your Rights</a>
  <a href="#iep-process" class="tag">The IEP Process</a>
  <a href="#advocacy-tips" class="tag">Advocacy Tips</a>
  <a href="#state-resources" class="tag">State Resources</a>
</nav>
```

This is the only page with in-page navigation. Any content page exceeding ~3 screen heights should adopt this pattern.

**DO:** Use the `.tag` class for jump links — it provides the pill-shaped, clickable appearance consistent with the rest of the site.

**DON'T:** Use a sidebar nav for in-page sections. The site has no sidebar layout, and adding one breaks the single-column content flow.

## Filter Instruction Patterns

The resource directory filter system (`resourceFilter.js`) is the most complex UI on the site. First-time visitors may not understand how to use it.

### Current Filter UI

```html
{# src/pages/resources.njk — filter controls #}
<div class="flex flex-wrap gap-4 mb-8">
  <input type="text" id="search-input" placeholder="Search resources..."
         class="form-input flex-1 min-w-[200px]">
  <select id="location-filter" class="filter-select">
    <option value="">All Locations</option>
    {# ... state options ... #}
  </select>
  <select id="category-filter" class="filter-select">
    <option value="">All Categories</option>
    {# ... category options ... #}
  </select>
</div>
```

### Adding Filter Guidance

```html
{# Proposed: instructional text above filters #}
<p class="text-sm text-gray-500 mb-4">
  Search by name or description, or use the dropdowns to filter by location and category.
  Results update automatically.
</p>
```

**DO:** Keep guidance text short (one line) and positioned directly above the controls it explains.

**DON'T:** Add a multi-step tutorial overlay. This is a static site — there's no mechanism to track whether a user has seen the tutorial, so it would show on every page load.

## Contextual Help Text

### Form Field Guidance

```html
{# src/pages/submit-resource.njk — help text below optional fields #}
<div class="mb-4">
  <label for="contact-info" class="block text-sm font-medium text-gray-700 mb-1">
    Contact Information
  </label>
  <input type="text" id="contact-info" name="contact" class="form-input">
  <small class="text-gray-500 mt-1 block">
    Phone number or email for the resource (optional)
  </small>
</div>

<div class="mb-4">
  <label for="your-email" class="block text-sm font-medium text-gray-700 mb-1">
    Your Email
  </label>
  <input type="email" id="your-email" name="_replyto" class="form-input">
  <small class="text-gray-500 mt-1 block">
    In case we have questions about your submission (optional)
  </small>
</div>
```

**DO:** Use `<small>` with `text-gray-500` for help text. This is the established pattern across all forms.

**DON'T:** Use placeholder text as the only guidance. Placeholders disappear on focus, leaving the user without context.

## Progressive Disclosure with Nunjucks

Since there's no client-side state, progressive disclosure is limited to:

1. **Conditional rendering** based on data availability
2. **HTML `<details>` elements** for expandable sections
3. **Anchor links** to skip to sections

### Details/Summary Pattern

```html
{# Expandable content without JavaScript #}
<details class="border border-gray-200 rounded-lg p-4 mb-4">
  <summary class="font-bold cursor-pointer text-lg" style="color: var(--color-primary);">
    What is an IEP?
  </summary>
  <div class="mt-4 text-gray-600">
    <p>An Individualized Education Program (IEP) is a legally binding document...</p>
  </div>
</details>
```

**DO:** Use `<details>` for FAQ-style content, rights explanations, and any section where showing everything at once would overwhelm.

**DON'T:** Nest `<details>` more than one level deep. Two levels of expand/collapse creates confusion about what's visible.

### WARNING: Tooltip Overload in Static HTML

**The Problem:**

```html
<!-- BAD — CSS-only tooltip on every element -->
<span class="tooltip" data-tooltip="This filters resources by your state">
  <select id="location-filter">...</select>
</span>
```

**Why This Breaks:**
1. CSS-only tooltips don't work on touch devices (most mobile traffic)
2. Multiple tooltips clutter the interface and compete for attention
3. Without JavaScript, tooltips can't be dismissed or controlled
4. Accessibility is poor — screen readers handle CSS tooltips inconsistently

**The Fix:** Use inline help text (`<small>`) or a single instructional banner above the section. Reserve visual callouts for the one thing that matters most on each page.

### WARNING: Guidance That Blocks Content

**The Problem:**

```html
<!-- BAD — modal/overlay without dismiss tracking -->
<div class="fixed inset-0 bg-black/50 z-50">
  <div class="bg-white p-8 rounded-lg">
    <h2>Welcome! Here's how to use our resource directory...</h2>
    <button onclick="this.parentElement.parentElement.remove()">Got it</button>
  </div>
</div>
```

**Why This Breaks:**
1. No localStorage tracking means this shows on EVERY page load
2. Modals on static sites feel broken — users expect them to "remember" dismissal
3. Blocking content with guidance is counterproductive: the content IS the feature

**The Fix:** Use non-blocking inline guidance that doesn't require dismissal:

```html
<!-- GOOD — inline banner that doesn't block content -->
<div class="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
  <p class="text-sm text-blue-800">
    <strong>New here?</strong> Start by selecting your state from the location filter,
    then browse categories that match your needs.
  </p>
</div>
```

## Implementation Patterns

### Adding Guidance to a New Page

1. Identify the primary action on the page (filter, form submit, CTA click)
2. Add one line of instructional text above that action
3. Ensure help text uses `text-sm text-gray-500` for visual hierarchy
4. Validate: guidance should be readable in under 5 seconds

### Guidance Validation Loop

1. Add guidance text to the template
2. Run `npm run dev` and view the page
3. If guidance competes with the primary CTA for attention, reduce it
4. If guidance is invisible or buried, move it closer to the relevant control
5. Repeat until guidance supports (not replaces) the primary action

See the **designing-inapp-guidance** skill for comprehensive guidance system design and the **frontend-design** skill for UI component patterns.
