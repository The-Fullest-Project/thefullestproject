# Technical SEO Reference

## Contents
- Canonical URLs
- Sitemap Generation
- Robots.txt Configuration
- Crawlability of Client-Side Filtered Content
- Build Validation Workflow

---

## Canonical URLs

The `base.njk` layout currently lacks `<link rel="canonical">`. Without it, search engines may index duplicate URLs (trailing slash variants, query params from resourceFilter.js).

### WARNING: Missing Canonical Tags

**The Problem:**

```html
<!-- BAD - base.njk <head> has no canonical -->
<meta name="description" content="{{ description or site.description }}">
<meta property="og:url" content="{{ site.url }}{{ page.url }}">
<!-- og:url is NOT a substitute for canonical -->
```

**Why This Breaks:**
1. Google may split ranking signals across duplicate URLs (`/resources` vs `/resources/` vs `/resources/?location=virginia`)
2. `og:url` is only used by social platforms, not search engine canonicalization
3. Query parameters from client-side filters create infinite URL variants

**The Fix:**

```html
<!-- GOOD - Add to base.njk <head>, after <meta name="description"> -->
<link rel="canonical" href="{{ site.url }}{{ page.url }}">
```

---

## Sitemap Generation

The sitemap at `src/sitemap.njk` uses the `dateFormat` filter, which outputs human-readable dates like "March 6, 2026". Sitemaps require ISO 8601 (`YYYY-MM-DD`).

### WARNING: Non-Standard Date Format in Sitemap

**The Problem:**

```xml
<!-- BAD - dateFormat outputs "March 6, 2026" -->
<lastmod>{{ page.date | dateFormat }}</lastmod>
```

**Why This Breaks:**
1. Google silently ignores invalid `<lastmod>` values
2. You lose the ability to signal content freshness — critical for weekly-scraped resource data
3. Google Search Console may report sitemap parsing warnings

**The Fix:**

Add an `isoDate` filter in `.eleventy.js`. See the **eleventy** skill for filter registration.

```javascript
// .eleventy.js — add this filter
eleventyConfig.addFilter("isoDate", (date) => {
  return new Date(date).toISOString().split("T")[0];
});
```

```xml
<!-- src/sitemap.njk — use isoDate instead of dateFormat -->
<lastmod>{{ page.date | isoDate }}</lastmod>
```

### Sitemap Completeness Check

After building, verify all public pages appear:

```bash
npm run build:11ty
# Count URLs in sitemap
grep -c "<loc>" _site/sitemap.xml

# Compare against page count
find _site -name "index.html" | wc -l
```

Expected: sitemap URL count should roughly match HTML page count (minus excluded pages like 404).

---

## Robots.txt Configuration

Current `src/robots.njk` is minimal and correct:

```
User-agent: *
Allow: /

Sitemap: {{ site.url }}/sitemap.xml
```

**Validation:** After build, confirm `_site/robots.txt` resolves `{{ site.url }}` to the actual domain (`https://thefullestproject.org`). A literal `{{ site.url }}` in output means Nunjucks didn't process the template — check that `robots.njk` uses the correct front matter and isn't copied as a raw passthrough.

---

## Crawlability of Client-Side Filtered Content

### WARNING: JavaScript-Only Resource Filtering Is Invisible to Search Engines

**The Problem:**

```javascript
// src/js/resourceFilter.js — toggles display:none on cards
// Search engines see ALL cards in the HTML, but filtered views
// (e.g., /resources/?location=virginia&category=therapy)
// are NOT unique indexable pages
```

**Why This Breaks:**
1. No unique URL exists for "Virginia therapy resources" — it's all one page with JS toggling
2. Search engines index the unfiltered page with 100+ resources, diluting keyword relevance
3. Users searching "disability resources Northern Virginia" land on a generic page

**The Fix:**

Generate static filter pages at build time. See the **programmatic** reference for implementation.

```
/resources/                    → All resources (existing)
/resources/virginia/           → Virginia resources (new static page)
/resources/portland/           → Portland resources (new static page)
/resources/virginia/therapy/   → Virginia therapy (new static page)
```

---

## Build Validation Workflow

1. Make SEO changes to templates
2. Build: `npm run build`
3. Validate sitemap: `grep "<lastmod>" _site/sitemap.xml` — dates should be `YYYY-MM-DD`
4. Validate canonical: `grep "canonical" _site/index.html` — should contain full URL
5. Validate robots: confirm `_site/robots.txt` has resolved domain URL
6. If any check fails, fix templates and repeat from step 2
7. Only deploy when all validations pass

---

## Quick Diagnostic Commands

```bash
# Find pages missing description in front matter
grep -rL "description:" src/pages/ --include="*.njk"

# Check if canonical tag exists in base layout
grep "canonical" src/_includes/layouts/base.njk

# Verify sitemap references in robots.txt output
cat _site/robots.txt

# Count resources rendered server-side in built HTML
grep -c "resource-card\|data-location" _site/resources/index.html
```
