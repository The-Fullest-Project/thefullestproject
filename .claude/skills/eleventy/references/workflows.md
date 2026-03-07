# Eleventy Workflows Reference

## Contents
- Adding a New Page
- Adding a Blog Post
- Adding a New Collection
- Adding a New Filter
- Modifying the Resource Pipeline
- Build and Deploy
- Troubleshooting

## Adding a New Page

Copy this checklist and track progress:
- [ ] Create `.njk` file in `src/pages/` (or `src/pages/subdir/index.njk` for subdirectory pages)
- [ ] Set front matter: `layout`, `title`, `description`, `permalink`
- [ ] Add nav link in `src/_includes/components/nav.njk` (both desktop and mobile menus)
- [ ] Add footer link if applicable in `src/_includes/components/footer.njk`
- [ ] Verify with `npm run dev`

```nunjucks
---
layout: layouts/page.njk
title: Privacy Policy
description: "How The Fullest Project handles your data."
permalink: /privacy/
---

<p>Your privacy content here.</p>
```

For full-width pages with custom sections (hero, alternating backgrounds), use `layouts/base.njk` directly and manage your own container widths:

```nunjucks
---
layout: layouts/base.njk
title: About Us
permalink: /about/
---

<section class="py-16 section-warm">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
    {# Full control over layout #}
  </div>
</section>
```

## Adding a Blog Post

Copy this checklist and track progress:
- [ ] Create `.md` file in `src/blog/` with kebab-case filename
- [ ] Set required front matter fields
- [ ] Verify post appears in `collections.blogPosts`
- [ ] Check rendering at `/blog/` listing and individual post URL

```markdown
---
layout: layouts/post.njk
title: "Your Post Title"
date: 2026-03-06
author: "Author Name"
category: "Category"
excerpt: "One-sentence summary for listing pages."
tags:
  - tag-one
  - tag-two
---

Post content in Markdown. Nunjucks syntax works here because
`markdownTemplateEngine` is set to `"njk"` in .eleventy.js.
```

The `post.njk` layout automatically renders: category badge, title, date (via `dateFormat` filter), author, prose content, and a "Back to Blog" link.

### WARNING: Missing `date` Field

**The Problem:** Omitting `date` from front matter causes Eleventy to use the file's filesystem creation date, which changes on clone/deploy.

**Why This Breaks:** Posts reorder unpredictably across environments. CI builds show different order than local dev.

**The Fix:** Always set an explicit `date` in YAML front matter.

## Adding a New Collection

1. Register in `.eleventy.js`:

```javascript
eleventyConfig.addCollection("guides", function(collectionApi) {
  return collectionApi.getFilteredByGlob("src/guides/*.md").sort((a, b) => {
    return b.date - a.date;
  });
});
```

2. Create the content directory (`src/guides/`)
3. Use in templates:

```nunjucks
{% for guide in collections.guides %}
  <h3><a href="{{ guide.url }}">{{ guide.data.title }}</a></h3>
{% endfor %}
```

Validation loop:
1. Add collection to `.eleventy.js`
2. Create at least one content file in the glob path
3. Run `npm run build:11ty`
4. If build fails, check glob path matches actual file location
5. If collection is empty, verify front matter `date` field exists

## Adding a New Filter

```javascript
// .eleventy.js
eleventyConfig.addFilter("truncateWords", function(text, count) {
  if (!text) return "";
  const words = text.split(" ");
  return words.length > count ? words.slice(0, count).join(" ") + "..." : text;
});
```

Use in templates: `{{ post.data.excerpt | truncateWords(20) }}`

### DO: Guard Against Null Inputs

```javascript
// GOOD — handles missing data gracefully
eleventyConfig.addFilter("myFilter", function(value) {
  if (!value) return "";
  // ... process value
});
```

### DON'T: Assume Data Exists

```javascript
// BAD — throws if value is undefined
eleventyConfig.addFilter("myFilter", function(value) {
  return value.toUpperCase(); // TypeError if value is undefined
});
```

## Modifying the Resource Pipeline

Resources flow: **Scrapers → JSON → Eleventy data → Templates → Client-side filtering**

```
scrapers/sources/*.py  →  src/_data/resources/*.json  →  resources.njk  →  resourceFilter.js
     (Python)                   (JSON arrays)              (Nunjucks)        (vanilla JS)
```

To add a new resource location:

Copy this checklist and track progress:
- [ ] Add location entry to `src/_data/site.json` under `locations`
- [ ] Create `src/_data/resources/{location-id}.json` (empty array `[]`)
- [ ] Add scraper in `scrapers/sources/{location}_resources.py` with `scrape()` function
- [ ] Add `<option>` to location filter in `src/pages/resources.njk`
- [ ] Add location mapping in `src/js/resourceFilter.js` `locationMap` object
- [ ] Add resource card loop in `resources.njk` for the new location data
- [ ] Test with `npm run dev`

See the **python** skill for scraper implementation. See the **javascript** skill for client-side filter updates.

## Build and Deploy

### Local Development

```bash
npm run dev  # Starts Eleventy --serve + Tailwind --watch concurrently
```

Eleventy watches `src/` for template/data changes. Tailwind watches `src/css/styles.css` for utility class changes. Both trigger browser reload.

### Production Build

```bash
npm run build  # Runs build:11ty THEN build:css (sequential)
```

Build order matters: Eleventy generates HTML first → Tailwind scans `_site/` HTML for used classes → outputs minified CSS. See the **tailwind** skill for CSS build details.

### Deploy

```bash
npm run deploy  # Runs build then FTP upload via deploy.js
```

CI/CD deploys automatically on push to `main`. See the **github-actions** skill for workflow configuration.

### WARNING: Tailwind Before Eleventy

**The Problem:** Running `build:css` before `build:11ty` means Tailwind scans stale or missing HTML files.

**Why This Breaks:** Tailwind purges classes it can't find in the output HTML. New utility classes appear unstyled in production.

**The Fix:** The `build` script correctly runs `build:11ty && build:css`. NEVER reverse this order.

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Empty collection loop | Collection not registered in `.eleventy.js` | Add `addCollection()` call |
| Data not available in template | Wrong data directory path | Verify `dir.data` in config matches `_data/` |
| Styles missing in production | Tailwind ran before Eleventy | Run `npm run build` (correct order) |
| Filter undefined error | Filter name mismatch | Check exact camelCase name in `.eleventy.js` vs template |
| Blog post wrong date | No `date` in front matter | Always set explicit `date: YYYY-MM-DD` |
| Resource not showing | Missing from JSON data file | Check `src/_data/resources/*.json` |
| Page 404 in dev | Wrong `permalink` in front matter | Ensure permalink starts with `/` and ends with `/` |

Validation loop for build issues:
1. Run `npm run build:11ty` alone to isolate Eleventy errors
2. Check terminal output for template errors
3. If clean, run `npm run build:css` to verify Tailwind
4. If both pass, run full `npm run build`
5. Only proceed to deploy when build succeeds cleanly