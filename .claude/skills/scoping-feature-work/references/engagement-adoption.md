# Engagement & Adoption Scoping

## Contents
- Resource Discovery as Core Engagement
- Cross-Linking Strategy
- Content Engagement Patterns
- Adoption Scope Patterns
- Anti-Patterns

## Resource Discovery as Core Engagement

The resource directory (`/resources/`) is the primary engagement surface. Every feature that improves resource discovery directly increases engagement. Scope these features aggressively.

**Current engagement flow:**

```
Homepage → Feature Card → /resources/ → Filter/Search → Resource Card → External Website
                                                          ↓
                                          /resources/?category=therapy (deep link)
```

**Resource filter is the engagement engine:**

```javascript
// src/js/resourceFilter.js — three filters combine with AND logic
const searchTerm = searchInput.value.toLowerCase();
const locationValue = locationFilter.value;
const categoryValue = categoryFilter.value;

cards.forEach(card => {
  const matchesSearch = name.includes(searchTerm) || description.includes(searchTerm);
  const matchesLocation = !locationValue || card.dataset.location === locationValue;
  const matchesCategory = !categoryValue || categories.includes(categoryValue);
  card.style.display = (matchesSearch && matchesLocation && matchesCategory) ? '' : 'none';
});
```

### Scoping Filter Improvements

```
Feature: "Add disability type filter to resources"

Slice 1 (MVP): Add data attribute to resource cards
  Files: src/pages/resources.njk
  AC: Cards render data-disability="{{ resource.disabilityTypes | join(',') }}"
  AC: No UI change — data is available for future use

Slice 2: Add filter dropdown
  Files: src/pages/resources.njk, src/js/resourceFilter.js
  AC: New dropdown with disability type options
  AC: Combines with existing filters (AND logic)
  AC: URL param support: ?disability=autism

Slice 3: Populate data across resources
  Files: src/_data/resources/**/*.json
  AC: 80%+ of resources have disabilityTypes populated
  AC: Filter returns meaningful results
```

**Why slice this way:** Slice 1 is invisible to users but unblocks Slice 2. Slice 3 is a data quality effort that can happen independently. Never ship a filter dropdown that returns zero results.

## Cross-Linking Strategy

Guide pages (therapy-guide, school-iep, adaptive-equipment) drive engagement by linking to filtered resource views. Every new guide should follow this pattern.

**Current cross-link pattern:**

```nunjucks
{# therapy-guide/index.njk — CTA at bottom of each therapy card #}
<a href="/resources/?category=therapy" class="btn-primary">
  Browse Therapy Providers
</a>

{# adaptive-equipment.njk — dynamic resource rendering #}
{% set equipmentResources = resources.nova | filterByCategory("equipment") %}
{% for resource in equipmentResources %}
  <div class="card">{{ resource.name }}</div>
{% endfor %}
```

**Scoping new guide pages with cross-links:**

```
Slice 1: Static guide content
  AC: Educational content renders correctly
  AC: CTA links to /resources/?category=[relevant]
  AC: Link works and returns results

Slice 2: Inline resource cards
  AC: Pulls matching resources from allResources
  AC: Shows 3-6 resources inline with "View All →" link
  AC: Graceful display if fewer than 3 resources exist
```

### DO: Validate cross-link targets before shipping

```bash
# Before marking a slice as done, verify the filter returns results
npm run build
# Open _site/resources/index.html
# Manually test: /resources/?category=[your-category]
```

### DON'T: Add category CTAs without matching resources

```nunjucks
{# BAD — links to a filter that returns 0 results #}
<a href="/resources/?category=transportation">
  Find Transportation Resources
</a>
{# Unless src/_data/resources/ actually contains transportation entries #}
```

**Why:** An empty filtered view tells the user "we have nothing for you." Either add resources first (data slice) or omit the CTA until data exists.

## Content Engagement Patterns

Blog and podcast content drive return visits. Scope content features to maximize discoverability from existing pages.

**Homepage blog preview pattern:**

```nunjucks
{# index.njk — shows latest 3 posts or empty state #}
{% set latestPosts = collections.blogPosts | limit(3) %}
{% if latestPosts | length > 0 %}
  {% for post in latestPosts %}
    <div class="card p-6">
      <span class="tag">{{ post.data.category }}</span>
      <h3>{{ post.data.title }}</h3>
      <p>{{ post.data.excerpt }}</p>
    </div>
  {% endfor %}
{% else %}
  <div class="card p-6 text-center lg:col-span-3">
    <p>Stories coming soon!</p>
    <a href="/contact/" class="btn-primary mt-4">Share Your Story</a>
  </div>
{% endif %}
```

**Scoping content-driven engagement:**

```
Feature: "Add related resources to blog posts"

Slice 1 (MVP): Manual related resources via front matter
  Files: src/blog/*.md (add relatedCategory field), src/_includes/layouts/post.njk
  AC: Post front matter accepts relatedCategory: "therapy"
  AC: Post template shows 3 resources matching that category
  AC: Falls back gracefully if no relatedCategory specified

Slice 2: Automatic category matching
  Files: src/_includes/layouts/post.njk, .eleventy.js
  AC: If post.data.category maps to a resource category, show resources automatically
  AC: No front matter change needed for matching categories
```

## Adoption Scope Patterns

### Scoping Location Expansion

The project serves Northern Virginia and Portland as pilot locations, with national coverage. New location expansion follows a predictable pattern.

```
Checklist for full location adoption:
- [ ] Slice 1: Create src/_data/resources/states/[ST].json (10+ entries)
- [ ] Slice 1: Verify build passes and resources appear in /resources/
- [ ] Slice 2: Add scraper in scrapers/sources/[state]_resources.py
- [ ] Slice 2: Run scraper locally — output matches schema
- [ ] Slice 3: Add location-specific content to relevant guide pages
- [ ] Slice 3: school-iep gets state-specific resources section
```

### Scoping New Service Features

The services page has three offerings at different maturity levels. Scope features to match maturity.

```
Current service maturity:
- Non-Profit Business Coaching: Live (static content)
- Group Life Coaching: Live (static content)
- Gig Platform: Coming Soon (email capture only)

Feature: "Launch gig platform MVP"

Slice 1: Landing page with waitlist
  AC: Dedicated /services/gig-platform/ page
  AC: Email signup with hidden interest field
  AC: "Coming Soon" badge visible

Slice 2: Provider directory
  AC: New resource category "gig-providers"
  AC: Manual JSON entries for initial providers
  AC: Filterable on /resources/?category=gig-providers

Slice 3: Application form
  AC: Formspree form for provider applications
  AC: Form ID added to site.json
```

## Anti-Patterns

### WARNING: Shipping Filters Without Data

**The Problem:** Adding a new filter dropdown option (e.g., "Transportation") when zero resources have that category.

**Why This Breaks:** Users select the filter, see "0 resources found," and lose trust in the platform. Empty results are worse than a missing filter.

**The Fix:** Always scope data population as Slice 1, UI filter as Slice 2. Validate with `npm run build` and manual testing.

### WARNING: Deep-Linking to Unbuilt Pages

**The Problem:** Adding CTAs or links across the site to pages that aren't built yet (e.g., `/community/`, `/shop/`).

**Why This Breaks:** Every 404 erodes credibility. The footer currently links to `/privacy/` and `/accessibility/` which don't exist — don't add more.

**The Fix:** Scope the destination page as an explicit prerequisite slice. Block CTA slices on page completion.
