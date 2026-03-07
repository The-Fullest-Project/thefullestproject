# Competitive SEO Reference

## Contents
- Competitive Landscape for Caregiver Resources
- Comparison Page Strategy
- Alternative Keyword Targeting
- Internal Linking for Topical Authority
- Content Gap Analysis Workflow

---

## Competitive Landscape for Caregiver Resources

The Fullest Project competes with established directories (211.org, Autism Speaks, NAMI) and local government resource pages. Competitive advantages for a static site:

| Advantage | Why It Matters |
|-----------|---------------|
| Location-specific pages | National directories have weak local coverage |
| Curated + scraped data | Fresher than manually maintained directories |
| Guide content (therapy, IEP) | Informational intent pages attract top-of-funnel traffic |
| Niche focus (caregivers) | Broader sites dilute relevance across many audiences |

---

## Comparison Page Strategy

Caregivers frequently search for comparisons between therapy types, programs, and services. These queries have high intent and low competition.

### High-Value Comparison Topics

```
"IEP vs 504 plan"                   → Already covered in /school-iep/
"occupational therapy vs physical therapy" → Not yet covered
"ABA therapy pros and cons"          → Not yet covered
"in-home vs center-based therapy"    → Not yet covered
```

### Comparison Page Template

```yaml
# src/pages/therapy-guide/ot-vs-pt.njk
---
layout: layouts/page.njk
title: "Occupational Therapy vs Physical Therapy: Which Does Your Child Need?"
description: "Compare OT and PT — what each treats, when to choose one or both, and how to find providers near you."
permalink: /therapy-guide/ot-vs-pt/
---
```

```html
<h1>Occupational Therapy vs Physical Therapy</h1>

<table>
  <thead>
    <tr><th></th><th>Occupational Therapy</th><th>Physical Therapy</th></tr>
  </thead>
  <tbody>
    <tr><td>Focus</td><td>Daily living skills, fine motor</td><td>Gross motor, mobility, strength</td></tr>
    <tr><td>Best for</td><td>Sensory processing, handwriting</td><td>Walking, balance, coordination</td></tr>
    <tr><td>Session length</td><td>30-60 min</td><td>30-60 min</td></tr>
  </tbody>
</table>

<h2>Related Resources</h2>
{% set therapyResources = collections.allResources | filterByCategory("therapy") %}
{% for resource in therapyResources | limit(6) %}
  {% include "components/resource-card.njk" %}
{% endfor %}
```

### DO: Link Comparison Pages Into the Content Hub

```html
<!-- GOOD - therapy-guide/index.njk links to comparison sub-pages -->
<h2>Compare Therapy Types</h2>
<ul>
  <li><a href="/therapy-guide/ot-vs-pt/">OT vs PT</a></li>
  <li><a href="/therapy-guide/aba-pros-cons/">ABA Therapy: Pros and Cons</a></li>
</ul>
```

### DON'T: Create Orphan Comparison Pages

```html
<!-- BAD - comparison page exists but nothing links to it -->
<!-- Google discovers it only through sitemap (weak signal) -->
```

---

## Alternative Keyword Targeting

Target "alternative to X" queries where X is a known resource or program.

### Pattern: "Alternatives to [Competitor]" Pages

```yaml
# Example — only create if you have genuinely useful alternative resources
---
layout: layouts/page.njk
title: "Alternatives to [Program Name] in Northern Virginia"
description: "Looking for programs similar to [Program]? Here are vetted alternatives for caregivers in Northern Virginia."
permalink: /resources/virginia/alternatives-to-[program-slug]/
---
```

### WARNING: Don't Create Thin Alternative Pages

**The Problem:**

```html
<!-- BAD - page lists 1-2 alternatives with no substantive content -->
<h1>Alternatives to XYZ Program</h1>
<p>Try these instead:</p>
<ul><li>ABC Program</li></ul>
```

**Why This Breaks:**
1. Thin content penalty — Google flags pages with minimal unique value
2. Users bounce immediately, signaling low quality
3. Wastes your crawl budget on pages that won't rank

**The Fix:**

Only create alternative pages when you have 3+ genuine alternatives AND can add at least 300 words of context (what makes each alternative different, who it's best for, cost comparison).

---

## Internal Linking for Topical Authority

Google evaluates topical authority partly through internal link structure. Pages with more internal links from related content rank higher.

### Current Internal Link Map

```
Homepage → Resources, Blog, Therapy Guide, School/IEP
Resources → (links to external resource websites)
Therapy Guide → Resources (via CTA)
School/IEP → Resources (via CTA)
Blog Posts → (no systematic internal linking)
```

### Target Internal Link Map

```
Homepage → Resources, Blog, Therapy Guide, School/IEP
Resources Hub → Location pages, Category pages
  Location pages → Category pages, back to hub
Therapy Guide Hub → Individual therapy pages, comparison pages
  Therapy pages → Related resources, back to hub
School/IEP Hub → Sub-topic pages
  Sub-topic pages → Related resources, back to hub
Blog Posts → Related guide pages, resource directory
```

### Implement "Related Content" Blocks

```html
<!-- Add to blog post template (post.njk) -->
<aside>
  <h2>Related Guides</h2>
  <ul>
    {% if "therapy" in tags %}
      <li><a href="/therapy-guide/">Therapy Guide</a></li>
    {% endif %}
    {% if "iep" in tags or "school" in tags %}
      <li><a href="/school-iep/">School & IEP Navigation</a></li>
    {% endif %}
    <li><a href="/resources/">Resource Directory</a></li>
  </ul>
</aside>
```

---

## Content Gap Analysis Workflow

Identify queries your competitors rank for that you don't cover.

Copy this checklist and track progress:
- [ ] Step 1: List your published pages and their target keywords
- [ ] Step 2: Search each target keyword — note which competitors appear
- [ ] Step 3: Search competitor domain in Google (`site:competitor.com disability resources virginia`)
- [ ] Step 4: Identify pages competitors have that you lack
- [ ] Step 5: Prioritize gaps by search volume and relevance to caregivers
- [ ] Step 6: Create content for top 3-5 gaps
- [ ] Step 7: Build internal links from existing pages to new content
- [ ] Step 8: Submit updated sitemap to Google Search Console

See the **scoping-feature-work** skill for prioritizing content gaps as development work. See the **crafting-page-messaging** skill for writing page copy that targets specific keyword intent.
