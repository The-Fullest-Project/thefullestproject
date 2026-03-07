# Markdown Content Patterns

## Contents
- Front Matter Patterns
- Content Structure
- Formatting Conventions
- Internal Linking
- Lists and Resources
- Images
- Anti-Patterns

## Front Matter Patterns

### Blog Post — Full Front Matter

```markdown
---
layout: layouts/post.njk
title: "Navigating the IEP Process: A Parent's Guide"
date: 2026-04-10
author: "Erin & Nicole"
category: "Education"
excerpt: "Step-by-step guidance for parents preparing for their first IEP meeting."
tags:
  - iep
  - education
  - advocacy
---
```

### Podcast Episode — Full Front Matter

```markdown
---
layout: layouts/post.njk
title: "Finding Your Village: Building a Support Network"
date: 2026-05-01
excerpt: "We talk with three caregivers about how they found community."
episodeNumber: 3
duration: "38 min"
tags:
  - podcast
  - community
---
```

### WARNING: Date Format Must Be YYYY-MM-DD

**The Problem:**

```markdown
---
date: March 15, 2026
---
```

**Why This Breaks:**
1. Eleventy parses dates inconsistently across formats — `March 15, 2026` may produce a different Date object than expected
2. Collection sorting relies on `b.date - a.date` arithmetic, which needs valid Date objects
3. The `dateFormat` filter calls `new Date(date)` — ambiguous formats cause timezone-shifted or NaN results

**The Fix:**

```markdown
---
date: 2026-03-15
---
```

## Content Structure

### Opening Pattern

The `post.njk` layout renders the `title` as H1 and shows `date`, `author`, and `category` in a header block. Content should start immediately with a paragraph — no heading, no title repeat.

```markdown
---
title: "Welcome to The Fullest Project"
---

We're so excited to officially launch The Fullest Project.

As caregivers ourselves, we know firsthand how isolating
and overwhelming it can feel to navigate the world of
disability resources.
```

### Section Headings

Use H2 (`##`) for top-level sections and H3 (`###`) for subsections. The layout's `prose` class styles these appropriately.

```markdown
## What You'll Find Here

Overview of the site sections.

### Resource Directory

Details about the resource directory.

### Therapy Guide

Details about therapy types.
```

### WARNING: Never Skip Heading Levels

**The Problem:**

```markdown
## Main Section

#### Subsection (skipped H3)
```

**Why This Breaks:**
1. Screen readers announce heading levels — skipping creates a confusing document outline for assistive technology users
2. This project has a strong accessibility focus; broken heading hierarchy undermines that commitment
3. The `prose` typography classes expect sequential heading levels for proper spacing

**The Fix:**

```markdown
## Main Section

### Subsection
```

## Formatting Conventions

### Emphasis Patterns Used in This Project

```markdown
**Bold** for key terms and strong emphasis

*Italic* for attribution and soft emphasis (e.g., *— Erin & Nicole*)

**Bold with em dash** — Description pattern for list items
```

### Blockquotes for Callouts

```markdown
> If you know of a program, service, or organization that
> supports individuals with disabilities — please share it.
> Every resource helps another family.
```

### WARNING: No Raw HTML in Markdown Content

**The Problem:**

```markdown
<div class="bg-teal-50 p-4">
  <p>Special callout</p>
</div>
```

**Why This Breaks:**
1. Content renders inside `<div class="prose prose-lg">` — raw HTML bypasses prose typography and looks inconsistent
2. Tailwind utility classes in markdown content won't be included in the CSS build unless they appear in template files scanned by Tailwind
3. Mixing HTML and markdown makes content harder to maintain for non-technical authors

**The Fix:**

Use markdown formatting (blockquotes, bold, headings) for emphasis. If a custom component is needed, add it to the `post.njk` layout via Nunjucks. See the **nunjucks** skill for component patterns.

## Internal Linking

### Link to Site Pages

Always use root-relative paths with trailing slashes to match Eleventy's permalink output:

```markdown
Check our [Resource Directory](/resources/) for local programs.

Learn about [therapy types](/therapy-guide/) and when each helps.

You can [submit a resource](/submit-resource/) you know about.
```

### WARNING: No Trailing Slash Produces 404 on Some Hosts

**The Problem:**

```markdown
[Resources](/resources)
```

**Why This Breaks:** Eleventy generates `resources/index.html`. GoDaddy shared hosting requires the trailing slash to resolve directory index files. Without it, users may get a 404 or a redirect that breaks relative asset paths.

**The Fix:**

```markdown
[Resources](/resources/)
```

## Lists and Resources

### Resource Lists with Em Dash Pattern

The established pattern for lists that describe site features or external resources:

```markdown
- **Resource Directory** — A searchable, filterable directory
  of local and national resources.
- **Therapy Guide** — Clear explanations of different therapy
  types and when each is most beneficial.
- **Adaptive Equipment** — Equipment categories, loaner programs,
  and curated product recommendations.
```

### External Resource Links in Show Notes

For podcast episodes referencing external resources:

```markdown
## Resources Mentioned

- [The Arc](https://thearc.org/) — National advocacy organization
  for people with intellectual and developmental disabilities
- [Understood.org](https://understood.org/) — Learning and
  thinking differences resources for families
```

## Images

Images live in `src/images/` and are passthrough-copied to `_site/images/`. Reference them with root-relative paths:

```markdown
![Alt text describing the image](/images/photo-name.jpg)
```

Always include meaningful alt text — this is an accessibility-focused project. Decorative images that add no information should use empty alt: `![](/images/decorative.jpg)`.

See the **eleventy** skill for passthrough copy configuration.
