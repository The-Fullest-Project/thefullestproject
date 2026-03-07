# Distribution Reference

## Contents
- Entry Points Into the Site
- Internal Linking Architecture
- SEO Surface Area
- URL Parameter Distribution
- WARNING: Anti-Patterns
- Distribution Expansion Checklist

## Entry Points Into the Site

On a static site with no paid acquisition, distribution means organic search, direct links, and social sharing. Every page is a potential entry point.

| Entry Type | Primary Pages | Why |
|------------|--------------|-----|
| Organic search | Resource directory, therapy guide, school-iep | Long-tail queries from caregivers searching for specific help |
| Direct/bookmarked | Homepage, resources | Returning visitors |
| Social/referral | Blog posts, about page | Shareable stories and mission |
| Internal referral | Resource cards (external links) | Partners linking back |

## Internal Linking Architecture

The site uses a hub-and-spoke model:

```
Homepage (hub)
├── Resources (conversion hub)
│   ├── Pre-filtered views via ?category= and ?location=
│   └── Submit Resource (community loop)
├── Educational spokes
│   ├── Therapy Guide → /resources/?category=therapy
│   ├── Adaptive Equipment → /resources/?category=equipment
│   └── School & IEP → /resources/?category=legal
├── Content spokes
│   ├── Blog → individual posts
│   └── Podcast → individual episodes
├── Trust pages
│   ├── About → /resources/ or /contact/
│   └── Services → /contact/?subject=partnership
└── Footer (secondary hub)
    ├── Newsletter signup
    └── All major page links
```

### Cross-Linking From Educational Pages

Every educational page should link back to the resource directory with a filtered view:

```njk
{# src/pages/therapy-guide/index.njk — bottom CTA #}
<a href="/resources/?category=therapy" class="btn-primary inline-block mt-4">
  Browse Therapy Providers
</a>
```

```njk
{# src/pages/school-iep/index.njk — bottom CTA #}
<a href="/resources/?category=legal" class="btn-primary inline-block mt-4">
  Find IEP Advocates & Law Firms
</a>
```

### WARNING: Orphan Pages

**The Problem:** A page exists but is only linked from the nav — no contextual links from related content.

**Why This Breaks:**
1. Search engines rank pages higher when they have contextual internal links (not just nav links)
2. Visitors navigating through content never discover the page
3. The page gets less traffic despite being valuable

**The Fix:** Every page should have at least 2-3 contextual internal links beyond the nav. For example, the therapy guide should be linked from:
- Homepage content cards (already done)
- Relevant blog posts mentioning therapy
- Resource directory sidebar or footer
- About page where applicable

## SEO Surface Area

### Sitemap Generation

The site generates an XML sitemap at build time:

```njk
{# src/sitemap.njk #}
---
permalink: /sitemap.xml
eleventyExcludeFromCollections: true
---
<?xml version="1.0" encoding="utf-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  {%- for page in collections.all %}
  <url>
    <loc>{{ site.url }}{{ page.url }}</loc>
    <lastmod>{{ page.date | dateFormat }}</lastmod>
  </url>
  {%- endfor %}
</urlset>
```

See the **eleventy** skill for modifying collections included in the sitemap.

### robots.txt

```njk
{# src/robots.njk #}
---
permalink: /robots.txt
eleventyExcludeFromCollections: true
---
Sitemap: {{ site.url }}/sitemap.xml
User-agent: *
Allow: /
```

### Structured Data Opportunity

The site currently has NO structured data (JSON-LD). This is a significant SEO gap for a resource directory.

```njk
{# Add to src/_includes/layouts/base.njk <head> #}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "{{ site.name }}",
  "url": "{{ site.url }}",
  "description": "{{ site.description }}"
}
</script>
```

See the **adding-structured-signals** skill for Organization, LocalBusiness, and FAQ schema.

## URL Parameter Distribution

Pre-filtered resource links serve as pseudo-landing-pages:

| URL | Serves As |
|-----|-----------|
| `/resources/?category=therapy` | Therapy provider directory |
| `/resources/?category=equipment` | Equipment directory |
| `/resources/?category=legal` | Legal/advocacy directory |
| `/resources/?location=Virginia` | Virginia resources |

### WARNING: URL Params Not Indexed by Search Engines

**The Problem:** Google treats `/resources/?category=therapy` as the same page as `/resources/`. Your filtered views get zero organic search traffic.

**Why This Breaks:** A caregiver searching "disability therapy providers Virginia" won't find your filtered view — only the unfiltered resource page.

**The Fix (Long-Term):** Generate static filtered pages at build time via Eleventy pagination:

```javascript
// .eleventy.js — generate per-category pages
eleventyConfig.addCollection("resourceCategories", function(collectionApi) {
  // Extract unique categories from resource data
  // Generate /resources/therapy/, /resources/equipment/, etc.
});
```

This is a significant architectural change. See the **eleventy** skill for pagination patterns.

## Distribution Expansion Checklist

- [ ] Every educational page links to `/resources/?category=X` with a relevant filter
- [ ] Blog posts link to related resource categories inline
- [ ] About page links to resources and contact
- [ ] Services page links to contact with subject pre-populated
- [ ] Footer includes all major page links
- [ ] Sitemap includes all pages and blog posts
- [ ] Meta descriptions are set for every page (YAML front matter)
- [ ] No orphan pages — each page has 2+ contextual inbound links

See the **inspecting-search-coverage** skill for auditing indexability.
