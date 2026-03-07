# Content & Copy Reference

## Contents
- Conversion Copy Surfaces
- Hero Messaging Audit
- CTA Copy Patterns
- Form Microcopy
- Value Proposition Mapping
- WARNING: Inconsistent Voice Across Forms

## Conversion Copy Surfaces

All conversion-relevant copy lives in Nunjucks templates and `site.json`. There is no CMS — every copy change is a file edit.

| Surface | File | Lines | Purpose |
|---------|------|-------|---------|
| Hero headline | `src/pages/index.njk` | 11-12 | First impression, positioning |
| Hero subhead | `src/pages/index.njk` | 13-14 | Value prop in one line |
| Mission block | `src/pages/index.njk` | 25-31 | Problem/solution framing |
| Newsletter CTA | `src/pages/index.njk` | 116-118 | Subscription value prop |
| Stats bar | `src/pages/index.njk` | 135-145 | Social proof numbers |
| Contact intro | `src/pages/contact.njk` | 10-12 | Sets expectation for form |
| Resource submit intro | `src/pages/submit-resource.njk` | 10-12 | Motivates community contribution |
| Footer newsletter | `src/_includes/components/footer.njk` | 35-36 | Persistent subscribe prompt |

## Hero Messaging Audit

Current homepage hero:

```html
<h1 class="text-4xl md:text-6xl font-extrabold mb-6">Living Life to the Fullest</h1>
<p class="text-xl md:text-2xl mb-8 opacity-90">
  Your connection hub for disability resources, programs, education, and community.
</p>
```

**Assessment:**
- Headline is brand-driven ("Living Life to the Fullest"), not benefit-driven
- Subhead does the positioning work — clear ICP signal ("disability resources")
- Missing: specificity about WHO this serves (caregivers)

### DO: Lead with caregiver identity

```html
<h1 class="text-4xl md:text-6xl font-extrabold mb-6">Living Life to the Fullest</h1>
<p class="text-xl md:text-2xl mb-8 opacity-90">
  The caregiver's connection hub — find disability resources, programs, and community
  across all 50 states.
</p>
```

**Why:** "Caregiver's" in the subhead creates immediate self-identification. Adding "all 50 states" reinforces coverage breadth. See the **clarifying-market-fit** skill for ICP alignment.

### DON'T: Use generic welcome copy

```html
{# BAD — says nothing specific #}
<p>Welcome to our website. We have resources for you.</p>
```

## CTA Copy Patterns

### DO: Action + Benefit CTAs

Current CTAs that work well:

```html
{# Good: verb + object #}
<a href="/resources/" class="btn-secondary">Find Resources</a>
<a href="/resources/?category=therapy" class="btn-primary">Browse Therapy Providers</a>
<a href="/resources/?category=legal" class="btn-primary">Find IEP Advocates & Law Firms</a>
```

These follow `[Verb] + [Specific Object]` — the user knows exactly what they get.

### DON'T: Use vague CTA labels

```html
{# BAD — "Learn More" tells the user nothing #}
<a href="/about/" class="bg-white/20 ...">Learn More</a>
```

```html
{# BETTER — benefit-oriented #}
<a href="/about/" class="bg-white/20 ...">See Our Mission</a>
```

**Why:** "Learn More" is the lowest-converting CTA text. Users who just landed need certainty about what happens next, not vague promises. See the **crafting-page-messaging** skill.

### DO: Match CTA to page context

The therapy guide page ends with:
```html
<a href="/resources/?category=therapy" class="btn-primary">Browse Therapy Providers</a>
```

This is correct — the CTA continues the user's intent. Every educational page should end with a contextual resource directory link using `?category=` params.

## Form Microcopy

### DO: Set expectations before the form

```html
{# src/pages/contact.njk — existing intro copy #}
<p class="text-lg text-gray-600 mb-8">
  Have a question, suggestion, or want to share your story?
  We'd love to hear from you.
</p>
```

### DO: Use specific placeholders

```html
{# GOOD — guides the user #}
<input placeholder="your@email.com">
<textarea placeholder="How can we help?"></textarea>
```

### DON'T: Use field labels as placeholders only

```html
{# BAD — placeholder disappears on focus, user forgets what field is #}
<input placeholder="Name">
```

The project correctly uses `sr-only` labels alongside placeholders for accessibility. Maintain this pattern — never remove the `<label>` even when a placeholder exists.

## Value Proposition Mapping

The homepage stats bar provides quantitative social proof:

```html
<p class="text-4xl font-extrabold">{{ allResources | length }}+</p>
<p>Verified Resources</p>

<p class="text-4xl font-extrabold">51</p>
<p>Locations Covered</p>

<p class="text-4xl font-extrabold">29</p>
<p>Resource Categories</p>
```

**This is the site's strongest conversion copy.** Real numbers build trust. Keep these dynamic (the resource count already uses Eleventy data).

### DO: Reinforce stats on other pages

The resources page should echo the count:
```html
<p class="text-gray-500">Showing {{ visibleCount }} of {{ totalCount }} resources</p>
```

`resourceFilter.js` already updates visible count — use it as proof of depth.

## WARNING: Inconsistent Voice Across Forms

**The Problem:**

Newsletter CTAs use different value propositions:

- Homepage: "Get updates on new resources, blog posts, podcast episodes, and community news"
- Footer: "Get updates on new resources, blog posts, and community news"
- Services gig notify: (no value prop, just "Get notified at launch")

**Why This Breaks:**
1. Users who see both may question what they're actually subscribing to
2. Missing "podcast episodes" from the footer is an unforced omission
3. The gig notify form uses the same Formspree endpoint as newsletter — subscribers expect different content

**The Fix:**

Standardize the newsletter value prop across all instances:
```html
{# Use this EVERYWHERE #}
<p>Get updates on new resources, blog posts, podcast episodes, and community news.</p>
```

Keep the gig platform form separate — ideally a different Formspree endpoint, or at minimum clear messaging that this is a launch notification, not the general newsletter. See the **tightening-brand-voice** skill.
