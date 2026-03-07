# Content & Copy Reference

## Contents
- Copy Locations in the Codebase
- Headline Hierarchy Patterns
- CTA Copy Conventions
- Empty State Copy
- WARNING: Anti-Patterns
- Copy Audit Workflow

## Copy Locations in the Codebase

All user-facing copy lives in Nunjucks templates or Markdown files. There is no CMS, no database, no content API.

| Copy Type | Location | Format |
|-----------|----------|--------|
| Page headlines, CTAs, section copy | `src/pages/*.njk` | Inline in Nunjucks templates |
| Blog posts | `src/blog/*.md` | Markdown with YAML front matter |
| Podcast episodes | `src/podcast/*.md` | Markdown with YAML front matter |
| Site-wide metadata | `src/_data/site.json` | JSON (site name, tagline, email) |
| Nav labels | `src/_includes/components/nav.njk` | Inline text in `<a>` tags |
| Footer copy | `src/_includes/components/footer.njk` | Inline text |
| Meta descriptions | YAML front matter `description` field | Per-page |

See the **tightening-brand-voice** skill for tone guidelines. See the **clarifying-market-fit** skill for ICP-aligned messaging.

## Headline Hierarchy Patterns

### Hero Headlines

The homepage establishes the headline pattern used across the site:

```njk
{# src/pages/index.njk — hero #}
<h1 class="text-4xl md:text-6xl font-bold mb-6">Living Life to the Fullest</h1>
<p class="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
  Your connection hub for disability resources, programs, education, and community.
</p>
```

**Pattern:** Emotional headline (aspirational) + functional subheading (what you actually get).

### Section Headlines

```njk
{# GOOD — benefit-oriented, uses primary color #}
<h2 class="text-3xl font-bold mb-4" style="color: var(--color-primary);">
  How We Help
</h2>
```

```njk
{# BAD — feature-oriented, generic #}
<h2 class="text-3xl font-bold mb-4">Our Features</h2>
```

**Why benefit-oriented wins:** Caregivers scanning the page need to know what's in it for them, not what the site technically offers.

## CTA Copy Conventions

### Action Verbs by Context

| Context | CTA Copy | Style |
|---------|----------|-------|
| Resource discovery | "Find Resources", "Browse X Resources" | `btn-secondary` (amber) |
| Learn/explore | "Learn More", "Read More" | Ghost/outline button |
| Form submission | "Send Message", "Submit Resource", "Subscribe" | `btn-primary` (teal) |
| Community | "Share Your Story", "Join the Community" | `btn-primary` |
| Coming soon | "Notify Me", "Shop Coming Soon" | `btn-primary` or outline |

### WARNING: Vague CTA Text

**The Problem:**

```njk
{# BAD — "Click Here" and "Learn More" everywhere #}
<a href="/resources/" class="btn-primary">Click Here</a>
<a href="/therapy-guide/" class="btn-primary">Learn More</a>
<a href="/contact/" class="btn-primary">Learn More</a>
```

**Why This Breaks:**
1. Screen readers announce link text out of context — "Learn More" means nothing
2. No information scent — visitor can't predict what happens after clicking
3. Identical CTA text for different destinations confuses the page hierarchy

**The Fix:**

```njk
{# GOOD — specific, predictable, accessible #}
<a href="/resources/" class="btn-secondary">Find Resources</a>
<a href="/therapy-guide/" class="btn-primary">Explore Therapy Types</a>
<a href="/contact/" class="btn-primary">Get in Touch</a>
```

## Empty State Copy

Empty states appear when collections (blog, podcast) have no content yet. These are critical conversion moments.

```njk
{# src/pages/blog.njk — empty state #}
{% if collections.blogPosts.length === 0 %}
<div class="card p-8 text-center">
  <p class="text-lg" style="color: var(--color-text-light);">
    Blog posts coming soon! We're working on sharing stories...
  </p>
  <p class="mt-4">Sign up for our newsletter to be notified...</p>
</div>
{% endif %}
```

**Pattern:** Acknowledge the gap + offer an alternative action (newsletter signup). NEVER show a blank section with no explanation.

### WARNING: Dead-End Empty States

**The Problem:**

```njk
{# BAD — no alternative action #}
{% if collections.blogPosts.length === 0 %}
<p>No posts yet.</p>
{% endif %}
```

**Why This Breaks:** The visitor hit a dead end. No next step, no value, no reason to return.

**The Fix:** Always pair empty states with a newsletter CTA or link to populated content:

```njk
{% if collections.blogPosts.length === 0 %}
<div class="card p-8 text-center">
  <p>Blog posts coming soon!</p>
  <form action="https://formspree.io/f/{{ site.formspree.newsletter }}" method="POST" class="mt-4">
    <input type="email" name="email" placeholder="Get notified" required class="form-input">
    <button type="submit" class="btn-primary mt-2">Subscribe</button>
  </form>
  <p class="mt-4"><a href="/resources/" style="color: var(--color-secondary);">Browse resources</a> while you wait.</p>
</div>
{% endif %}
```

## Meta Description Patterns

Every page sets a `description` in YAML front matter, used in `<meta name="description">`:

```yaml
---
title: "Resource Directory"
description: "Browse local and national disability resources, therapy providers, and support services."
permalink: /resources/
---
```

**Guidelines:**
- 120-155 characters (Google truncates beyond this)
- Include the primary keyword naturally
- Describe the value, not the page structure
- Avoid "Welcome to..." or "This page contains..."

## Copy Audit Workflow

1. Run `grep -r "Learn More" src/pages/` to find generic CTAs
2. For each match, replace with a specific action verb
3. Run `npm run dev` and check each page
4. Verify mobile layout — long CTA text may wrap awkwardly
5. Check all empty states render with alternative actions

See the **crafting-page-messaging** skill for detailed messaging frameworks.
