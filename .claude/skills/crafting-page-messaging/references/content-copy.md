# Content Copy Reference

## Contents
- Copy Locations in the Codebase
- Headline Formulas
- Meta Description Patterns
- WARNING: Jargon Without Context
- WARNING: Passive Voice in CTAs
- Empty-State Copy
- Tone Rules for This Audience

## Copy Locations in the Codebase

All page copy lives directly in Nunjucks templates. There is no CMS — edits happen in-file.

| Copy Type | Location | Editable By |
|-----------|----------|-------------|
| Page headlines + body | `src/pages/*.njk` | Template edit |
| Meta descriptions | YAML front matter `description` field | Template edit |
| Site tagline + mission | `src/_data/site.json` (`tagline`, `mission`, `goal`) | JSON edit |
| Blog post copy | `src/blog/*.md` | Markdown edit |
| Resource descriptions | `src/_data/resources/*.json` (`description` field) | JSON or scraper |
| Nav labels | `src/_includes/components/nav.njk` | Template edit |
| Footer copy | `src/_includes/components/footer.njk` | Template edit |

## Headline Formulas

### Formula 1: Outcome + Context

```njk
{# src/pages/index.njk #}
<h1>Living Life to the Fullest</h1>
<p>Your connection hub for disability resources, programs, education, and community.</p>
```

H1 is the aspirational outcome. Subhead grounds it in what the site actually does. Use this for the homepage and about page.

### Formula 2: Task + Reassurance

```njk
{# src/pages/school-iep/index.njk #}
<h1>School & IEP Navigation</h1>
<p>Navigating the special education system can feel overwhelming.
   This guide will help you understand your child's rights and how to
   effectively advocate for their needs.</p>
```

H1 names the task. Subhead acknowledges the difficulty, then promises the guide will help. Use this for educational pages.

### Formula 3: Direct Invitation

```njk
{# src/pages/submit-resource.njk #}
<h1>Submit a Resource</h1>
<p>Know of a program, service, or organization that supports individuals
   with disabilities? Help us build a more complete directory by sharing it below.</p>
```

H1 is the action. Subhead qualifies (do you know a resource?) then states the impact (more complete directory). Use this for form pages.

### DON'T: Feature-Focused Headlines

```njk
{# BAD — talks about the site, not the visitor #}
<h1>Our Comprehensive Resource Database</h1>
<p>We've built a state-of-the-art directory with advanced filtering capabilities.</p>
```

**Why this breaks:** Caregivers don't care about your tech stack. They want to find a therapy provider for their child by Friday.

## Meta Description Patterns

Front matter `description` powers `<meta name="description">` and Open Graph tags via `src/_includes/layouts/base.njk`:

```njk
<meta name="description" content="{{ description or site.description }}">
<meta property="og:description" content="{{ description or site.description }}">
```

### DO: Keyword + Benefit Under 160 Characters

```yaml
# src/pages/resources.njk
description: "Find local and national disability resources, programs, foundations, and services."
```

### DON'T: Stuff Keywords or Exceed 160 Characters

```yaml
# BAD — keyword soup, truncated in search results
description: "disability resources programs foundations services support caregivers special needs help find local national directory search browse filter"
```

### DO: Match Search Intent

```yaml
# src/pages/therapy-guide/index.njk
description: "Learn about different therapy types for individuals with disabilities, when each is most beneficial, and how to find the right provider."
```

This matches a query like "types of therapy for disabled children" — the description confirms the page will answer that question.

## WARNING: Jargon Without Context

**The Problem:**

```njk
<!-- BAD — assumes knowledge of acronyms -->
<p>Navigate the IEP process, understand FAPE, and leverage your IDEA protections.</p>
```

**Why This Breaks:**
1. New caregivers don't know these acronyms
2. Jargon creates a wall — visitors feel "this isn't for me"
3. Search engines can't match natural-language queries to acronym-heavy copy

**The Fix:**

```njk
<!-- GOOD — spell out on first use, explain in plain language -->
<p>Navigate your child's Individualized Education Program (IEP),
   understand their right to a free appropriate public education,
   and know your legal protections under federal law.</p>
```

**When You Might Be Tempted:** When writing for the school-iep or therapy-guide pages. These audiences include parents who just received a diagnosis — they're learning terminology in real-time.

## WARNING: Passive Voice in CTAs

**The Problem:**

```njk
<!-- BAD — passive, no agency -->
<a href="/resources/" class="btn-primary">Resources Can Be Found Here</a>
<p>Your story could be shared with our community.</p>
```

**Why This Breaks:** Passive voice removes the visitor's agency. CTAs must make the visitor the actor.

**The Fix:**

```njk
<!-- GOOD — active, visitor is the subject -->
<a href="/resources/" class="btn-primary">Find Resources</a>
<p>Share your story with our community.</p>
```

## Empty-State Copy

When content doesn't exist yet, the empty state is the CTA. The codebase uses `{% else %}` blocks:

### DO: Turn Emptiness Into a Promise

```njk
{# src/pages/index.njk — blog empty state #}
{% else %}
<div class="card p-6 text-center lg:col-span-3">
  <p style="color: var(--color-text-light);">
    Stories coming soon! We're collecting inspiring stories from
    families in the disability community.
  </p>
  <a href="/contact/" class="btn-primary mt-4 inline-block no-underline">Share Your Story</a>
</div>
{% endfor %}
```

Pattern: **Acknowledgment** ("coming soon") + **what's happening** ("collecting stories") + **action** ("Share Your Story"). See the **designing-inapp-guidance** skill for more empty-state patterns.

### DON'T: Leave a Blank Page

```njk
{# BAD — visitor hits a dead end #}
{% else %}
<p>No posts yet.</p>
{% endfor %}
```

## Tone Rules for This Audience

| Rule | Example | Anti-Example |
|------|---------|-------------|
| Empathetic, never pitying | "We know this can feel overwhelming" | "We feel sorry for your situation" |
| Empowering, never patronizing | "Advocate for your child's rights" | "Let us handle this for you" |
| Specific, never vague | "200+ resources across 51 locations" | "Lots of great resources" |
| Warm, never clinical | "Find the right therapy provider" | "Access therapeutic service providers" |
| Action-oriented, never passive | "Search, filter, find what you need" | "Resources are available for browsing" |
| Inclusive language | "Individuals with disabilities" | "The disabled" or "special kids" |

The site data in `src/_data/site.json` uses person-first language ("caregivers of individuals with disabilities"). Match this in all copy.

## Copy Review Workflow

1. Write or revise copy in the `.njk` template
2. Validate: `npm run build:11ty` — ensure no Nunjucks syntax errors
3. Check meta description length: count characters in `description` front matter (target: 120-155 chars)
4. If build fails, fix template syntax and repeat step 2
5. Review rendered HTML in `_site/` to verify no escaped tags or broken layout
