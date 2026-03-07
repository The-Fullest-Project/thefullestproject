# Eleventy Patterns Reference

## Contents
- Config Architecture
- Collections
- Filters
- Data Pipeline
- Layout Chain
- Passthrough Copy
- Anti-Patterns

## Config Architecture

All Eleventy config lives in `.eleventy.js` using CommonJS (`module.exports`). The project uses `type: "commonjs"` in `package.json`.

```javascript
// .eleventy.js
module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/css/output.css");

  // ... collections, filters ...

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    templateFormats: ["njk", "md", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
};
```

`markdownTemplateEngine: "njk"` means Markdown files can use Nunjucks syntax — this is how blog posts access `site.*` data and filters like `dateFormat`.

## Collections

Collections are glob-based, sorted by date descending. Both `blogPosts` and `podcastEpisodes` follow the same pattern:

```javascript
eleventyConfig.addCollection("blogPosts", function(collectionApi) {
  return collectionApi.getFilteredByGlob("src/blog/*.md").sort((a, b) => {
    return b.date - a.date; // newest first
  });
});
```

Access in templates via `collections.blogPosts`. Each item has:
- `item.data.title`, `item.data.excerpt`, `item.data.category` — from front matter
- `item.date` — the `date` front matter field
- `item.url` — auto-generated permalink
- `item.content` — rendered HTML content

### WARNING: Missing Collection Registration

**The Problem:**

```nunjucks
{# Template tries to use unregistered collection #}
{% for ep in collections.episodes %}
  {{ ep.data.title }}
{% endfor %}
```

**Why This Breaks:** Eleventy silently returns `undefined` for unregistered collections. The loop produces no output and no error — a debugging nightmare.

**The Fix:** Always register collections in `.eleventy.js` before using them in templates. Check collection names match exactly (camelCase).

## Filters

This project defines four custom filters:

```javascript
// Date formatting — used in post layouts, blog listing, sitemap
eleventyConfig.addFilter("dateFormat", function(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
});

// Array limit — used for "latest 3 posts" on homepage
eleventyConfig.addFilter("limit", function(arr, limit) {
  return arr.slice(0, limit);
});

// Resource filters — used on resources page and anywhere resources render
eleventyConfig.addFilter("filterByCategory", function(resources, category) {
  if (!category) return resources;
  return resources.filter(r => r.category && r.category.includes(category));
});

eleventyConfig.addFilter("filterByLocation", function(resources, location) {
  if (!location) return resources;
  return resources.filter(r => r.location === location);
});
```

Usage in templates: `{{ post.date | dateFormat }}`, `{{ collections.blogPosts | limit(3) }}`

### WARNING: Null-Unsafe Filters

**The Problem:**

```javascript
// BAD — crashes if resources is undefined or null
eleventyConfig.addFilter("filterByCategory", function(resources, category) {
  return resources.filter(r => r.category.includes(category));
});
```

**Why This Breaks:** If a data file is missing or empty, `resources` is `undefined`. The filter throws at build time, halting the entire site generation.

**The Fix:** Always guard inputs. The project correctly guards with `if (!category) return resources;` — maintain this pattern for all resource filters.

## Data Pipeline

Eleventy auto-loads JSON from `src/_data/`. The directory structure maps to template variables:

```
src/_data/
├── site.json          → {{ site.name }}, {{ site.formspree.contact }}
└── resources/
    ├── nova.json      → {{ resources.nova }}
    ├── portland.json   → {{ resources.portland }}
    └── national.json   → {{ resources.national }}
```

Resource files are JSON arrays. Each entry follows the schema defined in `base_scraper.py`'s `make_resource()`. See the **python** skill for scraper patterns and the **json** skill for schema details.

### WARNING: Duplicated Resource Card Markup

**The Problem:** `resources.njk` repeats the same card HTML three times — once for `resources.nova`, `resources.portland`, and `resources.national`.

```nunjucks
{# BAD — same markup repeated 3x in resources.njk #}
{% for resource in resources.nova %}
  <div class="card p-6 resource-card" ...>...</div>
{% endfor %}
{% for resource in resources.portland %}
  <div class="card p-6 resource-card" ...>...</div>
{% endfor %}
{% for resource in resources.national %}
  <div class="card p-6 resource-card" ...>...</div>
{% endfor %}
```

**The Fix:** Concatenate arrays first, then loop once. Or extract a Nunjucks macro for the card. See the **nunjucks** skill for macro patterns.

## Layout Chain

Layouts chain via the `layout` front matter field:

```
Content page (.njk) → layouts/page.njk → layouts/base.njk
Blog post (.md)     → layouts/post.njk → layouts/base.njk
```

`base.njk` provides: HTML shell, `<head>` with meta/fonts/CSS, skip-nav, nav component, `<main>`, footer component, and `main.js` script.

`page.njk` wraps content in a `max-w-4xl` container with an `<h1>` from the `title` front matter.

`post.njk` adds article semantics, category badge, date, author, and a "Back to Blog" link.

### DO: Use Existing Layouts

```yaml
# For a standard page
layout: layouts/page.njk
```

### DON'T: Skip the Layout Chain

```yaml
# BAD — duplicates <head>, nav, footer
layout: layouts/base.njk  # Only use if you need full-width custom layout
```

Use `page.njk` for standard content. Use `base.njk` directly only for pages with custom full-width sections (like `index.njk`, `about.njk`, `resources.njk`).

## Passthrough Copy

Static assets bypass Eleventy's template processing:

```javascript
eleventyConfig.addPassthroughCopy("src/images");  // → _site/images/
eleventyConfig.addPassthroughCopy("src/js");       // → _site/js/
eleventyConfig.addPassthroughCopy("src/css/output.css"); // → _site/css/output.css
```

Tailwind compiles `src/css/styles.css` → `_site/css/output.css` via the separate `@tailwindcss/cli` step. The passthrough for `output.css` ensures it persists if Eleventy rebuilds without Tailwind. See the **tailwind** skill for CSS build details.