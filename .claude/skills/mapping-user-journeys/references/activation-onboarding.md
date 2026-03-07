# Activation & Onboarding Reference

## Contents
- First-Visit Entry Points
- Homepage Activation Flow
- Deep-Link Activation from Guides
- Empty State Handling
- Anti-Patterns

## First-Visit Entry Points

New visitors arrive via three paths: direct homepage, search engine to a content page, or shared deep-link to a filtered resource view. The site has no onboarding flow, account creation, or progressive disclosure. Activation means: user finds a relevant resource or submits a form.

### Homepage Entry (Primary)

The homepage is the activation funnel. It presents six section cards that branch users into distinct journeys:

```njk
{# src/pages/index.njk:38-83 - Section card grid #}
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
  <a href="/resources/" class="card p-8 no-underline block">
    <h3 class="text-xl font-bold mb-3" style="color: var(--color-primary);">Resource Directory</h3>
    <p>Find local and national programs...</p>
  </a>
  <a href="/therapy-guide/" class="card p-8 no-underline block">...</a>
  <a href="/adaptive-equipment/" class="card p-8 no-underline block">...</a>
  <a href="/school-iep/" class="card p-8 no-underline block">...</a>
  <a href="/blog/" class="card p-8 no-underline block">...</a>
  <a href="/podcast/" class="card p-8 no-underline block">...</a>
</div>
```

### Coverage Stats as Social Proof

```njk
{# src/pages/index.njk:133-146 - Dynamic resource count drives trust #}
<div class="text-3xl font-extrabold" style="color: var(--color-secondary);">
  {{ allResources | length }}+
</div>
<p class="text-sm">Verified Resources</p>
```

**DO:** Use dynamic `{{ allResources | length }}` to show real data volume.
**DON'T:** Hardcode stats. The resource count updates automatically from the scraper pipeline.

## Deep-Link Activation from Guides

Guide pages (therapy-guide, adaptive-equipment, school-iep) educate users, then activate them by deep-linking into pre-filtered resource views:

```njk
{# src/pages/therapy-guide/index.njk - CTA at bottom #}
<a href="/resources/?category=therapy">Find Therapy Providers</a>

{# src/pages/school-iep/index.njk - CTA at bottom #}
<a href="/resources/?category=legal">Find IEP Advocates & Law Firms</a>

{# src/pages/adaptive-equipment.njk - CTA at bottom #}
<a href="/resources/?category=equipment">Browse All Equipment Resources</a>
```

```javascript
// src/js/resourceFilter.js:23-25 - Receives the category param
if (urlParams.get('category') && categoryFilter) {
  categoryFilter.value = urlParams.get('category');
}
```

**DO:** Use `?category=` and `?location=` URL params for contextual activation.
**DON'T:** Send users to an unfiltered `/resources/` from a specific guide page. That forces them to re-navigate to the category they just read about.

## Empty State Handling

Empty states are the biggest activation killer on this site. Blog and podcast pages show "coming soon" text when collections are empty:

```njk
{# src/pages/blog.njk:30-35 - Empty state #}
{% else %}
<div class="card p-8 text-center">
  <p class="text-lg mb-4">Blog posts coming soon!</p>
  <p>We're working on sharing stories, insights, and practical advice.
     Sign up for our newsletter to be notified when new posts are published.</p>
</div>
{% endfor %}
```

**DO:** Always include a forward-moving CTA in empty states (newsletter signup, contact link).
**DON'T:** Leave empty states as dead ends with no action. The homepage stories section correctly includes a "Share Your Story" CTA:

```njk
{# src/pages/index.njk:107 - Good: empty state with CTA #}
<a href="/contact/" class="btn-primary mt-4 inline-block no-underline">Share Your Story</a>
```

## WARNING: Placeholder Formspree IDs Block Activation

**The Problem:**

```json
// src/_data/site.json:14-18 - Placeholder IDs
"formspree": {
  "contact": "YOUR_FORMSPREE_CONTACT_ID",
  "submitResource": "YOUR_FORMSPREE_RESOURCE_ID",
  "newsletter": "YOUR_FORMSPREE_NEWSLETTER_ID"
}
```

**Why This Breaks:**
1. Every form submission silently fails — users think they submitted but nothing happens
2. Newsletter signups (homepage, footer, gig platform) all go nowhere
3. Contact and resource submission forms are non-functional

**The Fix:** Replace with real Formspree form IDs before any user-facing launch.

## WARNING: Broken Footer Link

**The Problem:**

```njk
{# src/_includes/components/footer.njk:32 #}
<li><a href="/shop/">Shop</a></li>
```

No `/shop/` page exists. The shop content lives at `/services/#shop` conceptually.

**Why This Breaks:** Users clicking "Shop" in the footer hit a 404, which erodes trust immediately.

**The Fix:** Either create a `/shop/` redirect page or change the link to `/services/`.

## Activation Checklist

Copy this checklist and track progress:
- [ ] Replace all placeholder Formspree IDs in `src/_data/site.json`
- [ ] Fix `/shop/` broken link in `footer.njk`
- [ ] Verify all guide page CTAs deep-link with correct `?category=` values
- [ ] Ensure every empty state has a forward-moving CTA
- [ ] Test newsletter form submission end-to-end
