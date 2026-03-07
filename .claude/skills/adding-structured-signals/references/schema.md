# Schema Reference: Schema.org Types for The Fullest Project

## Contents
- Schema Type Decision Tree
- Organization Schema (Complete)
- WebSite Schema
- BlogPosting Schema
- ItemList Schema (Resources)
- FAQPage Schema (Guides)
- BreadcrumbList Schema
- PodcastEpisode Schema
- ContactPage Schema
- WARNING: Using Wrong @type for Content

## Schema Type Decision Tree

```
Is this the base layout (all pages)?
  → Organization + WebSite (in base.njk <head>)

Is this a blog post or podcast episode?
  → BlogPosting (or PodcastEpisode) in post.njk

Is this a list/directory page?
  → ItemList in the page template

Is this a Q&A or guide page?
  → FAQPage in the page template

Is this an inner page with navigation context?
  → BreadcrumbList (via shared partial)
```

## Organization Schema (Complete)

For `base.njk` — minimal version on every page:

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "The Fullest Project",
  "url": "https://thefullestproject.org",
  "description": "A connection hub for caregivers to find national and local special needs and disability information, resources, programs, education, and community.",
  "email": "hello@thefullestproject.org"
}
```

For `about.njk` — enhanced with founders:

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "The Fullest Project",
  "url": "https://thefullestproject.org",
  "foundingDate": "2026",
  "founder": [
    { "@type": "Person", "name": "Erin Forgeron", "jobTitle": "Co-Founder" },
    { "@type": "Person", "name": "Nicole Berrigan", "jobTitle": "Co-Founder" }
  ],
  "areaServed": { "@type": "Country", "name": "United States" },
  "knowsAbout": ["disability resources", "caregiver support", "IEP advocacy", "adaptive equipment"]
}
```

## WebSite Schema

Goes in `base.njk` alongside Organization. Enables sitelinks in search results:

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "The Fullest Project",
  "url": "https://thefullestproject.org",
  "description": "A connection hub for caregivers to find disability resources."
}
```

A `SearchAction` could be added if client-side search gets a URL-based query param:

```json
{
  "@type": "WebSite",
  "name": "The Fullest Project",
  "url": "https://thefullestproject.org",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://thefullestproject.org/resources/?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
```

Note: The current `resourceFilter.js` doesn't use URL query params for search. Adding `?q=` support would enable this. See the **javascript** skill.

## BlogPosting Schema

Required properties for article rich results:

```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "Welcome to The Fullest Project",
  "datePublished": "2026-03-06",
  "dateModified": "2026-03-06",
  "author": {
    "@type": "Person",
    "name": "Erin & Nicole"
  },
  "publisher": {
    "@type": "Organization",
    "name": "The Fullest Project",
    "url": "https://thefullestproject.org"
  },
  "description": "We're excited to launch The Fullest Project...",
  "mainEntityOfPage": "https://thefullestproject.org/blog/welcome/",
  "articleSection": "Announcement"
}
```

`headline` must be under 110 characters. `datePublished` must be ISO 8601 format.

## ItemList Schema (Resources)

For the resource directory page. Limit to first 50 to keep payload manageable:

```json
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Disability Resource Directory",
  "description": "Find local and national disability resources, programs, foundations, and services.",
  "numberOfItems": 250,
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "item": {
        "@type": "Organization",
        "name": "Autism Society of America",
        "description": "Nation's leading grassroots autism organization",
        "url": "https://www.autism-society.org/",
        "telephone": "800-328-8476"
      }
    }
  ]
}
```

Each resource maps to an `Organization` item. Use `CommunityHealth` or `GovernmentOrganization` subtypes only if the category clearly matches.

## FAQPage Schema (Guides)

For `therapy-guide/index.njk` and `school-iep/index.njk`. Each card/section becomes a Question:

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "name": "Therapy Guide for Caregivers",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is Occupational Therapy?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Occupational therapy helps individuals develop, recover, or maintain daily living and work skills. Benefits include improved fine motor skills, sensory processing, and independence in daily activities."
      }
    },
    {
      "@type": "Question",
      "name": "What is ABA Therapy?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Applied Behavior Analysis (ABA) uses positive reinforcement to improve social, communication, and learning skills. Most commonly used for individuals with autism spectrum disorder."
      }
    }
  ]
}
```

Each question MUST have visible text on the page that matches the schema. Google penalizes FAQ schema that doesn't reflect visible content.

## BreadcrumbList Schema

For all inner pages. Simple two-level structure:

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://thefullestproject.org/" },
    { "@type": "ListItem", "position": 2, "name": "Resources", "item": "https://thefullestproject.org/resources/" }
  ]
}
```

For blog posts, add a three-level breadcrumb:

```json
{
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://thefullestproject.org/" },
    { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://thefullestproject.org/blog/" },
    { "@type": "ListItem", "position": 3, "name": "Welcome to The Fullest Project", "item": "https://thefullestproject.org/blog/welcome/" }
  ]
}
```

## PodcastEpisode Schema

For podcast episodes using the `post.njk` layout, add a conditional:

```json
{
  "@context": "https://schema.org",
  "@type": "PodcastEpisode",
  "name": "Episode Title",
  "datePublished": "2026-03-06",
  "description": "Episode description...",
  "associatedMedia": {
    "@type": "MediaObject",
    "contentUrl": "https://example.com/episode.mp3"
  },
  "partOfSeries": {
    "@type": "PodcastSeries",
    "name": "The Fullest Project Podcast",
    "url": "https://thefullestproject.org/podcast/"
  }
}
```

Requires adding `audioUrl` and `duration` fields to podcast episode front matter.

### WARNING: Using Wrong @type for Content

**The Problem:**

```json
// BAD - Blog post typed as Article instead of BlogPosting
{ "@type": "Article", "headline": "Welcome to The Fullest Project" }
```

**Why This Breaks:**
1. `Article` is for news journalism. `BlogPosting` is for blog content. Google treats them differently.
2. Using `Article` on a blog post may trigger news-related rich results that don't match the content
3. `BlogPosting` extends `Article` — it has all the same properties plus blog-specific semantics

**The Fix:**

Use the most specific type that matches:
- Blog posts → `BlogPosting`
- Podcast episodes → `PodcastEpisode`
- Resource directory → `ItemList`
- Therapy/IEP guides → `FAQPage`
- Never use `WebPage` when a more specific type applies

**When You Might Be Tempted:** When copying structured data examples from generic SEO tutorials that use `Article` for everything.

## ContactPage Schema

For `src/pages/contact.njk`:

```json
{
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "name": "Contact The Fullest Project",
  "url": "https://thefullestproject.org/contact/",
  "mainEntity": {
    "@type": "Organization",
    "name": "The Fullest Project",
    "email": "hello@thefullestproject.org"
  }
}
```
