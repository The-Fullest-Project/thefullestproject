# Content Reference: Mapping Site Content to Schema Types

## Contents
- Content-to-Schema Type Map
- Homepage Structured Data
- Blog Post Structured Data
- Resource Directory as ItemList
- Guide Pages as FAQPage
- About Page as Organization
- WARNING: Generic Schema on Specialized Content

## Content-to-Schema Type Map

| Content | Location | Schema Type | Rich Result |
|---------|----------|-------------|-------------|
| Site identity | `base.njk` | Organization | Knowledge panel |
| Search presence | `base.njk` | WebSite | Sitelinks searchbox |
| Blog posts | `post.njk` | BlogPosting | Article cards |
| Resource directory | `resources.njk` | ItemList | Carousel |
| Therapy guide | `therapy-guide/index.njk` | FAQPage | FAQ dropdowns |
| School/IEP guide | `school-iep/index.njk` | FAQPage | FAQ dropdowns |
| About page | `about.njk` | Organization + Person | Enhanced knowledge panel |
| Contact page | `contact.njk` | ContactPage | Contact info |
| Podcast episodes | `post.njk` | PodcastEpisode | Podcast carousel |

## Homepage Structured Data

The homepage (`src/pages/index.njk`) should carry the richest Organization schema since it's the site's canonical identity page.

```html
<!-- At bottom of index.njk, after last section -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "{{ site.name }}",
  "url": "{{ site.url }}",
  "description": "{{ site.description }}",
  "email": "{{ site.email }}",
  "foundingDate": "2026",
  "founder": [
    { "@type": "Person", "name": "Erin Forgeron", "jobTitle": "Co-Founder" },
    { "@type": "Person", "name": "Nicole Berrigan", "jobTitle": "Co-Founder" }
  ],
  "areaServed": {
    "@type": "Country",
    "name": "United States"
  },
  "knowsAbout": ["disability resources", "caregiver support", "special needs", "IEP advocacy"]
}
</script>
```

Note: The base.njk carries a simpler Organization block for all pages. The homepage enhances it with founder and area details. Google will merge signals from both.

## Blog Post Structured Data

Blog posts use `src/_includes/layouts/post.njk`. Front matter fields map directly:

```yaml
# src/blog/welcome.md front matter
layout: layouts/post.njk
title: "Welcome to The Fullest Project"
date: 2026-03-06
author: "Erin & Nicole"
category: "Announcement"
excerpt: "We're excited to launch The Fullest Project..."
```

Maps to:

```json
{
  "@type": "BlogPosting",
  "headline": "Welcome to The Fullest Project",
  "datePublished": "2026-03-06",
  "author": { "@type": "Person", "name": "Erin & Nicole" },
  "articleSection": "Announcement",
  "description": "We're excited to launch The Fullest Project..."
}
```

## Resource Directory as ItemList

The resource directory (`src/pages/resources.njk`) renders all resources from `allResources`. This maps to an `ItemList` schema:

```html
<!-- At bottom of resources.njk, before the resourceFilter.js script -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Disability Resource Directory",
  "description": "{{ description }}",
  "numberOfItems": {{ allResources | length }},
  "itemListElement": [
    {% for resource in allResources | limit(50) %}
    {
      "@type": "ListItem",
      "position": {{ loop.index }},
      "item": {
        "@type": "Organization",
        "name": "{{ resource.name | jsonEscape }}",
        "description": "{{ resource.description | jsonEscape }}"
        {% if resource.website %},
        "url": "{{ resource.website }}"
        {% endif %}
        {% if resource.phone %},
        "telephone": "{{ resource.phone }}"
        {% endif %}
        {% if resource.address %},
        "address": "{{ resource.address | jsonEscape }}"
        {% endif %}
      }
    }{% if not loop.last %},{% endif %}
    {% endfor %}
  ]
}
</script>
```

Limit to 50 items to keep the JSON-LD payload reasonable. Google processes the first items and infers the rest.

### WARNING: Generic Schema on Specialized Content

**The Problem:**

```html
<!-- BAD - Using WebPage for everything -->
<script type="application/ld+json">
{ "@type": "WebPage", "name": "Therapy Guide" }
</script>
```

**Why This Breaks:**
1. `WebPage` is the most generic type — Google learns nothing useful from it
2. Misses rich result eligibility entirely (FAQPage gets FAQ dropdowns, WebPage gets nothing)
3. The therapy guide has Q&A-formatted content that qualifies for FAQPage rich results

**The Fix:**

Match the schema type to the content format:

```html
<!-- GOOD - Therapy guide with Q&A content uses FAQPage -->
<script type="application/ld+json">
{
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is Occupational Therapy?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Occupational therapy helps individuals develop or recover daily living skills..."
      }
    }
  ]
}
</script>
```

**When You Might Be Tempted:** When you're unsure which schema type applies. Always check if the content is Q&A (FAQPage), a list (ItemList), an article (Article), or instructional (HowTo).

## Guide Pages as FAQPage

Both `therapy-guide/index.njk` and `school-iep/index.njk` present educational content in a question-answer format. These qualify for FAQPage rich results.

Structure the schema to match each card/section:

```html
<!-- In therapy-guide/index.njk -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "name": "Therapy Guide for Caregivers",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is Occupational Therapy and when is it needed?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Occupational therapy helps individuals develop, recover, or maintain daily living and work skills. It is beneficial for children with developmental delays, sensory processing difficulties, or fine motor challenges."
      }
    },
    {
      "@type": "Question",
      "name": "What is Physical Therapy for children with disabilities?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Physical therapy focuses on improving gross motor skills, balance, strength, and mobility. It helps children with conditions affecting movement and physical function."
      }
    }
  ]
}
</script>
```

## About Page as Organization

The about page (`src/pages/about.njk`) has detailed founder bios. Enhance the Organization schema:

```html
<!-- In about.njk, at the bottom -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "{{ site.name }}",
  "url": "{{ site.url }}",
  "founder": [
    {
      "@type": "Person",
      "name": "Erin Forgeron",
      "jobTitle": "Co-Founder",
      "description": "Doctorate in Occupational Therapy, 10+ years pediatric OT experience",
      "address": { "@type": "PostalAddress", "addressRegion": "OR", "addressLocality": "Portland" }
    },
    {
      "@type": "Person",
      "name": "Nicole Berrigan",
      "jobTitle": "Co-Founder",
      "description": "Masters in Organizational Leadership, trained executive coach",
      "address": { "@type": "PostalAddress", "addressRegion": "VA" }
    }
  ]
}
</script>
```
