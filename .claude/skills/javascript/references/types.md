# JavaScript Types Reference

## Contents
- Data Attribute Contracts
- Element ID Registry
- URL Parameter Schema
- Filter State Shape
- Resource Data Shape (Client-Side)
- Node-Side vs Browser-Side Type Contexts

## Data Attribute Contracts

These are the implicit type contracts between Nunjucks templates and `resourceFilter.js`. Changes to templates MUST preserve these or the filter breaks. See the **nunjucks** skill for the template side.

| Attribute | Type | Source | Example Value |
|-----------|------|--------|---------------|
| `data-name` | `string` (lowercased) | `resource.name \| lower` | `"arc of northern virginia"` |
| `data-description` | `string` (lowercased) | `resource.description \| lower` | `"provides advocacy and support..."` |
| `data-location` | `string` (display name) | `resource.location` | `"Northern Virginia"` |
| `data-category` | `string` (comma-separated slugs) | `resource.category \| join(',')` | `"therapy,education"` |

### WARNING: Location Value Mismatch

**The Problem:**

```javascript
// BAD — using slug where display name is expected
if (location !== 'nova') { show = false; }
```

**Why This Breaks:** `data-location` stores the full display name ("Northern Virginia"), not the JSON file key ("nova"). URL params use slugs, `<select>` options use display names, and `data-location` uses display names.

**The Fix:**

```javascript
// GOOD — compare against the actual stored value
if (selectedLocation && location !== selectedLocation) { show = false; }
// selectedLocation comes from <option value="Northern Virginia">
```

### WARNING: Category Matching with String.includes()

**The Problem:**

```javascript
// RISKY — "camp" matches "camps" but also "campaign" if that category existed
if (selectedCategory && !categories.includes(selectedCategory)) { show = false; }
```

**Why This Is Acceptable Here:** Category slugs are controlled by the `<select>` options in the template, and the resource schema uses specific slugs (`therapy`, `education`, `camps`). No current slug is a substring of another. If you add a category whose slug is a substring of an existing one, you MUST switch to split-and-match:

```javascript
// SAFER — exact match against individual categories
const categoryList = categories.split(',');
if (selectedCategory && !categoryList.includes(selectedCategory)) { show = false; }
```

## Element ID Registry

Every ID used by JavaScript. Adding or renaming these requires updating both the template and the JS file.

### Global (every page via nav.njk + main.js)

| ID | Element | Used In |
|----|---------|---------|
| `mobile-menu-btn` | `<button>` | `main.js` — click handler |
| `mobile-menu` | `<div>` | `main.js` — toggle `hidden` class |
| `main-content` | `<main>` | `base.njk` — skip-nav target |

### Resources Page (resources.njk + resourceFilter.js)

| ID | Element | Used In |
|----|---------|---------|
| `search-input` | `<input type="text">` | `resourceFilter.js` — `input` event |
| `location-filter` | `<select>` | `resourceFilter.js` — `change` event |
| `category-filter` | `<select>` | `resourceFilter.js` — `change` event |
| `resource-grid` | `<div>` | `resourceFilter.js` — card container |
| `results-count` | `<p>` | `resourceFilter.js` — updates textContent |

### ID Naming Convention

All IDs use **kebab-case**: `search-input`, `mobile-menu-btn`, `resource-grid`. NEVER use camelCase or underscores for IDs.

## URL Parameter Schema

Parameters read by `resourceFilter.js` from `window.location.search`:

| Param | Values | Maps To |
|-------|--------|---------|
| `location` | `nova`, `portland`, `national` | `locationFilter.value` via `locationMap` lookup |
| `category` | Any category slug from `<select>` | `categoryFilter.value` (direct assignment) |

The `locationMap` translates URL slugs to display names:

```javascript
const locationMap = {
  'nova': 'Northern Virginia',
  'portland': 'Portland',
  'national': 'National'
};
```

If a new location is added to `site.json`, it MUST also be added to this map, the `<select>` options in `resources.njk`, and the resource JSON files. See the **json** skill for the data schema.

## Filter State Shape

The filter state is implicit — derived from DOM values each time `filterResources()` runs. There is no stored state object.

```javascript
// Effective filter state (reconstructed each call)
{
  searchTerm: string,        // lowercased, trimmed. '' means no filter
  selectedLocation: string,  // display name or '' for all
  selectedCategory: string   // slug or '' for all
}
```

All three filters use AND logic: a card must match ALL active filters to be visible.

## Resource Data Shape (Client-Side)

On the server side (Eleventy build), resources follow the full schema. See the **json** skill. On the client side, only data-attribute values are available:

```javascript
// What JS actually sees per card:
{
  name: string,        // lowercase, from data-name
  description: string, // lowercase, from data-description
  location: string,    // display name, from data-location
  categories: string   // comma-separated slugs, from data-category
}
```

Fields like `phone`, `website`, `address`, `ageRange`, `cost` are rendered in HTML but NOT exposed as data attributes — they are not filterable.

## Node-Side vs Browser-Side Type Contexts

This project has two distinct JavaScript execution contexts:

| Context | Module System | Files | Runtime |
|---------|--------------|-------|---------|
| Node.js | CommonJS (`require()`) | `.eleventy.js`, `deploy.js` | Node 20+ |
| Browser | Global scope (no modules) | `src/js/*.js` | All modern browsers |

```javascript
// Node-side (CommonJS) — .eleventy.js
module.exports = function(eleventyConfig) { /* ... */ };

// Node-side (CommonJS) — deploy.js
const ftp = require('basic-ftp');
const path = require('path');
```

```javascript
// Browser-side (no module system) — src/js/main.js
document.addEventListener('DOMContentLoaded', function() { /* ... */ });
```

NEVER use `require()`, `import`, or `module.exports` in browser scripts. NEVER use `document` or `window` in Node-side scripts. The `"type": "commonjs"` in `package.json` applies only to Node execution.
