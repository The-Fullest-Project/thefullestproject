# Programmatic SEO Reference

## Contents
- Data-Driven Page Generation Strategy
- Location Landing Pages from JSON
- Category Landing Pages
- Therapy Guide Sub-Pages
- Pagination for Large Collections
- URL Structure Conventions

---

## Data-Driven Page Generation Strategy

The site has rich JSON resource data in `src/_data/resources/` (nova, portland, national) but generates only ONE resource page (`/resources/`). This is a massive missed opportunity — each location + category combination is a unique search intent.

### Current vs. Target URL Surface

| Current | Target | Search Intent |
|---------|--------|---------------|
| `/resources/` | `/resources/` | Generic "disability resources" |
| (none) | `/resources/virginia/` | "disability resources virginia" |
| (none) | `/resources/portland/` | "disability resources portland oregon" |
| (none) | `/resources/virginia/therapy/` | "therapy resources virginia" |
| (none) | `/resources/national/legal/` | "disability legal resources" |
| `/therapy-guide/` | `/therapy-guide/occupational-therapy/` | "occupational therapy for children" |

---

## Location Landing Pages from JSON

Use Eleventy pagination to generate one page per location from the resource data.

### Step 1: Create Location Data

```json
// src/_data/locationPages.json
[
  { "slug": "virginia", "name": "Northern Virginia", "dataKey": "nova" },
  { "slug": "portland", "name": "Portland, OR", "dataKey": "portland" },
  { "slug": "national", "name": "National", "dataKey": "national" }
]
```

### Step 2: Create Paginated Template

```yaml
# src/pages/resources/location.njk
---
layout: layouts/page.njk
pagination:
  data: locationPages
  size: 1
  alias: loc
permalink: /resources/{{ loc.slug }}/
eleventyComputed:
  title: "{{ loc.name }} Disability Resources"
  description: "Browse disability resources, programs, and services in {{ loc.name }}."
---
```

```html
<h1>{{ loc.name }} Resources</h1>
<p>{{ resources[loc.dataKey] | length }} resources available in {{ loc.name }}.</p>

<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
  {% for resource in resources[loc.dataKey] %}
    {% include "components/resource-card.njk" %}
  {% endfor %}
</div>

<a href="/resources/" class="btn-secondary">View All Resources</a>
```

### Step 3: Verify Output

```bash
npm run build:11ty
# Should now exist:
ls _site/resources/virginia/index.html
ls _site/resources/portland/index.html
ls _site/resources/national/index.html
```

See the **eleventy** skill for pagination configuration details.

---

## Category Landing Pages

Extract unique categories from resource data and generate a page per category.

### WARNING: Don't Generate Empty Pages

**The Problem:**

```yaml
# BAD - generating pages for every possible category
# Some categories may have 0-1 resources
pagination:
  data: allCategories
  size: 1
```

**Why This Breaks:**
1. Pages with 0-1 resources are thin content — Google penalizes these
2. Wasted crawl budget on low-value pages
3. Poor user experience landing on near-empty pages

**The Fix:**

Filter categories to only those with 3+ resources:

```javascript
// .eleventy.js — computed data or filter
eleventyConfig.addCollection("categoryPages", function(collectionApi) {
  const resources = require("./src/_data/resources/nova.json")
    .concat(require("./src/_data/resources/portland.json"))
    .concat(require("./src/_data/resources/national.json"));

  const counts = {};
  resources.forEach(r => {
    (r.category || []).forEach(cat => {
      counts[cat] = (counts[cat] || 0) + 1;
    });
  });

  return Object.entries(counts)
    .filter(([, count]) => count >= 3)
    .map(([slug, count]) => ({ slug, count }));
});
```

---

## Therapy Guide Sub-Pages

The therapy guide covers 8 therapy types on one page. Each type is a distinct search query with different intent.

### Split Strategy

```yaml
# src/pages/therapy-guide/occupational-therapy.njk
---
layout: layouts/page.njk
title: "Occupational Therapy for Children with Disabilities"
description: "Learn what occupational therapy is, when it helps, what to expect in sessions, and how to find an OT provider."
permalink: /therapy-guide/occupational-therapy/
---
```

```html
<nav aria-label="Therapy Guide">
  <a href="/therapy-guide/">All Therapy Types</a> &rarr;
  <span>Occupational Therapy</span>
</nav>

<h1>Occupational Therapy</h1>
<!-- Deep content for this therapy type -->

<h2>Related Resources</h2>
{% set therapyResources = collections.allResources | filterByCategory("therapy") %}
{% for resource in therapyResources | limit(6) %}
  {% include "components/resource-card.njk" %}
{% endfor %}
<a href="/resources/?category=therapy" class="btn-secondary">View All Therapy Resources</a>
```

The index page (`/therapy-guide/`) becomes a hub linking to each sub-page.

---

## URL Structure Conventions

### DO: Use Descriptive, Hierarchical URLs

```
/resources/virginia/               ← Location scope
/resources/virginia/therapy/        ← Location + category
/therapy-guide/occupational-therapy/ ← Topic hierarchy
/blog/welcome-to-the-fullest-project/ ← Descriptive slug
```

### DON'T: Use Query Parameters for Indexable Content

```
/resources/?location=virginia       ← Not indexable as unique page
/resources/?category=therapy        ← Same problem
/therapy-guide/#occupational-therapy ← Hash fragments ignored by Google
```

**Why:** Query parameters and hash fragments don't create unique, indexable pages. Google may crawl them but treats them as variants of the base URL, not standalone content.

---

## Programmatic SEO Validation Checklist

Copy this checklist and track progress:
- [ ] Step 1: Create location data file (`src/_data/locationPages.json`)
- [ ] Step 2: Create paginated location template
- [ ] Step 3: Build and verify location pages exist in `_site/`
- [ ] Step 4: Verify each generated page has unique title + description
- [ ] Step 5: Check sitemap includes new pages
- [ ] Step 6: Add internal links from `/resources/` hub to location sub-pages
- [ ] Step 7: Verify no thin pages (each has 3+ resources)

See the **nunjucks** skill for template syntax in paginated files. See the **json** skill for data file structure.
