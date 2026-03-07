# Distribution Reference

## Contents
- Distribution Channels in This Codebase
- SEO Copy Patterns
- Social Sharing Metadata
- Newsletter Distribution Copy
- Blog as Distribution Content
- WARNING: OG Tag Voice Mismatch
- Distribution Copy Checklist

## Distribution Channels in This Codebase

This is a static site with no paid ad integration. Distribution surfaces are organic:

| Channel | Mechanism | File(s) |
|---------|-----------|---------|
| Search (SEO) | Meta descriptions, page titles, heading structure | YAML front matter in every `.njk` and `.md` file |
| Social sharing | Open Graph tags | `src/_includes/layouts/base.njk` |
| Email newsletter | Formspree signup → future email sends | `src/pages/index.njk`, `src/_includes/components/footer.njk` |
| Blog content | Shareable posts that drive organic traffic | `src/blog/*.md` |
| Podcast | Future episodes drive awareness | `src/podcast/*.md` |
| Word of mouth | Resource submission loop (caregivers share with caregivers) | `src/pages/submit-resource.njk` |
| Sitemap | XML for search engine crawling | `src/sitemap.njk` |

## SEO Copy Patterns

### Page Titles

Titles render as `{{ title }} | {{ site.name }}` (set in `src/_includes/layouts/base.njk`).

```yaml
# GOOD — keyword-first, under 60 chars total
title: "Resource Directory"
# Renders: "Resource Directory | The Fullest Project"

# BAD — brand-first, wastes character budget
title: "The Fullest Project - Browse Our Resources"
# Renders: "The Fullest Project - Browse Our Resources | The Fullest Project"
```

**Rule:** Page-specific keyword comes first. The brand name is appended automatically.

### Meta Descriptions

```yaml
# GOOD — action verb + specifics + under 160 chars
description: "Find local and national disability resources, programs, foundations, and services."

# GOOD — problem + solution framing
description: "Meet the founders of The Fullest Project and learn about our mission to support caregivers of individuals with disabilities."

# BAD — no action, no specifics
description: "Welcome to our website. We have resources for you."
```

**Voice alignment:** Meta descriptions must sound like the site — warm and specific. Search snippets are often the first brand impression.

## Social Sharing Metadata

Open Graph tags live in `src/_includes/layouts/base.njk`:

```njk
<meta property="og:title" content="{{ title }} | {{ site.name }}">
<meta property="og:description" content="{{ description or site.description }}">
<meta property="og:type" content="website">
<meta property="og:url" content="{{ site.url }}{{ page.url }}">
<meta property="og:site_name" content="{{ site.name }}">
```

### DO: Ensure Every Page Has a Unique Description

```yaml
# src/pages/services/index.njk
description: "Explore our services including non-profit business coaching, group life coaching, and our upcoming gig platform."
```

### DON'T: Let Pages Fall Back to Generic Site Description

```yaml
# BAD — missing description means OG falls back to site.description
---
title: "Services"
permalink: /services/
---
```

**Why this breaks:** When a caregiver shares the services page on Facebook, the preview shows the generic site description instead of what the services page actually offers. This wastes the share's potential to drive targeted traffic.

## Newsletter Distribution Copy

The newsletter promise appears in two places. Both must stay in sync:

```njk
{# Homepage — full version #}
<p>Get updates on new resources, blog posts, podcast episodes,
   and community news delivered to your inbox.</p>

{# Footer — abbreviated version #}
<p>Get updates on new resources, blog posts, and community news.</p>
```

**Voice rule:** List specific content types. Never reduce to "Subscribe for updates" — that's a trust-destroying abstraction.

### WARNING: Newsletter Promise Mismatch

**The Problem:** Homepage says "podcast episodes" but footer omits it, or vice versa.

**Why This Breaks:** Inconsistency makes the brand feel careless. A caregiver who subscribes from the footer expecting resources-only content, then receives podcast promos, will unsubscribe.

**The Fix:** Keep both placements aligned. The footer can abbreviate but must not promise different content.

## Blog as Distribution Content

Blog posts are the primary shareable content. Each post needs distribution-ready metadata:

```yaml
---
title: "Welcome to The Fullest Project"
date: 2026-03-06
author: "Erin & Nicole"
category: "Announcement"
excerpt: "We're excited to launch The Fullest Project — a centralized hub for disability resources, community, and support for caregivers."
layout: post
---
```

**Distribution voice rules for blog excerpts:**
- Must be a complete, compelling sentence (not truncated mid-thought)
- Include one keyword caregivers search for
- Match the warm, personal tone of the full post
- Under 200 characters for clean social card rendering

```markdown
<!-- GOOD — specific, complete, warm -->
excerpt: "We're excited to launch The Fullest Project — a centralized hub for disability resources, community, and support for caregivers."

<!-- BAD — truncated, generic -->
excerpt: "We're excited to announce that we have launched a new website..."
```

## WARNING: OG Tag Voice Mismatch

**The Problem:**

Page copy is warm and empathetic, but the meta description reads like a press release:

```yaml
# Voice mismatch — page copy says "we" but meta says "The organization"
description: "The Fullest Project organization provides disability resource information to caregivers nationwide."
```

**Why This Breaks:**
1. Social shares show the meta description — it's the first impression
2. If the preview sounds corporate but the page sounds warm, visitors feel bait-and-switched
3. Search snippets that don't match page tone reduce click-through rates

**The Fix:**
```yaml
description: "Find local and national disability resources, programs, foundations, and services."
```

Match the page's voice in the meta description. If the page uses "you" and "we," the description should too.

## Distribution Copy Checklist

Copy this checklist when auditing distribution-facing copy:

- [ ] Every page has a unique `description` in YAML front matter
- [ ] Page titles are keyword-first, under 60 chars (before ` | site.name` suffix)
- [ ] Meta descriptions are under 160 chars with an action verb
- [ ] Blog excerpts are complete sentences under 200 chars
- [ ] Newsletter promise text is consistent between homepage and footer
- [ ] OG description voice matches page voice (no corporate/warm mismatch)
- [ ] Sitemap includes all public pages (check `src/sitemap.njk`)

## Related Skills

- See the **inspecting-search-coverage** skill for technical SEO and meta tag audits
- See the **adding-structured-signals** skill for schema.org markup on resource pages
- See the **eleventy** skill for how `site.json` data populates OG tags in `base.njk`
- See the **crafting-page-messaging** skill for writing new meta descriptions and page intros
