# Technical Reference: Structured Data in Eleventy + Nunjucks

## Contents
- JSON-LD Placement in Layouts
- Nunjucks Data Access Inside JSON-LD
- Eleventy Filter Requirements
- WARNING: Broken JSON from Nunjucks Output
- WARNING: Duplicate Structured Data Blocks
- Conditional Schema Blocks
- Build Validation

## JSON-LD Placement in Layouts

JSON-LD blocks go in `<script type="application/ld+json">` tags. In this project, there are two valid placement strategies:

**Site-wide schemas** (Organization, WebSite) go in `src/_includes/layouts/base.njk` inside `<head>`:

```html
<!-- In base.njk <head>, after Open Graph tags -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "{{ site.name }}",
  "url": "{{ site.url }}",
  "description": "{{ site.description }}",
  "email": "{{ site.email }}"
}
</script>
```

**Page-specific schemas** (BlogPosting, FAQPage) go in the page layout or template body. The `post.njk` layout handles all blog and podcast content:

```html
<!-- In post.njk, before closing </article> -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "{{ title }}",
  "datePublished": "{{ date | dateISO }}",
  "author": { "@type": "Person", "name": "{{ author }}" },
  "publisher": {
    "@type": "Organization",
    "name": "{{ site.name }}",
    "url": "{{ site.url }}"
  },
  "description": "{{ excerpt or description or site.description }}",
  "mainEntityOfPage": "{{ site.url }}{{ page.url }}"
}
</script>
```

## Nunjucks Data Access Inside JSON-LD

All data from `src/_data/` is available in templates. Key variables:

| Variable | Source | Example Value |
|----------|--------|---------------|
| `site.name` | `site.json` | `"The Fullest Project"` |
| `site.url` | `site.json` | `"https://thefullestproject.org"` |
| `site.description` | `site.json` | Full description string |
| `site.email` | `site.json` | `"hello@thefullestproject.org"` |
| `page.url` | Eleventy built-in | `"/blog/welcome/"` |
| `title` | Front matter | Page/post title |
| `date` | Front matter | Post date object |
| `author` | Front matter | Post author string |
| `excerpt` | Front matter | Post excerpt string |
| `allResources` | `.eleventy.js` computed | Array of all resource objects |

## Eleventy Filter Requirements

The `dateISO` filter does NOT exist yet. Add it to `.eleventy.js`:

```javascript
// In .eleventy.js, alongside the existing dateFormat filter
eleventyConfig.addFilter("dateISO", function(date) {
  return new Date(date).toISOString().split('T')[0];
});
```

This outputs `"2026-03-06"` format required by schema.org `datePublished`. See the **eleventy** skill for config patterns.

### WARNING: Broken JSON from Nunjucks Output

**The Problem:**

```html
<!-- BAD - Unescaped quotes in description break JSON -->
<script type="application/ld+json">
{
  "description": "{{ resource.description }}"
}
</script>
```

If `resource.description` contains a double quote (`"`), the JSON becomes invalid.

**Why This Breaks:**
1. Google silently ignores invalid JSON-LD — no rich results, no error in Search Console
2. The page renders fine visually, so the bug is invisible without validation
3. Every resource with a quote in its description silently loses structured data

**The Fix:**

Create a `jsonEscape` filter in `.eleventy.js`:

```javascript
eleventyConfig.addFilter("jsonEscape", function(str) {
  if (!str) return "";
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
});
```

Then use it in templates:

```html
<!-- GOOD - Escaped content is safe JSON -->
<script type="application/ld+json">
{
  "description": "{{ resource.description | jsonEscape }}"
}
</script>
```

**When You Might Be Tempted:** Any time you output user-generated or scraped content (resource descriptions, blog excerpts) inside JSON-LD.

### WARNING: Duplicate Structured Data Blocks

**The Problem:**

```html
<!-- BAD - Organization in BOTH base.njk AND index.njk -->
<!-- base.njk has Organization schema -->
<!-- index.njk ALSO adds Organization schema -->
```

**Why This Breaks:**
1. Google sees two conflicting Organization entities on the same page
2. May cause "duplicate structured data" warnings in Search Console
3. Changes must be synchronized in two places — they will drift

**The Fix:**

Site-wide schemas go ONLY in `base.njk`. Page-specific schemas go ONLY in their layout or page template. Never duplicate across inheritance layers.

**When You Might Be Tempted:** When adding homepage-specific Organization details (founders, address). Instead, enhance the single `base.njk` block conditionally.

## Conditional Schema Blocks

Use Nunjucks conditionals when schema properties depend on optional front matter:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "{{ title | jsonEscape }}",
  "datePublished": "{{ date | dateISO }}"
  {% if author %},
  "author": { "@type": "Person", "name": "{{ author | jsonEscape }}" }
  {% endif %}
  {% if excerpt %},
  "description": "{{ excerpt | jsonEscape }}"
  {% endif %}
}
</script>
```

The comma placement (before the conditional property) avoids trailing commas in JSON when the field is absent.

## Build Validation

After adding structured data, validate the output:

```bash
# Build the site
npm run build

# Check that JSON-LD exists in output
grep -l "application/ld+json" _site/**/*.html

# Verify JSON is valid (requires Node)
node -e "const fs=require('fs');const h=fs.readFileSync('_site/index.html','utf8');const m=h.match(/<script type=\"application\/ld\+json\">([\s\S]*?)<\/script>/g);m.forEach((b,i)=>{try{JSON.parse(b.replace(/<[^>]+>/g,''));console.log('Block',i,'OK')}catch(e){console.error('Block',i,'INVALID:',e.message)}})"
```

Copy this checklist and track progress:
- [ ] Add `dateISO` filter to `.eleventy.js`
- [ ] Add `jsonEscape` filter to `.eleventy.js`
- [ ] Add Organization + WebSite JSON-LD to `base.njk`
- [ ] Add BlogPosting JSON-LD to `post.njk`
- [ ] Add BreadcrumbList to `page.njk`
- [ ] Run `npm run build` and validate output
- [ ] Test with Google Rich Results Test
- [ ] Verify no duplicate blocks across layout chain
