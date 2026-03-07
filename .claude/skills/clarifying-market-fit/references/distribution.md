# Distribution Reference

## Contents
- Distribution Channels in This Project
- SEO via Static Pages
- Newsletter as Primary Channel
- Social Placeholders
- Content-Led Distribution
- Anti-Patterns

## Distribution Channels in This Project

This is a **static site deployed to GoDaddy via FTP**. There is no analytics SDK, no paid ad integration, no social sharing API. Distribution is organic and content-driven.

| Channel | Status | Implementation |
|---------|--------|----------------|
| Organic search (SEO) | Active | Static HTML with meta tags, sitemap.xml, robots.txt |
| Newsletter | Active | Formspree email capture (homepage, footer, services) |
| Social media | Placeholder | `site.json` has empty `instagram` and `facebook` fields |
| Blog/podcast content | Early | `src/blog/` and `src/podcast/` with one welcome post |
| Word of mouth | Core | "Submit a Resource" crowdsourcing loop |
| Direct/referral | Active | Founders' professional networks (OT, HR) |

## SEO via Static Pages

Every page generates its own URL and meta tags. This is the primary discovery mechanism.

```njk
{# src/_includes/layouts/base.njk — meta tags for search + social #}
<title>{{ title }} | {{ site.name }}</title>
<meta name="description" content="{{ description or site.description }}">
<meta property="og:title" content="{{ title }} | {{ site.name }}">
<meta property="og:description" content="{{ description or site.description }}">
<meta property="og:type" content="website">
```

### Writing SEO-Aligned Front Matter

```yaml
# GOOD — keyword-rich, under 160 chars, speaks to caregiver search intent
---
title: Resource Directory
description: "Find local and national disability resources, programs, foundations, and services."
permalink: /resources/
---
```

```yaml
# BAD — vague, no keywords, doesn't match what caregivers search for
---
title: Resources
description: "Check out our resources page."
permalink: /resources/
---
```

**The description field powers both `<meta>` and Open Graph tags.** Write it for Google snippets AND social previews simultaneously.

### Sitemap and Robots

```njk
{# src/sitemap.njk — auto-generates XML sitemap #}
---
permalink: /sitemap.xml
eleventyExcludeFromCollections: true
---
<?xml version="1.0" encoding="utf-8"?>
<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
  {%- for page in collections.all %}
  <url><loc>{{ site.url }}{{ page.url }}</loc></url>
  {%- endfor %}
</urlset>
```

See the **eleventy** skill for how `collections.all` is built and the **inspecting-search-coverage** skill for auditing which pages appear in the sitemap.

## Newsletter as Primary Channel

The newsletter is the **only owned distribution channel** in this project. It appears in three places:

1. **Homepage dedicated section** — full-width teal background, benefit copy
2. **Footer** — compact form on every page
3. **Services gig waitlist** — with `hidden` interest field for segmentation

```njk
{# src/_includes/components/footer.njk — persistent newsletter capture #}
<h3 class="font-semibold mb-3">Stay Connected</h3>
<p class="text-sm mb-3" style="color: var(--color-text-light);">
  Get updates on new resources, blog posts, and community news.
</p>
<form action="https://formspree.io/f/{{ site.formspree.newsletter }}" method="POST">
  <label for="footer-email" class="sr-only">Email address</label>
  <input type="email" id="footer-email" name="email" placeholder="Your email"
         required class="form-input text-sm mb-2 w-full">
  <button type="submit" class="btn-primary text-sm w-full text-center">Subscribe</button>
</form>
```

### DO / DON'T

| DO | DON'T | Why |
|----|-------|-----|
| State what subscribers get ("new resources, blog posts") | Just say "Subscribe to our newsletter" | Value must be clear for an email exchange |
| Use `sr-only` labels | Skip form labels | Accessibility is non-negotiable |
| Keep the form to one field (email) | Ask for name, location, preferences | Friction kills conversion on static forms |

## Social Placeholders

```json
// src/_data/site.json — social fields exist but are empty
"social": {
  "instagram": "",
  "facebook": ""
}
```

**Do not build social sharing features until these fields are populated.** Adding "Share on Twitter" buttons that link to nothing damages credibility.

### When Social Is Ready

Add social links to the footer and consider Open Graph image tags in `base.njk`. See the **adding-structured-signals** skill for schema.org social profile markup.

## Content-Led Distribution

Blog posts and podcast episodes are the primary content distribution mechanism. Each post generates a unique URL with its own meta description.

```markdown
<!-- src/blog/welcome.md — blog post with SEO-relevant front matter -->
---
title: "Welcome to The Fullest Project"
date: 2025-12-01
author: "Erin & Nicole"
category: "Announcement"
excerpt: "We're excited to launch The Fullest Project — a centralized hub for disability resources."
---
```

### Content Distribution Checklist

Copy this checklist when publishing new content:

- [ ] `title` is under 60 chars and includes a keyword caregivers search for
- [ ] `excerpt` is under 160 chars and works as a social preview
- [ ] Post links back to relevant resource directory categories (e.g., `/resources/?category=therapy`)
- [ ] Newsletter section on the page captures readers who want more
- [ ] Post is listed in `collections.blogPosts` (verify with `npm run build:11ty`)

## Anti-Patterns

### WARNING: Building Distribution Before Content Exists

**The Problem:** Adding social sharing buttons, RSS feeds, and syndication when there's only one blog post and zero podcast episodes.

**Why This Breaks:** Empty feeds and "Coming Soon" content pages signal to both search engines and visitors that the site is inactive. Crawlers may deprioritize pages with no fresh content.

**The Fix:** Focus on building the resource directory (which has real, scraped data) as the primary SEO asset. Blog and podcast distribution infrastructure should scale with content volume, not precede it.

### WARNING: Ignoring Query Parameters in Distribution

The resource filter uses URL params (`/resources/?category=therapy`). These deep-linked filtered views are shareable and linkable — use them in blog posts, CTAs, and eventually social posts.

```njk
{# GOOD — deep-links to a filtered view #}
<a href="/resources/?category=therapy" class="btn-primary no-underline">
  Browse Therapy Providers
</a>

{# BAD — drops the visitor at an unfiltered wall of resources #}
<a href="/resources/" class="btn-primary no-underline">
  Browse Resources
</a>
```

See the **javascript** skill for how `resourceFilter.js` reads URL params.
