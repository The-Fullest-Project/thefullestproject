# On-Page Reference: Meta Tags, Open Graph, and Structured Data Alignment

## Contents
- Current Meta Tag State
- Aligning OG Tags with JSON-LD
- Missing Canonical Tags
- WARNING: Mismatched Title Patterns
- Twitter Card Tags
- Image Metadata
- Per-Page Schema Integration

## Current Meta Tag State

`src/_includes/layouts/base.njk` currently has:

```html
<title>{{ title }} | {{ site.name }}</title>
<meta name="description" content="{{ description or site.description }}">
<meta property="og:title" content="{{ title }} | {{ site.name }}">
<meta property="og:description" content="{{ description or site.description }}">
<meta property="og:type" content="website">
<meta property="og:url" content="{{ site.url }}{{ page.url }}">
<meta property="og:site_name" content="{{ site.name }}">
```

What's present: title, description, basic Open Graph.
What's missing: canonical URL, Twitter cards, og:image, JSON-LD.

## Aligning OG Tags with JSON-LD

Structured data and Open Graph should be consistent. When the JSON-LD says the page is a `BlogPosting` with headline "X", the og:title should also be "X".

```html
<!-- GOOD - Consistent signals in base.njk -->
<title>{{ title }} | {{ site.name }}</title>
<meta property="og:title" content="{{ title }} | {{ site.name }}">

<!-- JSON-LD uses the same title variable -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "{{ site.name }}",
  "url": "{{ site.url }}"
}
</script>
```

For blog posts in `post.njk`, override `og:type`:

```html
<!-- In post.njk, add a block or inline override -->
<!-- The og:type in base.njk says "website" but blog posts should be "article" -->
```

To fix this, add a conditional in `base.njk`:

```html
<meta property="og:type" content="{{ ogType or 'website' }}">
```

Then set `ogType: "article"` in blog post front matter or in `post.njk`'s front matter cascade.

## Missing Canonical Tags

**Every page needs a canonical URL.** The site has none.

Add to `base.njk` `<head>`:

```html
<link rel="canonical" href="{{ site.url }}{{ page.url }}">
```

This prevents duplicate content issues and aligns with the `mainEntityOfPage` in JSON-LD structured data. See the **inspecting-search-coverage** skill for a full audit.

### WARNING: Mismatched Title Patterns

**The Problem:**

```html
<!-- BAD - Title says one thing, JSON-LD says another -->
<title>Home | The Fullest Project</title>
<script type="application/ld+json">
{ "name": "The Fullest Project - Living Life to the Fullest" }
</script>
```

**Why This Breaks:**
1. Google may show the JSON-LD name instead of the `<title>` in search results
2. Inconsistency signals low quality to Google's systems
3. Users see different text in browser tab vs. search result snippet

**The Fix:**

Use the same Nunjucks variables for both:

```html
<title>{{ title }} | {{ site.name }}</title>
<script type="application/ld+json">
{
  "name": "{{ title }} | {{ site.name }}"
}
</script>
```

**When You Might Be Tempted:** When trying to stuff extra keywords into JSON-LD that aren't in the visible page title.

## Twitter Card Tags

Add to `base.njk` alongside Open Graph:

```html
<!-- Twitter Card -->
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="{{ title }} | {{ site.name }}">
<meta name="twitter:description" content="{{ description or site.description }}">
```

For blog posts with images, upgrade to `summary_large_image`:

```html
{% if image %}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="{{ site.url }}{{ image }}">
{% else %}
<meta name="twitter:card" content="summary">
{% endif %}
```

## Image Metadata

The site currently has no `og:image`. Add a default site image and allow per-page overrides:

```html
<!-- In base.njk <head> -->
<meta property="og:image" content="{{ site.url }}{{ image or '/images/og-default.jpg' }}">
```

For JSON-LD on blog posts:

```html
{% if image %}
"image": "{{ site.url }}{{ image }}",
{% endif %}
```

Blog post front matter should support an `image` field:

```yaml
---
layout: layouts/post.njk
title: "Welcome to The Fullest Project"
date: 2026-03-06
author: "Erin & Nicole"
image: "/images/blog/welcome.jpg"
---
```

See the **markdown** skill for front matter conventions.

## Per-Page Schema Integration

Each page type maps to specific schema + meta tag combinations:

| Page | og:type | JSON-LD Type | Extra Meta |
|------|---------|-------------|------------|
| Homepage (`index.njk`) | `website` | Organization + WebSite | — |
| Blog post (`post.njk`) | `article` | BlogPosting | `article:published_time` |
| Resource directory | `website` | ItemList | — |
| About page | `website` | Organization (enhanced) | — |
| Therapy guide | `website` | FAQPage or Article | — |
| Contact page | `website` | ContactPage | — |

Add `article:published_time` for blog posts in `post.njk`:

```html
<meta property="article:published_time" content="{{ date | dateISO }}">
<meta property="article:author" content="{{ author }}">
```

Copy this checklist and track progress:
- [ ] Add canonical URL to `base.njk`
- [ ] Add Twitter Card tags to `base.njk`
- [ ] Add conditional `og:type` (website vs article)
- [ ] Add `og:image` with default fallback
- [ ] Add `article:published_time` to `post.njk`
- [ ] Add `image` field to blog post front matter
- [ ] Validate all meta tags align with JSON-LD values
