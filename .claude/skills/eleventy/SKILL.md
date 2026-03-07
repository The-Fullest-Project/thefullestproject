---
name: eleventy
description: |
  Configures Eleventy 3.x collections, filters, data pipeline, and static site generation from Nunjucks templates with JSON resource data.
  Use when: modifying .eleventy.js config, creating/editing collections or filters, adding new pages or layouts, working with _data files, changing build pipeline, or troubleshooting Eleventy template rendering.
allowed-tools: Read, Edit, Write, Glob, Grep, Bash
---

# Eleventy Skill

This project uses Eleventy 3.x as a static site generator with Nunjucks templating, a JSON data pipeline for resources, and Tailwind 4.x compiled separately via `@tailwindcss/cli`. The architecture is **static-site-with-data-pipeline** — Eleventy reads templates from `src/`, merges with JSON data from `src/_data/resources/`, and outputs to `_site/`. Tailwind is NOT integrated into Eleventy's build — it runs as a separate CLI step.

## Quick Start

### Add a New Page

```nunjucks
{# src/pages/my-page.njk #}
---
layout: layouts/page.njk
title: My Page Title
description: "Page meta description for SEO."
permalink: /my-page/
---

<section class="py-16">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
    <p>Page content here.</p>
  </div>
</section>
```

### Add a New Collection

```javascript
// .eleventy.js — inside module.exports
eleventyConfig.addCollection("podcastEpisodes", function(collectionApi) {
  return collectionApi.getFilteredByGlob("src/podcast/*.md").sort((a, b) => {
    return b.date - a.date;
  });
});
```

### Add a Custom Filter

```javascript
// .eleventy.js
eleventyConfig.addFilter("filterByCategory", function(resources, category) {
  if (!category) return resources;
  return resources.filter(r => r.category && r.category.includes(category));
});
```

## Key Concepts

| Concept | Location | Notes |
|---------|----------|-------|
| Config | `.eleventy.js` | Collections, filters, passthrough copies |
| Layouts | `src/_includes/layouts/` | `base.njk` → `page.njk` / `post.njk` |
| Components | `src/_includes/components/` | `nav.njk`, `footer.njk` — included as partials |
| Global data | `src/_data/site.json` | Available as `site.*` in all templates |
| Resource data | `src/_data/resources/*.json` | Auto-loaded as `resources.nova`, `resources.portland`, `resources.national` |
| Pages | `src/pages/*.njk` | Static pages with YAML front matter |
| Blog | `src/blog/*.md` | Markdown with `post` layout, collected as `blogPosts` |
| Output | `_site/` | Built output, gitignored |

## Common Patterns

### Access Resource Data in Templates

```nunjucks
{% for resource in resources.nova %}
  <h3>{{ resource.name }}</h3>
  <p>{{ resource.description }}</p>
{% endfor %}
```

### Use Collections with Limit Filter

```nunjucks
{% for post in collections.blogPosts | limit(3) %}
  <h3><a href="{{ post.url }}">{{ post.data.title }}</a></h3>
  <time>{{ post.date | dateFormat }}</time>
{% endfor %}
```

### Build Commands

| Command | Use |
|---------|-----|
| `npm run dev` | Eleventy serve + Tailwind watch (concurrent) |
| `npm run build` | Full production build (Eleventy then Tailwind minified) |
| `npm run build:11ty` | Eleventy only |

## See Also

- [patterns](references/patterns.md) — Collections, filters, data pipeline, and layout patterns
- [workflows](references/workflows.md) — Adding pages, blog posts, deploying, and scraper integration

## Related Skills

- See the **nunjucks** skill for template syntax, conditionals, loops, and macros
- See the **tailwind** skill for styling, custom theme tokens, and component classes
- See the **javascript** skill for client-side filtering (`resourceFilter.js`) and DOM interactions
- See the **json** skill for resource data schema and `site.json` structure
- See the **markdown** skill for blog post and podcast episode authoring
- See the **python** skill for the scraper pipeline (`base_scraper.py`, `run_all.py`)
- See the **github-actions** skill for CI/CD deploy and weekly scrape workflows
- See the **ftp** skill for GoDaddy deployment configuration