# Structured Data (JSON-LD) Reference

## Contents
- Current State: No Structured Data
- Organization Schema
- WebSite Schema with Search
- Article Schema for Blog Posts
- BreadcrumbList Schema
- FAQPage Schema for Guides
- Validation Workflow

---

## Current State: No Structured Data

### WARNING: Zero JSON-LD Markup on the Entire Site

**The Problem:**

```bash
# Returns nothing — no structured data anywhere
grep -r "application/ld+json" src/_includes/ src/pages/
```

**Why This Breaks:**
1. No rich results in Google (sitelinks search box, article cards, FAQ accordions, breadcrumbs)
2. Google Knowledge Panel won't show organization info
3. Competitors with structured data get more visual SERP real estate

**The Fix:** Add schema types progressively — Organization and WebSite first (global), then Article (per-post), then BreadcrumbList (per-page). See the **adding-structured-signals** skill for implementation details.

---

## Organization Schema

Add to `base.njk` — appears on every page, tells Google who runs the site.

```html
<!-- src/_includes/layouts/base.njk — before </head> or before </body> -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "{{ site.name }}",
  "url": "{{ site.url }}",
  "description": "{{ site.description }}",
  "email": "{{ site.email }}",
  "sameAs": [
    {% if site.social.instagram %}"{{ site.social.instagram }}"{% endif %}
    {% if site.social.facebook %}{% if site.social.instagram %},{% endif %}"{{ site.social.facebook }}"{% endif %}
  ]
}
</script>
```

### DO: Keep Organization Schema on Every Page

```html
<!-- GOOD - in base.njk, rendered globally -->
<script type="application/ld+json">{ "@type": "Organization", ... }</script>
```

### DON'T: Put Organization Schema on Only the Homepage

```html
<!-- BAD - only in index.njk -->
<!-- Google may not crawl homepage first; other pages lack org signals -->
```

---

## WebSite Schema with Search

Enables the sitelinks search box in Google results. Add to `base.njk` alongside Organization.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "{{ site.name }}",
  "url": "{{ site.url }}",
  "description": "{{ site.description }}",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "{{ site.url }}/resources/?search={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
</script>
```

**Note:** The `target` URL maps to the client-side search in `resourceFilter.js`. Verify that `resourceFilter.js` reads the `search` query parameter on page load.

---

## Article Schema for Blog Posts

Add to `post.njk` layout — applies to each blog post and podcast episode.

```html
<!-- src/_includes/layouts/post.njk — add before </article> or in <head> -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "{{ title }}",
  "description": "{{ description or excerpt }}",
  "datePublished": "{{ date | isoDate }}",
  "dateModified": "{{ date | isoDate }}",
  "author": {
    "@type": "Person",
    "name": "{{ author }}"
  },
  "publisher": {
    "@type": "Organization",
    "name": "{{ site.name }}",
    "url": "{{ site.url }}"
  },
  "mainEntityOfPage": "{{ site.url }}{{ page.url }}"
}
</script>
```

### WARNING: `isoDate` Filter Required

This schema depends on the `isoDate` filter from the [technical reference](technical.md). The default `dateFormat` filter outputs human-readable dates that break schema validation.

```javascript
// .eleventy.js — MUST add this filter first
eleventyConfig.addFilter("isoDate", (date) => {
  return new Date(date).toISOString().split("T")[0];
});
```

---

## BreadcrumbList Schema

Helps Google understand page hierarchy. Generate dynamically from the URL path.

```html
<!-- Add to page.njk layout -->
{% set urlParts = page.url | split("/") | reject("equalto", "") %}
{% if urlParts | length > 0 %}
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
    }{% for part in urlParts %},
    {
      "@type": "ListItem",
      "position": {{ loop.index + 1 }},
      "name": "{{ part | replace('-', ' ') | title }}",
      "item": "{{ site.url }}/{{ urlParts | slice(0, loop.index) | join('/') }}/"
    }{% endfor %}
  ]
}
</script>
{% endif %}
```

**Note:** This uses Nunjucks `split` and `slice` filters. Verify these are available or register them in `.eleventy.js`. See the **eleventy** skill and the **nunjucks** skill.

---

## FAQPage Schema for Guides

The therapy guide and school/IEP guide contain question-answer content that qualifies for FAQ rich results.

```html
<!-- Example for school-iep/index.njk -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the difference between an IEP and a 504 Plan?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "An IEP (Individualized Education Program) provides specialized instruction and services under IDEA. A 504 Plan provides accommodations under Section 504 of the Rehabilitation Act. IEPs require an eligibility determination; 504 Plans have a broader eligibility criteria."
      }
    }
  ]
}
</script>
```

### When to Use FAQPage

- Content already structured as questions and answers
- The therapy guide sections ("What is occupational therapy?", "When is it helpful?")
- The IEP guide sections ("What is an IEP?", "IEP vs 504 Plan")

### When NOT to Use FAQPage

- Marketing pages where questions are manufactured
- Pages where the Q&A format doesn't match the actual content

---

## Validation Workflow

1. Add JSON-LD blocks to templates
2. Build: `npm run build`
3. Copy a page's HTML source
4. Paste into Google's Rich Results Test (https://search.google.com/test/rich-results)
5. If errors appear, fix the template and repeat from step 2
6. Only deploy when all schema types validate without errors

```bash
# Quick local check — verify JSON-LD blocks exist in output
grep -c "application/ld+json" _site/index.html          # Should be >= 2
grep -c "application/ld+json" _site/blog/welcome/index.html  # Should be >= 3
```

See the **adding-structured-signals** skill for the full implementation guide.
