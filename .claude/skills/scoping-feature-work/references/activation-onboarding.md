# Activation & Onboarding Scoping

## Contents
- First-Visit Value Delivery
- Empty State Strategy
- Newsletter Funnel Slicing
- Onboarding Feature Scope Patterns
- Anti-Patterns

## First-Visit Value Delivery

The homepage is the primary activation surface. Every first-time visitor must understand what the site does and find value within one scroll. Scope homepage features to maximize this.

**Current homepage activation flow:**

```nunjucks
{# Hero: Mission statement + newsletter CTA #}
<section class="hero-gradient">
  <h1>Living Life to the Fullest</h1>
  <p>{{ site.description }}</p>
  <form action="https://formspree.io/f/{{ site.formspree.newsletter }}">
    <input type="email" placeholder="Enter your email" required>
    <button type="submit" class="btn-secondary">Subscribe</button>
  </form>
</section>

{# Feature cards: 6 entry points to content #}
<section class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
  {# Resource Directory, Therapy Guide, Equipment, School & IEP, Blog, Podcast #}
</section>
```

**Scoping new homepage sections:**

```
Feature: "Add coverage stats to homepage"

Slice 1 (MVP): Hardcoded stats
  AC: Shows resource count, state count, category count
  AC: Uses allResources | length for dynamic resource count

Slice 2: Per-location breakdown
  AC: Shows top 5 states by resource count
  AC: Each links to /resources/?location=[State]
```

### DO: Scope activation features as standalone sections

```nunjucks
{# Each homepage section is an independent slice #}
{# Stats section — depends only on allResources global data #}
<section class="section-warm py-16">
  <div class="max-w-6xl mx-auto text-center">
    <p class="text-4xl font-bold">{{ allResources | length }}+</p>
    <p>Resources Across the Nation</p>
  </div>
</section>
```

### DON'T: Couple homepage sections to unbuilt features

```nunjucks
{# BAD — references a /community/ page that doesn't exist yet #}
<section>
  <a href="/community/" class="btn-primary">Join Our Community</a>
</section>
{# Ship the community page in its own slice first #}
```

**Why:** Dead links on the homepage destroy trust on first visit. Every CTA must point to a live page. Scope the destination page as Slice 1, the homepage CTA as Slice 2.

## Empty State Strategy

Empty states are activation opportunities, not placeholders. The project already has a strong pattern — follow it.

**Current empty state pattern (blog, podcast):**

```nunjucks
{% if collections.blogPosts | length == 0 %}
  <div class="card p-8 text-center">
    <p class="text-xl font-semibold" style="color: var(--color-primary);">
      Blog posts coming soon!
    </p>
    <p class="mt-2 text-gray-600">
      We're working on sharing stories, insights, and practical advice.
      Sign up for our newsletter to be notified when new posts are published.
    </p>
  </div>
{% endif %}
```

**Scoping new content types with empty states:**

```
Feature: "Add community stories section"

Slice 1 (MVP): Listing page with empty state
  Files: src/pages/stories.njk
  AC: Page renders at /stories/
  AC: Empty state shows newsletter signup CTA
  AC: Nav link added (desktop + mobile)

Slice 2: First 3 stories
  Files: src/stories/*.md (3 files)
  AC: Stories render in collection, empty state hidden
  AC: Each story uses post.njk layout

Slice 3: Decap CMS integration
  Files: src/admin/config.yml (add stories collection)
  AC: Non-technical team can create stories via /admin/
```

### DO: Include a conversion CTA in every empty state

Every empty state should capture email or drive to existing content. The project's pattern is newsletter signup — stick with it.

### DON'T: Ship a page with no empty state handling

```nunjucks
{# BAD — blank page if no content exists #}
{% for story in collections.stories %}
  <div class="card">{{ story.data.title }}</div>
{% endfor %}
{# If collections.stories is empty, user sees nothing #}
```

**Why:** A blank page signals abandonment. An empty state with a CTA converts uncertainty into engagement.

## Newsletter Funnel Slicing

Newsletter signup appears in three locations: homepage hero, footer (all pages), and empty states. New signup touchpoints should be scoped as separate slices.

```
Checklist for new newsletter touchpoint:
- [ ] Uses existing site.formspree.newsletter ID
- [ ] Email input with type="email" and required
- [ ] Styled with .form-input + .btn-primary or .btn-secondary
- [ ] Hidden field to identify source: <input type="hidden" name="_source" value="[page-name]">
- [ ] Test submission reaches Formspree dashboard
```

## Onboarding Feature Scope Patterns

**For new guide pages (therapy-guide, school-iep pattern):**

```
Slice 1: Static educational content
  AC: Page renders with structured content cards
  AC: In-page anchor navigation if 5+ sections
  AC: Linked from homepage feature cards

Slice 2: Dynamic resource integration
  AC: Pulls relevant resources from allResources
  AC: CTA links to filtered /resources/ view

Slice 3: Location-specific content
  AC: Conditional sections for Virginia/Oregon
  AC: Falls back to national content for other visitors
```

**For new form flows:**

```
Slice 1: Form page with Formspree integration
  AC: All required fields have HTML5 validation
  AC: Form action uses site.formspree.[key]
  AC: Success redirects to Formspree thank-you or custom page

Slice 2: Thank-you page
  AC: Custom /thank-you/ page with next-step CTAs
  AC: Links back to resources, newsletter, or home
```

## Anti-Patterns

### WARNING: Scoping a "Complete Onboarding Flow" as One Slice

**The Problem:** Attempting to ship homepage changes + new page + form + email sequence in a single deliverable.

**Why This Breaks:**
1. Cross-surface dependencies create merge conflicts when multiple people work
2. A bug in one component blocks the entire feature from deploying
3. No incremental value — users wait for everything or get nothing

**The Fix:** Each activation touchpoint is its own slice. Homepage CTA, destination page, and form are three separate slices that can ship independently.

### WARNING: Adding Nav Links Before Pages Exist

**The Problem:** Adding a nav link to `nav.njk` for a page that hasn't been built yet.

**Why This Breaks:** Every nav link appears on every page (desktop + mobile = 2 locations). A broken link on the nav is visible site-wide and damages credibility.

**The Fix:** Always scope the destination page as Slice 1, the nav link as part of the same slice or immediately after.
