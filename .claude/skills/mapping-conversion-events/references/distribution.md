# Distribution Reference

## Contents
- Current Distribution Channels
- SEO as Primary Distribution
- Sitemap and Robots Configuration
- Content-to-Conversion Paths
- WARNING: No Social Sharing Infrastructure
- Email as Distribution Channel

## Current Distribution Channels

| Channel | Status | Entry Point | Conversion Path |
|---------|--------|-------------|-----------------|
| Organic search (SEO) | Active (sitemap exists) | Any page | Page → Resources → Form |
| Direct / bookmark | Active | Homepage | Home → Resources → Form |
| Email newsletter | Configured (Formspree) | Email link | Landing page → Action |
| Social media | Not configured | — | — |
| Referral / backlink | Passive | Any page | Page → Resources → Form |

**Reality:** This is an SEO-first static site. Organic search is the primary acquisition channel. Every page is a potential landing page.

## SEO as Primary Distribution

The site generates `sitemap.xml` and `robots.txt` via Nunjucks templates:

```xml
{# src/sitemap.njk — generates XML sitemap #}
---
permalink: /sitemap.xml
eleventyExcludeFromCollections: true
---
<?xml version="1.0" encoding="utf-8"?>
<urlset xmlns="http://www.w3.org/2000/svg">
  {%- for page in collections.all %}
  <url>
    <loc>{{ site.url }}{{ page.url }}</loc>
    <lastmod>{{ page.date | dateFormat }}</lastmod>
  </url>
  {%- endfor %}
</urlset>
```

```text
{# src/robots.njk #}
---
permalink: /robots.txt
eleventyExcludeFromCollections: true
---
Sitemap: {{ site.url }}/sitemap.xml
User-agent: *
Allow: /
```

See the **inspecting-search-coverage** skill for SEO audit patterns and the **adding-structured-signals** skill for schema.org markup.

## Content-to-Conversion Paths

Every content page must funnel toward a conversion event. Current paths:

### Educational Pages → Resource Directory

```
therapy-guide/index.njk  →  /resources/?category=therapy
adaptive-equipment.njk   →  /resources/?category=equipment
school-iep/index.njk     →  /resources/?category=legal
```

Each uses a contextual CTA at the bottom:

```html
{# src/pages/therapy-guide/index.njk:135 #}
<a href="/resources/?category=therapy" class="btn-primary">Browse Therapy Providers</a>
```

### DO: Every educational page ends with a resource directory link

```html
{# Pattern: educational content → filtered resources #}
<section class="text-center py-12">
  <h2 class="text-2xl font-bold mb-4">Find [Topic] Resources</h2>
  <a href="/resources/?category=[slug]" class="btn-primary">
    Browse [Topic] Resources
  </a>
</section>
```

### DON'T: End content pages with no next step

```html
{# BAD — dead end, user bounces #}
<p>We hope this guide was helpful!</p>
```

**Why:** Every page without a CTA is a leak in the funnel. The user engaged enough to read — give them a conversion path.

### Blog Posts → Multiple Conversion Paths

Blog posts use the `post` layout. Add conversion CTAs to the post layout:

```html
{# src/_includes/layouts/post.njk — after {{ content }} #}
<aside class="mt-12 p-6 card">
  <h3 class="text-lg font-bold mb-2">Stay Connected</h3>
  <p class="text-gray-600 mb-4">Get more resources and stories in your inbox.</p>
  <form action="https://formspree.io/f/{{ site.formspree.newsletter }}" method="POST"
        data-form-type="newsletter-post">
    <input type="email" name="email" placeholder="Your email" required class="form-input">
    <button type="submit" class="btn-secondary mt-2">Subscribe</button>
  </form>
</aside>
```

## WARNING: No Social Sharing Infrastructure

**Detected:** `site.json` has empty social media URLs (`instagram: ""`, `facebook: ""`). No Open Graph or Twitter Card meta tags in `base.njk`.

**Impact:** Shared links on social media show no preview image, no description, no branding. This kills social distribution before it starts.

**The Fix — Add OG tags to base layout:**

```html
{# src/_includes/layouts/base.njk — inside <head> #}
<meta property="og:title" content="{{ title }} | {{ site.name }}">
<meta property="og:description" content="{{ description }}">
<meta property="og:type" content="website">
<meta property="og:url" content="{{ site.url }}{{ page.url }}">
<meta property="og:image" content="{{ site.url }}/images/og-default.jpg">
<meta name="twitter:card" content="summary_large_image">
```

See the **frontend-design** skill for meta tag patterns in Nunjucks layouts.

## Email as Distribution Channel

Formspree captures email addresses but has no built-in email sending. Distribution via email requires:

1. **Export subscribers** from Formspree dashboard
2. **Send via external tool** (Mailchimp, Buttondown, ConvertKit)
3. **Or use Formspree's autoresponder** for immediate confirmation

The `interest=gig-platform` hidden field on the services page (`src/pages/services/index.njk:66`) enables subscriber segmentation:

```html
<input type="hidden" name="interest" value="gig-platform">
```

### DO: Segment from the start

Add hidden fields to differentiate newsletter sources:

```html
{# Homepage newsletter #}
<input type="hidden" name="_source" value="homepage">

{# Footer newsletter #}
<input type="hidden" name="_source" value="footer">

{# Post-article newsletter #}
<input type="hidden" name="_source" value="blog-post">
```

This enables analysis of which placement converts best. See the **designing-lifecycle-messages** skill for email sequence planning.

### DON'T: Use one undifferentiated list

```html
{# BAD — all subscribers look identical #}
<form action="https://formspree.io/f/{{ site.formspree.newsletter }}" method="POST">
  <input type="email" name="email" required>
  <button type="submit">Subscribe</button>
</form>
```

**Why:** Without source tagging, you cannot measure which placement drives conversions or tailor welcome sequences.
