# Programmatic Reference: Eleventy Filters, Data-Driven Schema Generation

## Contents
- Required Eleventy Filters
- Data-Driven JSON-LD from Resource Data
- Nunjucks Loop Patterns for ItemList
- WARNING: JSON Syntax Errors in Loops
- Conditional Property Inclusion
- BreadcrumbList from Page Hierarchy
- Build-Time Validation

## Required Eleventy Filters

Add these filters to `.eleventy.js` alongside the existing `dateFormat` and `limit` filters. See the **eleventy** skill for config patterns.

```javascript
// ISO date for schema.org datePublished
eleventyConfig.addFilter("dateISO", function(date) {
  return new Date(date).toISOString().split('T')[0];
});

// Escape strings for safe JSON output inside JSON-LD
eleventyConfig.addFilter("jsonEscape", function(str) {
  if (!str) return "";
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
});

// Full ISO datetime for Article datePublished
eleventyConfig.addFilter("dateISOFull", function(date) {
  return new Date(date).toISOString();
});
```

## Data-Driven JSON-LD from Resource Data

Resources are loaded from `src/_data/resources/` JSON files. The `.eleventy.js` config merges them into `allResources`. Use this array directly in Nunjucks templates for structured data.

Each resource object has these fields available:

```javascript
// From src/_data/resources/*.json
{
  "name": "Autism Society of America",
  "category": ["nonprofit"],
  "location": "National",
  "description": "Nation's leading grassroots autism organization",
  "phone": "800-328-8476",
  "website": "https://www.autism-society.org/",
  "address": "",
  "ageRange": "",
  "disabilityTypes": [],
  "cost": "",
  "tags": ["autism", "advocacy"],
  "source": "https://...",
  "lastScraped": "2026-03-06"
}
```

Map these to schema.org properties:

| Resource Field | Schema.org Property | Type |
|---------------|-------------------|------|
| `name` | `name` | Text |
| `description` | `description` | Text |
| `website` | `url` | URL |
| `phone` | `telephone` | Text |
| `address` | `address` | Text or PostalAddress |
| `location` | `areaServed` | Text |
| `category` | `additionalType` | Text |

## Nunjucks Loop Patterns for ItemList

When generating an `ItemList` from `allResources`, handle commas between items correctly:

```html
<!-- GOOD - Proper comma handling with loop.last -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Disability Resource Directory",
  "itemListElement": [
    {% for resource in allResources | limit(50) %}
    {
      "@type": "ListItem",
      "position": {{ loop.index }},
      "item": {
        "@type": "Organization",
        "name": "{{ resource.name | jsonEscape }}"
        {% if resource.website %}, "url": "{{ resource.website }}"{% endif %}
        {% if resource.phone %}, "telephone": "{{ resource.phone }}"{% endif %}
      }
    }{% if not loop.last %},{% endif %}
    {% endfor %}
  ]
}
</script>
```

### WARNING: JSON Syntax Errors in Loops

**The Problem:**

```html
<!-- BAD - Trailing comma after last item -->
{% for resource in allResources %}
{
  "name": "{{ resource.name }}"
},
{% endfor %}
```

**Why This Breaks:**
1. The last item gets a trailing comma, producing invalid JSON
2. Google silently ignores the entire JSON-LD block
3. The build succeeds — no error at build time, only discovered via validation

**The Fix:**

Always use `{% if not loop.last %},{% endif %}` after each item:

```html
<!-- GOOD - No trailing comma -->
{% for resource in allResources %}
{
  "name": "{{ resource.name | jsonEscape }}"
}{% if not loop.last %},{% endif %}
{% endfor %}
```

**When You Might Be Tempted:** Every time you loop through collections or arrays in JSON-LD. This applies to `allResources`, `collections.blogPosts`, and any Nunjucks `{% for %}` inside a JSON array.

## Conditional Property Inclusion

Many resource fields are optional. Use Nunjucks conditionals to avoid empty values in JSON-LD:

```html
{
  "@type": "Organization",
  "name": "{{ resource.name | jsonEscape }}"
  {% if resource.description %},
  "description": "{{ resource.description | jsonEscape }}"
  {% endif %}
  {% if resource.website %},
  "url": "{{ resource.website }}"
  {% endif %}
  {% if resource.phone %},
  "telephone": "{{ resource.phone }}"
  {% endif %}
  {% if resource.address %},
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "{{ resource.address | jsonEscape }}"
  }
  {% endif %}
}
```

Pattern: put the comma BEFORE the conditional property, not after. This avoids trailing commas when the last conditional is false.

## BreadcrumbList from Page Hierarchy

Generate breadcrumbs from the page URL. Add this as a reusable Nunjucks partial at `src/_includes/components/structured-breadcrumb.njk`:

```html
{# Breadcrumb structured data - include in page layouts #}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "{{ site.url }}/"
    }
    {% if page.url != "/" %},
    {
      "@type": "ListItem",
      "position": 2,
      "name": "{{ title }}",
      "item": "{{ site.url }}{{ page.url }}"
    }
    {% endif %}
  ]
}
</script>
```

Include it in `page.njk` and `post.njk`:

```html
{% include "components/structured-breadcrumb.njk" %}
```

See the **nunjucks** skill for partial inclusion patterns.

## Build-Time Validation

After changes, validate structured data output:

1. Build: `npm run build`
2. Check output files contain JSON-LD
3. Paste output HTML into Google Rich Results Test
4. Fix errors and rebuild
5. Repeat until clean

```bash
# Quick check: count JSON-LD blocks across all output HTML
grep -r "application/ld+json" _site/ --include="*.html" -c
```

Expected output after full implementation:
- `_site/index.html` — 2+ blocks (Organization + WebSite)
- `_site/blog/welcome/index.html` — 2+ blocks (BlogPosting + BreadcrumbList)
- `_site/resources/index.html` — 2+ blocks (ItemList + BreadcrumbList)
- Every page — at least the base.njk Organization block

Copy this checklist and track progress:
- [ ] Add `dateISO`, `dateISOFull`, `jsonEscape` filters to `.eleventy.js`
- [ ] Create `src/_includes/components/structured-breadcrumb.njk`
- [ ] Add ItemList schema to `resources.njk`
- [ ] Add BreadcrumbList include to `page.njk` and `post.njk`
- [ ] Run `npm run build` and count JSON-LD blocks in output
- [ ] Validate with Rich Results Test — iterate until clean
