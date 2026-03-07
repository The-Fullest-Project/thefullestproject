# Content SEO Reference

## Contents
- Blog Post Indexability
- Guide Page Keyword Coverage
- Resource Directory Content Signals
- Thin Content Detection
- Content Freshness Signals

---

## Blog Post Indexability

Blog posts in `src/blog/*.md` use the `post.njk` layout. Each post generates a unique URL via Eleventy's default permalink pattern (`/blog/[slug]/`).

### Audit Blog Post SEO Readiness

```bash
# List all blog posts and their front matter fields
grep -A 8 "^---" src/blog/*.md
```

**Required front matter for SEO:**

```yaml
---
layout: layouts/post.njk
title: "Descriptive, keyword-rich title (50-60 chars)"
date: 2026-03-06
author: "Erin & Nicole"
description: "Unique meta description targeting search intent (120-155 chars)"
category: "Category Name"
tags:
  - relevant-tag
---
```

### WARNING: Blog Posts Without `description` Field

**The Problem:**

```yaml
# BAD - most blog posts only have excerpt, not description
excerpt: "We're excited to launch..."
# base.njk falls back to site.description for ALL posts
```

**Why This Breaks:**
1. Google shows the same generic description for every blog post in SERPs
2. Users can't distinguish between posts in search results
3. Click-through rate drops significantly

**The Fix:**

Add `description` to every blog post, OR update `base.njk` to use `excerpt` as fallback (see [on-page reference](on-page.md)).

---

## Guide Page Keyword Coverage

The site has two major guide pages that target high-value informational queries:

### Therapy Guide (`/therapy-guide/`)

Covers: OT, PT, Speech, ABA, Music, Hippotherapy, Aquatic, Intensive therapy.

**Keyword opportunity:** Each therapy type is a separate search intent. A single page targeting all eight therapy types dilutes ranking potential.

**Assessment approach:**

```bash
# Check heading structure — each therapy should be H2
grep "<h2" _site/therapy-guide/index.html

# Count word length of each section
# Thin sections (<200 words) won't rank individually
```

**Improvement path:** Split into individual pages (`/therapy-guide/occupational-therapy/`, `/therapy-guide/speech-therapy/`) with the index as a hub. See the **programmatic** reference for template patterns. See the **eleventy** skill for pagination/collection setup.

### School & IEP Guide (`/school-iep/`)

Covers: IEPs vs 504 Plans, Parent Rights, IEP Process, Advocacy Tips, State Resources.

**Same opportunity:** Each subtopic is a distinct search query ("IEP vs 504 plan", "parent rights special education", "how to prepare for IEP meeting").

---

## Resource Directory Content Signals

Resources render as cards from JSON data. Each card's HTML content is what search engines index.

### DO: Render Key Fields as Visible Text

```html
<!-- GOOD - resources.njk renders description, location, category as text -->
<div class="card" data-location="{{ resource.location }}" data-category="{{ resource.category | join(',') }}">
  <h3>{{ resource.name }}</h3>
  <p>{{ resource.description }}</p>
  <span>{{ resource.location }}</span>
</div>
```

### DON'T: Hide Content in Data Attributes Only

```html
<!-- BAD - search-relevant data only in data-* attributes -->
<div class="card" data-location="Northern Virginia" data-category="therapy">
  <h3>{{ resource.name }}</h3>
  <!-- No visible description, location, or category text -->
</div>
```

**Why:** Search engines read `data-*` attributes but give them near-zero weight compared to visible text content.

---

## Thin Content Detection

Pages with very little unique content rank poorly and may be flagged as thin content by Google.

### Audit for Thin Pages

```bash
# After build, check page sizes (small files = thin content)
wc -c _site/*/index.html | sort -n | head -20

# Check pages with fewer than 500 words of visible text
# (Rough heuristic: strip tags, count words)
```

### Pages at Risk

| Page | Risk | Why |
|------|------|-----|
| `/podcast/` | High if few episodes | Listing page with minimal content |
| `/services/` | Medium | May be placeholder content |
| `/adaptive-equipment/` | Medium | Single page covering broad topic |
| Individual resource cards | N/A | Not separate pages (rendered on `/resources/`) |

### DO: Add Substantive Introductory Content

```html
<!-- GOOD - resources.njk has intro paragraph before the filter -->
<section>
  <h1>Resource Directory</h1>
  <p>Browse over {{ allResources.length }} vetted resources for caregivers
     across Northern Virginia, Portland, and nationwide programs.</p>
  <!-- Filter UI -->
  <!-- Resource cards -->
</section>
```

---

## Content Freshness Signals

The weekly scraper pipeline updates resource data, but search engines need signals that content is fresh.

### Freshness Indicators to Implement

1. **Blog post dates** — Already present via `date` front matter and `<time>` element
2. **Resource "last updated" date** — Show `lastScraped` on the resources page
3. **Sitemap lastmod** — Fix to ISO 8601 format (see [technical reference](technical.md))

### Show Last Updated on Resources Page

```html
<!-- resources.njk — add after the intro paragraph -->
<p class="text-sm text-gray-500">
  Resources last verified: {{ resources.nova[0].lastScraped or "recently" }}
</p>
```

This gives both users and search engines a freshness signal tied to the scraper pipeline.

See the **markdown** skill for blog post front matter conventions. See the **crafting-page-messaging** skill for writing SEO-effective titles and descriptions.
