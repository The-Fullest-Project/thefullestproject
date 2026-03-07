# Activation & Onboarding Reference

## Contents
- First-Visit Discovery Flow
- Empty State Patterns
- Homepage as Activation Surface
- Guide Page Onramps
- WARNING: Dead-End Pages
- WARNING: Missing First-Visit Context
- Activation Checklist

## First-Visit Discovery Flow

This is a static site with no user accounts. "Activation" means a visitor finds a relevant resource, submits a resource, or subscribes to the newsletter. The homepage is the primary onboarding surface — it must funnel visitors into one of three paths:

1. **Resource discovery** → `/resources/` with optional pre-filtering
2. **Education** → therapy guide, equipment, IEP pages
3. **Community engagement** → newsletter signup, submit resource, contact

### Homepage Funnel Structure (Current)

```html
{# src/pages/index.njk — Hero CTAs are the first decision point #}
<div class="flex gap-4">
  <a href="/resources/" class="btn-secondary">Find Resources</a>
  <a href="/about/" class="btn-outline">Learn More</a>
</div>
```

The hero presents two paths. "Find Resources" is the primary activation CTA. The six-card "How We Can Help" grid below acts as a second-chance funnel for visitors who scroll past the hero.

### Six-Card Discovery Grid

```html
{# src/pages/index.njk — Each card links to a content section #}
<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
  <a href="/resources/" class="card p-6 text-center hover:shadow-lg">
    <span class="text-4xl mb-4 block">📍</span>
    <h3 class="text-xl font-bold mb-2">Resource Directory</h3>
    <p class="text-gray-600">Find local and national resources...</p>
  </a>
  {# ... 5 more cards for therapy, equipment, IEP, blog, podcast #}
</div>
```

**DO:** Link each card to the most specific page for that topic. The resource card goes to `/resources/`, therapy goes to `/therapy-guide/`, etc.

**DON'T:** Link all cards to the same generic page. Each card must resolve to distinct, valuable content — otherwise the grid feels like decoration.

## Empty State Patterns

Empty states are critical activation surfaces. When content is sparse, an empty state must do two things: **set expectations** and **offer an alternative action**.

### Current Empty States

```html
{# src/pages/blog.njk — Good: explains what's coming + newsletter CTA #}
{% if collections.blogPosts | length === 0 %}
<div class="text-center py-12">
  <p class="text-lg text-gray-600 mb-4">
    Blog posts coming soon! We're working on sharing stories, insights, and practical advice.
  </p>
  <p class="text-gray-500">Sign up for our newsletter to be notified when new posts are published.</p>
</div>
{% endif %}
```

```html
{# src/pages/podcast.njk — Good: platform badges set expectations #}
{% if collections.podcastEpisodes | length === 0 %}
<div class="text-center py-12">
  <p class="text-lg text-gray-600 mb-4">Episodes coming soon!</p>
  <div class="flex justify-center gap-4 mt-6">
    <span class="px-4 py-2 bg-gray-100 rounded-full text-sm">Coming to Spotify</span>
    <span class="px-4 py-2 bg-gray-100 rounded-full text-sm">Coming to Apple Podcasts</span>
  </div>
</div>
{% endif %}
```

**DO:** Include a concrete next action in every empty state — newsletter signup, contact form link, or resource directory redirect.

**DON'T:** Show a bare "Coming soon!" message with no next step. This is a dead end that bounces visitors.

## Guide Page Onramps

Guide pages (therapy, equipment, IEP) educate visitors, then channel them to the resource directory. This is the primary adoption loop for the site.

```html
{# src/pages/therapy-guide/index.njk — Bottom CTA with pre-filtered link #}
<section class="text-center py-12 bg-gray-50 rounded-lg">
  <h2 class="text-2xl font-bold mb-4">Ready to Find Therapy Providers?</h2>
  <a href="/resources/?category=therapy" class="btn-primary">
    Browse Therapy Resources
  </a>
</section>
```

The `?category=therapy` param is read by `resourceFilter.js` on load, so visitors land on a pre-filtered view immediately. See the **javascript** skill for filter implementation details.

### WARNING: Dead-End Pages

**The Problem:**

```html
{# BAD — guide page with no exit CTA #}
<section class="py-12">
  <h2>Types of Adaptive Equipment</h2>
  {# ... educational content ... #}
</section>
{# Page ends here — visitor has no next step #}
```

**Why This Breaks:**
1. Visitors who read the guide content are the most engaged — losing them at the bottom wastes the highest-intent traffic
2. Without a CTA, the only options are browser back or nav menu — both friction points
3. Every page that doesn't connect to the resource directory or a form is a missed activation

**The Fix:**

```html
{# GOOD — every content section ends with a contextual CTA #}
<section class="text-center py-12">
  <h2 class="text-2xl font-bold mb-4">Find Equipment Resources Near You</h2>
  <a href="/resources/?category=equipment" class="btn-primary">Browse Equipment</a>
  <p class="mt-4 text-gray-500">
    Or <a href="/submit-resource/" class="underline">submit a resource</a> you've found helpful.
  </p>
</section>
```

### WARNING: Missing First-Visit Context

**The Problem:** The resource directory page loads with "All Locations" and "All Categories" selected. First-time visitors see a wall of resources with no guidance on what to do.

**Why This Breaks:** A caregiver in Northern Virginia looking for therapy providers must discover the filter system on their own. If they don't notice the dropdowns, they scroll through every resource and bounce.

**The Fix:** Add a brief instructional banner above the filters on the resource page:

```html
{# Proposed addition to src/pages/resources.njk #}
<div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
  <p class="text-sm text-blue-800">
    <strong>Tip:</strong> Use the filters below to narrow resources by your location and category.
    <a href="/resources/?location=National" class="underline">Start with national resources</a>.
  </p>
</div>
```

## Activation Checklist

Copy this when building or auditing any page:

- [ ] Page has at least one primary CTA above the fold
- [ ] Bottom of page has a contextual CTA (not just footer)
- [ ] Empty states include a next action, not just "coming soon"
- [ ] Guide content links to `/resources/?category=X` with relevant category
- [ ] Newsletter signup is present if the page has educational content
- [ ] Submit-resource nudge appears if the page displays resources
- [ ] Contact links use `?subject=` param for context preservation

See the **designing-onboarding-paths** skill for detailed first-run flow design and the **mapping-user-journeys** skill for page-to-page flow auditing.
