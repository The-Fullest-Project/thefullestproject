# On-Page SEO Reference

## Contents
- Front Matter Requirements
- Meta Tag Generation in base.njk
- Open Graph Tags
- Twitter Card Tags
- Heading Hierarchy
- Image Alt Text
- Internal Linking Audit

---

## Front Matter Requirements

Every page and post MUST include `title` and `description` in YAML front matter. Eleventy passes these to `base.njk` for meta tag rendering.

### Page Front Matter Pattern

```yaml
# src/pages/resources.njk
---
layout: layouts/base.njk
title: Resource Directory
description: "Find local and national disability resources, programs, foundations, and services."
permalink: /resources/
---
```

### Blog Post Front Matter Pattern

```yaml
# src/blog/welcome.md
---
layout: layouts/post.njk
title: "Welcome to The Fullest Project"
date: 2026-03-06
author: "Erin & Nicole"
category: "Announcement"
excerpt: "We're excited to launch The Fullest Project..."
tags:
  - announcement
---
```

### WARNING: Blog Posts Use `excerpt` Instead of `description`

**The Problem:**

```yaml
# BAD - blog posts have excerpt but no description
excerpt: "We're excited to launch..."
# base.njk renders: {{ description or site.description }}
# Result: falls back to generic site description for EVERY blog post
```

**Why This Breaks:**
1. Every blog post shares the same meta description in search results
2. Google may generate its own snippet, which is often worse than a crafted one
3. Click-through rates drop when descriptions are generic

**The Fix:**

Option A — add `description` to blog post front matter:

```yaml
description: "We're excited to launch The Fullest Project — a centralized hub for disability resources and caregiver support."
```

Option B — update `base.njk` to fall back to `excerpt`:

```html
<meta name="description" content="{{ description or excerpt or site.description }}">
```

---

## Meta Tag Generation in base.njk

Current state of `src/_includes/layouts/base.njk` `<head>`:

```html
<title>{{ title }} | {{ site.name }}</title>
<meta name="description" content="{{ description or site.description }}">
<meta property="og:title" content="{{ title }} | {{ site.name }}">
<meta property="og:description" content="{{ description or site.description }}">
<meta property="og:type" content="website">
<meta property="og:url" content="{{ site.url }}{{ page.url }}">
<meta property="og:site_name" content="{{ site.name }}">
```

### What's Missing

| Tag | Status | Impact |
|-----|--------|--------|
| `<link rel="canonical">` | Missing | Duplicate URL confusion |
| `og:image` | Missing | No preview image on social shares |
| `og:locale` | Missing | Minor — defaults to en_US |
| Twitter Card tags | Missing | No Twitter preview card |
| `meta name="robots"` | Missing | Minor — defaults to index,follow |

### Complete Head Template

```html
<!-- Add these to base.njk <head> after existing OG tags -->
<link rel="canonical" href="{{ site.url }}{{ page.url }}">
<meta property="og:image" content="{{ image or site.url + '/images/og-default.jpg' }}">
<meta property="og:locale" content="en_US">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{{ title }} | {{ site.name }}">
<meta name="twitter:description" content="{{ description or site.description }}">
<meta name="twitter:image" content="{{ image or site.url + '/images/og-default.jpg' }}">
```

---

## Open Graph Tags

### WARNING: Missing og:image

**The Problem:**

```html
<!-- BAD - no og:image in base.njk -->
<!-- When shared on Facebook/LinkedIn/Slack, no preview image appears -->
```

**Why This Breaks:**
1. Social shares without images get 3-5x fewer clicks
2. Slack/Discord/iMessage show a blank preview card
3. First impressions of the site on social media are poor

**The Fix:**

1. Create a default OG image at `src/images/og-default.jpg` (1200x630px)
2. Add to `site.json`: `"ogImage": "/images/og-default.jpg"`
3. Add to `base.njk`:

```html
<meta property="og:image" content="{{ site.url }}{{ image or site.ogImage }}">
```

4. For blog posts, add per-post images via front matter `image` field

---

## Heading Hierarchy

Every page should follow a strict H1 > H2 > H3 hierarchy. Common issues:

### DO: One H1 Per Page

```html
<!-- GOOD - resources.njk -->
<h1>Resource Directory</h1>
<h2>Filter Resources</h2>
<h2>All Resources</h2>
```

### DON'T: Skip Heading Levels

```html
<!-- BAD - jumping from H1 to H3 -->
<h1>Therapy Guide</h1>
<h3>Occupational Therapy</h3>  <!-- Should be H2 -->
```

### Audit Headings Across Pages

```bash
# After building, check heading structure in output
grep -n "<h[1-6]" _site/therapy-guide/index.html
grep -n "<h[1-6]" _site/school-iep/index.html
```

---

## Image Alt Text

Every `<img>` must have meaningful `alt` text. Decorative images use `alt=""` with `aria-hidden="true"`.

```bash
# Find images missing alt attributes in built output
grep -rn "<img" _site/ --include="*.html" | grep -v "alt="
```

---

## Internal Linking Audit

The nav (`src/_includes/components/nav.njk`) and footer link to all major sections. Verify coverage:

| Page | Linked from Nav | Linked from Footer | Linked from Content |
|------|----------------|--------------------|---------------------|
| `/resources/` | Yes | Yes | Homepage CTA |
| `/therapy-guide/` | Yes | Yes | Resources page |
| `/school-iep/` | Yes | Yes | Resources page |
| `/blog/` | Yes | Yes | Homepage |
| `/contact/` | Yes (CTA) | Yes | About page |
| `/submit-resource/` | No | Yes | Resources page |

### WARNING: Orphan Pages

Any page not linked from nav, footer, OR other content pages is effectively invisible to crawlers (sitemap alone is weak signal). Verify with:

```bash
# Check which internal URLs appear in nav + footer
grep -o 'href="[^"]*"' src/_includes/components/nav.njk src/_includes/components/footer.njk | sort -u
```

See the **tuning-landing-journeys** skill for optimizing internal link flow.
