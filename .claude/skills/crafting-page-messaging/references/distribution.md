# Distribution Reference

## Contents
- Distribution Channels in This Project
- SEO: Meta and Open Graph
- Sitemap and Robots
- Cross-Page Internal Linking
- WARNING: Missing Social Meta Images
- WARNING: Newsletter as Only Distribution Channel
- Content Distribution Checklist

## Distribution Channels in This Project

This is a static site on shared hosting (GoDaddy FTP). Distribution channels are limited to what a static site can support:

| Channel | Implementation | Status |
|---------|---------------|--------|
| Organic search (SEO) | Meta descriptions, sitemap.xml, robots.txt | Active |
| Newsletter (Formspree) | Email capture on homepage + footer | Active |
| Social sharing | Open Graph meta tags in `base.njk` | Partial — missing `og:image` |
| Blog content | `src/blog/*.md` | Placeholder (no posts yet) |
| Podcast | `src/podcast/*.md` | Placeholder (no episodes yet) |
| Social media profiles | `src/_data/site.json` `social` object | Empty (Instagram, Facebook unfilled) |
| Deep links from educational pages | URL params to filtered resource views | Active |

## SEO: Meta and Open Graph

Every page gets meta tags from `src/_includes/layouts/base.njk`:

```njk
<title>{{ title }} | {{ site.name }}</title>
<meta name="description" content="{{ description or site.description }}">
<meta property="og:title" content="{{ title }} | {{ site.name }}">
<meta property="og:description" content="{{ description or site.description }}">
<meta property="og:type" content="website">
<meta property="og:url" content="{{ site.url }}{{ page.url }}">
<meta property="og:site_name" content="{{ site.name }}">
```

### DO: Write Front Matter Description for Every Page

```yaml
---
title: Therapy Guide
description: "Learn about different therapy types for individuals with disabilities, when each is most beneficial, and how to find the right provider."
---
```

This powers both `<meta name="description">` and `og:description`. If omitted, the fallback is `site.description` from `src/_data/site.json`, which is generic.

### DON'T: Reuse the Same Description Across Pages

```yaml
# BAD — every page defaults to the site-level description
---
title: Adaptive Equipment
# no description field
---
```

**Why this breaks:** Search engines treat duplicate meta descriptions as a signal that pages lack unique value. Each page should have a unique description matching its specific content.

## Sitemap and Robots

The sitemap is auto-generated at `src/sitemap.njk`:

```njk
{%- for page in collections.all %}
{%- if page.url and not page.data.eleventyExcludeFromCollections %}
<url>
  <loc>{{ site.url }}{{ page.url }}</loc>
  <lastmod>{{ page.date | dateFormat }}</lastmod>
</url>
{%- endif %}
{%- endfor %}
```

Every page in `collections.all` is included unless it sets `eleventyExcludeFromCollections: true`. See the **eleventy** skill for collection configuration.

## Cross-Page Internal Linking

The most effective distribution in this codebase is **cross-page linking from educational content to the resource directory with filters**:

```njk
{# therapy-guide → filtered resources #}
<a href="/resources/?category=therapy">Browse Therapy Providers</a>

{# school-iep → filtered resources #}
<a href="/resources/?category=legal">Find IEP Advocates & Law Firms</a>

{# adaptive-equipment → filtered resources #}
<a href="/resources/?category=equipment">Browse All Equipment Resources</a>
```

`src/js/resourceFilter.js` reads `category` and `location` from URL search params and auto-applies filters on page load. This turns every educational page into a distribution channel for the resource directory.

### DO: Link to Filtered Views, Not the Generic Directory

```njk
{# GOOD — visitor lands on a relevant, pre-filtered view #}
<a href="/resources/?category=therapy" class="btn-primary no-underline">Browse Therapy Providers</a>
```

### DON'T: Always Link to the Unfiltered Directory

```njk
{# BAD — visitor has to re-orient and filter manually #}
<a href="/resources/" class="btn-primary no-underline">View Resources</a>
```

## WARNING: Missing Social Meta Images

**The Problem:** No `og:image` meta tag is set in `base.njk`. Social shares display with no preview image.

**Why This Breaks:**
1. Social cards without images get 40-60% fewer clicks
2. Shared links look broken or generic on Facebook/LinkedIn/Twitter
3. The site loses its biggest free distribution amplifier

**The Fix:** Add a default `og:image` to `base.njk` and allow per-page overrides via front matter:

```njk
{# In src/_includes/layouts/base.njk <head> #}
<meta property="og:image" content="{{ ogImage or site.url + '/images/og-default.jpg' }}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
```

```yaml
# Per-page override in front matter
---
title: Therapy Guide
ogImage: "https://thefullestproject.org/images/og-therapy-guide.jpg"
---
```

## WARNING: Newsletter as Only Distribution Channel

**The Problem:** The newsletter via Formspree is the only active outbound channel. Social profiles in `site.json` are empty strings.

**Why This Breaks:** A single distribution channel means zero reach beyond direct visitors and email subscribers. No social presence means no shareability, no community building, and no referral traffic.

**The Fix:** Prioritize filling `src/_data/site.json` social fields and adding social links to the footer:

```json
{
  "social": {
    "instagram": "https://instagram.com/thefullestproject",
    "facebook": "https://facebook.com/thefullestproject"
  }
}
```

Then reference in templates:

```njk
{# In footer or anywhere social links appear #}
{% if site.social.instagram %}
<a href="{{ site.social.instagram }}" target="_blank" rel="noopener noreferrer">Instagram</a>
{% endif %}
```

## Content Distribution Checklist

Copy this checklist when publishing new content:

- [ ] Page has unique `description` in YAML front matter (120-155 chars)
- [ ] Page has unique `title` (under 60 chars, keyword-first)
- [ ] Educational pages link to filtered resource directory views
- [ ] Blog posts include internal links to relevant resource categories
- [ ] `og:image` is set (default or per-page override)
- [ ] Sitemap includes the new page (check `eleventyExcludeFromCollections` is not set)
- [ ] Newsletter subscribers are notified of significant new content
- [ ] Social profiles are linked and content is shared (when profiles are active)
