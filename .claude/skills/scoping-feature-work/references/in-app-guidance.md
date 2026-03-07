# In-App Guidance Scoping

## Contents
- Guide Page Patterns
- In-Page Navigation
- Contextual Help Patterns
- CTA Placement Strategy
- Anti-Patterns

## Guide Page Patterns

The project has three established guide pages that serve as templates for scoping new educational content. Each follows a consistent pattern.

**Existing guide pages:**

| Page | Path | Pattern |
|------|------|---------|
| Therapy Guide | /therapy-guide/ | Card grid with descriptions + "when beneficial" lists |
| School & IEP | /school-iep/ | Anchor nav + comparison tables + step timeline |
| Adaptive Equipment | /adaptive-equipment/ | Category cards + dynamic resource integration |

**Scoping a new guide page:**

```
Feature: "Add transition planning guide (youth → adult services)"

Slice 1 (MVP): Static educational content
  Files: src/pages/transition-planning/index.njk
  AC: Front matter: layout, title, description, permalink
  AC: 5-8 content sections covering key transition topics
  AC: Styled with existing .card, .tag classes
  AC: CTA: "Find Transition Resources" → /resources/?category=transition
  AC: Nav link added to nav.njk (desktop + mobile menus)

Slice 2: In-page anchor navigation
  Files: src/pages/transition-planning/index.njk
  AC: Sticky or top-anchored nav for 5+ sections
  AC: Smooth scroll to section anchors
  AC: Follows school-iep pattern

Slice 3: Dynamic resource integration
  Files: src/pages/transition-planning/index.njk
  AC: Pulls resources with category "transition" from allResources
  AC: Shows inline cards for relevant resources
  AC: "View All" link to filtered /resources/ view
```

**Template for guide page front matter:**

```yaml
---
layout: layouts/page.njk
title: "Transition Planning Guide"
description: "Navigate the transition from school-age services to adult disability services."
permalink: /transition-planning/
---
```

## In-Page Navigation

The school-iep page demonstrates the in-page navigation pattern. Use this when a guide has 5+ sections.

**Current implementation (school-iep):**

```nunjucks
{# Anchor navigation at top of page #}
<nav class="card p-6 mb-8" aria-label="Page sections">
  <h2 class="text-lg font-semibold mb-3">Quick Navigation</h2>
  <div class="flex flex-wrap gap-3">
    <a href="#iep-504" class="tag hover:opacity-80">IEP vs. 504</a>
    <a href="#parent-rights" class="tag hover:opacity-80">Parent Rights</a>
    <a href="#iep-process" class="tag hover:opacity-80">IEP Process</a>
    <a href="#advocacy-tips" class="tag hover:opacity-80">Advocacy Tips</a>
    <a href="#state-resources" class="tag hover:opacity-80">State Resources</a>
  </div>
</nav>

{# Section targets #}
<section id="iep-504" class="mb-12">
  <h2>IEP vs. 504 Plans</h2>
  {# Content #}
</section>
```

**Scoping in-page nav for new guides:**

```
Acceptance criteria for in-page navigation:
- [ ] Nav wrapped in <nav> with aria-label="Page sections"
- [ ] Uses .tag class for consistent pill styling
- [ ] Each anchor matches a section id (kebab-case)
- [ ] Scroll targets have sufficient top margin for fixed headers
- [ ] Works on mobile (flex-wrap handles narrow screens)
```

### DO: Scope anchor nav as part of the page slice

If the page has 5+ sections from the start, include the anchor nav in Slice 1. It's cheap to add and dramatically improves usability.

### DON'T: Add anchor nav to pages with 3 or fewer sections

Short pages don't need internal navigation. It adds visual clutter without value. Only scope this when section count justifies it.

## Contextual Help Patterns

Contextual help surfaces relevant information where users need it, without requiring navigation away from their current task.

**Current pattern — inline resource cards on guide pages:**

```nunjucks
{# adaptive-equipment.njk — shows equipment loaner programs inline #}
{% set equipmentResources = resources.nova | filterByCategory("equipment") %}
{% if equipmentResources | length > 0 %}
  <div class="grid md:grid-cols-2 gap-6 mt-6">
    {% for resource in equipmentResources %}
      <div class="card p-6">
        <h3 class="text-lg font-semibold">{{ resource.name }}</h3>
        <p class="text-gray-600 mt-2">{{ resource.description }}</p>
        {% if resource.website %}
          <a href="{{ resource.website }}" class="text-teal-700 hover:underline mt-3 inline-block">
            Learn More &rarr;
          </a>
        {% endif %}
      </div>
    {% endfor %}
  </div>
{% endif %}
```

**Scoping inline contextual help:**

```
Feature: "Show relevant resources on therapy guide page"

Slice 1 (MVP): Static CTA links
  AC: Each therapy card has "Find [Therapy] Providers" link
  AC: Links to /resources/?category=therapy (pre-filtered)

Slice 2: Inline resource previews
  AC: Each therapy section shows 2-3 matching resources
  AC: Uses filterByCategory filter from .eleventy.js
  AC: "View All →" links to full filtered view
  AC: Graceful empty state: shows CTA instead of blank space
```

### Scoping Comparison Tables

The school-iep page uses comparison tables for IEP vs. 504 plans. This pattern works for any "which option is right for me?" guidance.

```nunjucks
{# Responsive comparison table pattern #}
<div class="overflow-x-auto">
  <table class="w-full border-collapse">
    <thead>
      <tr class="bg-gray-50">
        <th class="p-4 text-left">Feature</th>
        <th class="p-4 text-left">Option A</th>
        <th class="p-4 text-left">Option B</th>
      </tr>
    </thead>
    <tbody>
      <tr class="border-t">
        <td class="p-4 font-medium">Eligibility</td>
        <td class="p-4">Criteria A</td>
        <td class="p-4">Criteria B</td>
      </tr>
    </tbody>
  </table>
</div>
```

**Scoping acceptance criteria for comparison tables:**

```
- [ ] Table is wrapped in overflow-x-auto for mobile
- [ ] Header row uses bg-gray-50 for visual distinction
- [ ] Content cells have consistent p-4 padding
- [ ] First column is font-medium for row labels
- [ ] Accessible: uses proper <thead>, <tbody>, <th> elements
```

## CTA Placement Strategy

CTAs follow a predictable placement pattern. Scope CTA additions as part of the page slice, not as separate slices (they're too small to stand alone).

**CTA placement rules:**

| Location | CTA Type | Example |
|----------|----------|---------|
| Section end | Deep link to resources | "Browse Therapy Providers →" |
| Page bottom | Primary action | "Submit a Resource" or "Contact Us" |
| Empty state | Newsletter signup | "Sign up to be notified" |
| Guide page | Related resources link | "Find IEP Advocates →" |

**CTA markup pattern:**

```nunjucks
{# Primary CTA — use at page/section bottom #}
<div class="text-center mt-8">
  <a href="/resources/?category=therapy" class="btn-primary">
    Browse Therapy Providers
  </a>
</div>

{# Secondary CTA — use for alternative actions #}
<a href="/submit-resource/" class="btn-secondary">
  Know a resource we're missing? Submit it here
</a>
```

## Anti-Patterns

### WARNING: Scoping Guidance Without a Resource Destination

**The Problem:** Building an educational guide page that explains a topic but doesn't link to relevant resources.

**Why This Breaks:** The guide creates awareness but provides no next step. Users learn about therapy types but can't find therapists. Engagement drops off at the moment of highest intent.

**The Fix:** Every guide page slice must include at least one CTA linking to `/resources/?category=[relevant]`. Validate that the filter returns results before shipping.

### WARNING: Over-Scoping In-Page Interactivity

**The Problem:** Scoping accordion toggles, tab panels, or modal dialogs for guide content.

**Why This Breaks:** The project uses vanilla JS with minimal client-side code (13-line nav toggle, ~60-line filter). Adding interactive UI components requires new JS, new accessibility patterns (focus trapping, keyboard nav), and testing across devices. The scope explodes.

**The Fix:** Use static content with anchor navigation. The school-iep page proves this works for even complex, multi-section guides. If interactivity is truly needed, scope it as a dedicated slice with its own acceptance criteria for accessibility. See the **javascript** skill for implementation patterns.
