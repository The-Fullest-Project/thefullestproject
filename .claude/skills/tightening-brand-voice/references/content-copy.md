# Content Copy Reference

## Contents
- Copy Surfaces and File Locations
- Voice Rules for Each Content Type
- Heading Hierarchy Patterns
- Terminology Consistency
- WARNING: Tone Drift Anti-Patterns
- Blog Post Voice Standards
- Editing Workflow

## Copy Surfaces and File Locations

| Content Type | Files | Voice Notes |
|-------------|-------|-------------|
| Page headings & intros | `src/pages/*.njk` | Empathy-first, action-oriented |
| Blog posts | `src/blog/*.md` | Personal, peer-to-peer, uses "we"/"you" |
| Podcast descriptions | `src/podcast/*.md` | Conversational, teaser-style |
| Meta descriptions | YAML front matter in every page | Under 160 chars, keyword + benefit |
| Nav labels | `src/_includes/components/nav.njk` | Short, scannable, noun-based |
| Footer copy | `src/_includes/components/footer.njk` | Brief mission restatement + action links |
| Site metadata | `src/_data/site.json` | Canonical brand terms (tagline, description, mission) |
| Form labels & placeholders | Various `.njk` pages | Clear, specific, no placeholder-as-label |

## Voice Rules for Each Content Type

### Static Pages (`.njk`)

```njk
{# GOOD — warm, specific, outcome-focused #}
<h1>Resource Directory</h1>
<p>Browse local and national resources for individuals with disabilities
   and their caregivers. Use the filters below to find what you need.</p>

{# BAD — corporate, feature-focused #}
<h1>Resource Directory</h1>
<p>Our comprehensive platform provides access to a database of resources
   that can be filtered using our advanced search functionality.</p>
```

**Why the bad version fails:** "Platform," "database," "advanced search functionality" — this is tech-speak. Caregivers don't care about the tech; they care about finding help.

### Blog Posts (`.md`)

```markdown
<!-- GOOD — personal, direct, uses "we" -->
We're so excited to officially launch The Fullest Project. As caregivers
ourselves, we know firsthand how isolating and overwhelming it can feel
to navigate the world of disability resources.

<!-- BAD — third-person, press-release tone -->
The Fullest Project is pleased to announce its official launch. The
organization aims to address gaps in resource accessibility for the
disability community.
```

**Rule:** Blog posts are written by Erin and Nicole as peers. Always use first person ("we", "our journey"). Sign off with "— Erin & Nicole" when appropriate.

### Meta Descriptions

```yaml
# GOOD — benefit + specificity
description: "Find local and national disability resources, programs, foundations, and services."

# BAD — vague, keyword-stuffed
description: "The best disability resources website for special needs families and caregivers looking for help."
```

**Formula:** `[Action verb] + [what they find] + [specificity signal]`

## Heading Hierarchy Patterns

Every page follows a predictable heading structure:

```
H1: Page promise (one per page)
  H2: Section topic
    H3: Subtopic (rare — only in therapy guide and services)
```

**Voice rules for headings:**

```njk
{# H1 — name the visitor's outcome #}
<h1>Living Life to the Fullest</h1>
<h1>Resource Directory</h1>
<h1>About The Fullest Project</h1>

{# H2 — name the section's value #}
<h2>How We Can Help</h2>
<h2>Our Three-Phase Approach</h2>
<h2>Know a Resource We're Missing?</h2>

{# AVOID — H2s that describe the section mechanically #}
<h2>Section 1: Resources</h2>
<h2>About Our Team</h2>
```

## Terminology Consistency

These terms are canonical. Use them exactly as shown — inconsistency confuses both readers and search engines.

| Canonical Term | Source | NEVER Use |
|---------------|--------|-----------|
| The Fullest Project | `site.name` in `site.json` | TFP, Fullest, the project |
| caregiver | All page copy | caretaker, carer, parent (too narrow) |
| individual with a disability | About page, blog | disabled person, special needs child |
| resource directory | Nav, H1 on resources page | database, catalog, listings |
| connection hub | `site.description` | platform, portal, website |
| submit a resource | CTA text, nav on submit page | add a listing, contribute |
| Northern Virginia | `site.json` locations | NoVA, NOVA, N. Virginia |
| Portland | `site.json` locations | Portland, OR (only use state in disambiguation) |

## WARNING: Tone Drift Anti-Patterns

### The Corporate Creep

**The Problem:**
```njk
<p>The Fullest Project leverages cutting-edge technology to deliver
   innovative solutions for the disability community.</p>
```

**Why This Breaks:**
1. "Leverages," "cutting-edge," "innovative" — corporate filler that says nothing
2. Distances the org from the reader (they're a "community" being "served")
3. Destroys the peer-to-peer trust the brand depends on

**The Fix:**
```njk
<p>We built this directory because we needed it ourselves — and we know
   you do too.</p>
```

### The Pity Trap

**The Problem:**
```markdown
These families face unimaginable challenges every single day. It's
heartbreaking to see how many fall through the cracks.
```

**Why This Breaks:**
1. Positions caregivers as objects of pity, not agents of action
2. Undermines the empowering brand promise ("Living Life to the Fullest")
3. Visitors who are caregivers will feel talked about, not talked to

**The Fix:**
```markdown
Navigating disability resources shouldn't depend on who you know. Every
caregiver deserves access to the same programs, services, and community.
```

### The Jargon Wall

**The Problem:**
```njk
<p>Navigate IDEA, FAPE, LRE, and your child's IEP/504 accommodations.</p>
```

**Why This Breaks:** A first-time caregiver won't know any of these acronyms. This copy excludes the exact people the site exists to help.

**The Fix:**
```njk
<p>Navigate the Individualized Education Program (IEP) process, 504 plans,
   your rights under federal law, and how to advocate for your child's education.</p>
```

## Blog Post Voice Standards

```yaml
# Required front matter for brand consistency
---
title: "Welcome to The Fullest Project"
date: 2026-03-06
author: "Erin & Nicole"
category: "Announcement"
excerpt: "We're excited to launch The Fullest Project — a centralized hub..."
layout: post
---
```

**Blog voice rules:**
- Open with a personal hook, not a fact dump
- Use the recurring question: "What about those who don't have those connections?"
- Close with "— Erin & Nicole" for founder-authored posts
- Include at least one internal link to a resource page or the directory
- Excerpt (used in blog listing) must be a complete, compelling sentence

## Editing Workflow

1. Read the target file with the Read tool
2. Check terminology against the Terminology Consistency table
3. Flag any corporate filler, pity framing, or unexplained jargon
4. Edit violations using the Edit tool — preserve surrounding HTML/Nunjucks structure
5. Re-read to verify edits flow naturally in context
6. If the page has a `description` in front matter, verify it's under 160 chars

## Related Skills

- See the **crafting-page-messaging** skill for writing new page copy from scratch
- See the **nunjucks** skill for template syntax when editing `.njk` files
- See the **markdown** skill for blog post formatting conventions
- See the **inspecting-search-coverage** skill for meta description optimization
