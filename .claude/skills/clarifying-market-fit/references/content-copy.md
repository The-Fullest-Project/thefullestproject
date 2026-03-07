# Content & Copy Reference

## Contents
- Copy Architecture in This Project
- ICP-Aligned Copy Formula
- Page-Level Copy Patterns
- Value Narrative Consistency
- Terminology Rules
- Anti-Patterns

## Copy Architecture in This Project

All marketing copy lives in two places:

| Location | Format | Controls |
|----------|--------|----------|
| `src/_data/site.json` | JSON | Canonical positioning: `name`, `tagline`, `description`, `mission`, `goal` |
| `src/pages/*.njk` | Nunjucks HTML | Page-level headlines, subheads, CTAs, section copy |

There is no CMS, no headless API, no content layer. Copy changes require editing files and rebuilding. See the **eleventy** skill for build commands.

## ICP-Aligned Copy Formula

Every piece of copy on this site should pass the **caregiver test**: would an overwhelmed parent of a disabled child immediately understand who this is for and what they can do?

### Hero Headline Formula

```
[Emotional aspiration] OR [Name the ICP's desired outcome]
```

```njk
{# src/pages/index.njk — aspirational headline #}
<h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6">
  Living Life to the Fullest
</h1>
```

```njk
{# src/pages/about.njk — outcome-driven headline #}
<h1 class="text-4xl font-bold mb-6" style="color: var(--color-primary);">
  About The Fullest Project
</h1>
<p class="text-xl" style="color: var(--color-text-light);">
  We believe every individual with a disability deserves the opportunity to
  live life to the fullest, and every caregiver deserves the support to
  make that possible.
</p>
```

### Subhead Formula

```
[Who benefits] + [what they can do on this page] + [specificity signal]
```

```njk
{# src/pages/resources.njk — names audience, action, and scope #}
<p class="text-center mb-12 max-w-2xl mx-auto" style="color: var(--color-text-light);">
  Browse local and national resources for individuals with disabilities
  and their caregivers. Use the filters below to find what you need.
</p>
```

### CTA Copy Formula

```
[Action verb] + [Specific noun]
```

| Good | Bad | Why |
|------|----|-----|
| Find Resources | Learn More | "Learn More" promises nothing specific |
| Submit a Resource | Contribute | "Contribute" is vague — to what? |
| Get Started | Sign Up | "Get Started" implies progress on their terms |
| Browse Therapy Providers | See More | "See More" says nothing about what's there |

## Page-Level Copy Patterns

### Mission Statement (Homepage)

```njk
{# src/pages/index.njk — mission section #}
<p class="text-lg leading-relaxed" style="color: var(--color-text-light);">
  While there are so many different programs, resources, and communities whose
  whole purpose is to support the special needs and disability community, there
  is no centralized place to find them. Finding the right resource often depends
  on who you know or how well you can search.
  <strong style="color: var(--color-text);">We're changing that.</strong>
</p>
```

This follows the **problem → bold assertion** pattern. The `<strong>` tag on "We're changing that." creates a visual and emotional pivot.

### "How We Can Help" Card Copy

Each card follows a strict formula: **[Action verb] + [what] + [specificity]**.

```njk
{# DO — specific, actionable #}
<p>Find local and national programs, foundations, services, and support
   organizations — all in one place.</p>

{# DON'T — vague, self-referential #}
<p>Our resource directory has many helpful listings for you to explore.</p>
```

### Empty State Copy

```njk
{# src/pages/index.njk — blog empty state with redirect #}
<p style="color: var(--color-text-light);">
  Stories coming soon! We're collecting inspiring stories from families
  in the disability community.
</p>
<a href="/contact/" class="btn-primary mt-4 inline-block no-underline">Share Your Story</a>
```

Formula: **Acknowledge absence** + **Explain why** + **Offer a next step**. Never leave a dead end.

## Value Narrative Consistency

The core narrative must be consistent across all pages:

| Element | Canonical Source | Must Not Drift To |
|---------|-----------------|-------------------|
| The problem | "No centralized place to find resources" | "Disability is hard" (too broad) |
| The wedge | "Depends on who you know" | "The internet is confusing" (too generic) |
| The solution | "Connection hub" | "Platform" or "database" (too cold) |
| The proof | Live resource count from `_data/resources/` | Made-up or rounded numbers |
| The ask | "Submit a resource", "Subscribe" | "Donate" (no donation mechanism exists) |

### WARNING: Narrative Drift Between Pages

**The Problem:** The about page says "What about those who don't have those connections?" but a new page introduces a different problem ("disability services are too expensive").

**Why This Breaks:** Visitors who land on different pages get conflicting explanations of why the site exists. Trust erodes when the story changes page to page.

**The Fix:** Every page's value narrative should be traceable back to `site.json`'s `mission` and `goal` fields. If you need a new angle, frame it as a facet of the centralization problem, not a separate problem.

## Terminology Rules

See the **tightening-brand-voice** skill for the full vocabulary table. Key rules for ICP alignment:

| Always | Never | Rationale |
|--------|-------|-----------|
| Caregiver | Parent (as sole term) | Includes siblings, grandparents, guardians |
| Individual with a disability | Handicapped, special needs person | Person-first language is the project standard |
| Connection hub | Platform, portal | Matches `site.json` positioning |
| Resource directory | Database, catalog | Matches nav and page titles |
| Community | Users, audience | Reinforces peer relationship |

## Anti-Patterns

### WARNING: Writing Copy That Speaks to Multiple Audiences

**The Problem:**

```njk
{# BAD — tries to address caregivers AND professionals simultaneously #}
<p>Whether you're a caregiver looking for resources or a professional
   wanting to list your services, The Fullest Project has something for you.</p>
```

**Why This Breaks:**
1. Dilutes the ICP — caregivers feel this isn't "for them"
2. Professional-facing copy requires different value propositions
3. "Something for everyone" is positioning for no one

**The Fix:**

```njk
{# GOOD — speaks to the ICP only; professionals use submit-resource #}
<p>Your connection hub for disability resources, programs, education,
   and community.</p>
```

Professionals who want to list services can use `/submit-resource/` — they don't need their own value proposition on the homepage.

### WARNING: Inventing Stats Not Backed by Data

```njk
{# BAD — hardcoded guess #}
<div class="text-3xl font-extrabold">500+</div>
<p>Verified Resources</p>

{# GOOD — live count from Eleventy data #}
<div class="text-3xl font-extrabold">{{ allResources | length }}+</div>
<p>Verified Resources</p>
```

See the **eleventy** skill for how `allResources` is assembled from `_data/resources/*.json`.
