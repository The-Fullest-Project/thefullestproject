# Engagement & Adoption Reference

## Contents
- Cross-Linking Strategy
- Contextual CTAs in Content Pages
- Empty State Engagement
- Newsletter Conversion
- WARNING: Anti-Patterns
- Engagement Checklist

---

## Cross-Linking Strategy

The site has 6 major content sections (Resources, Therapy Guide, Equipment, School/IEP, Blog, Podcast) that rarely link to each other beyond the nav. Every content page should drive visitors to the next relevant action.

### Existing Cross-Links (Current State)

The codebase already uses URL parameter cross-linking in two places:

```html
{# src/pages/therapy-guide/index.njk:135 #}
<a href="/resources/?category=therapy" class="btn-primary no-underline">
  Browse Therapy Providers
</a>

{# src/pages/adaptive-equipment.njk — equipment resources CTA #}
<a href="/resources/?category=equipment" class="btn-primary no-underline">
  Browse All Equipment Resources
</a>
```

This pattern works because `resourceFilter.js` reads URL params on load:

```javascript
// src/js/resourceFilter.js:13-25
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('category') && categoryFilter) {
  categoryFilter.value = urlParams.get('category');
}
```

### DO: Add Cross-Links at Natural Decision Points

```html
{# src/pages/school-iep/index.njk — after rights section #}
<div class="card p-6 mt-6" style="background-color: var(--color-warm-light);">
  <p class="text-sm" style="color: var(--color-text-light);">
    <strong>Need an advocate?</strong>
    <a href="/resources/?category=legal" style="color: var(--color-secondary);">
      Browse legal and advocacy resources</a> in our directory.
  </p>
</div>
```

```html
{# src/pages/therapy-guide/index.njk — inside each therapy card #}
<a href="/resources/?category=therapy&location=Virginia"
  class="text-sm font-semibold mt-3 inline-block no-underline"
  style="color: var(--color-secondary);">
  Find OT providers near you &rarr;
</a>
```

### DON'T: Cross-Link to Empty or Thin Content

```html
<!-- BAD — podcast has 0 episodes -->
<p>Listen to our <a href="/podcast/">podcast episode about IEP meetings</a>.</p>
```

**Why this breaks:** Sending users to an empty page destroys trust. Check content availability before linking. Use Eleventy data to conditionally render links:

```nunjucks
{% if collections.podcastEpisodes | length > 0 %}
<a href="/podcast/">Listen to related episodes</a>
{% endif %}
```

See the **eleventy** skill for collection and filter patterns.

---

## Contextual CTAs in Content Pages

Every educational page (Therapy Guide, Equipment, School/IEP) should end with a clear next action, not a dead end.

### The CTA Hierarchy

| Page | Primary CTA | Secondary CTA |
|------|------------|---------------|
| Therapy Guide | Browse Therapy Providers | Submit a Resource |
| Equipment | Browse Equipment Resources | Submit a Resource |
| School/IEP | Browse Education Resources | Contact Us |
| Blog Post | Related Posts (if exist) | Subscribe to Newsletter |
| Resource Directory | Submit a Resource | Share via URL params |

### DO: Reinforce CTA After Long Content

```html
{# Bottom of any educational page — consistent pattern #}
<div class="mt-12 text-center card p-8">
  <h2 class="text-2xl font-bold mb-4" style="color: var(--color-primary);">
    Find Related Resources
  </h2>
  <p class="mb-6" style="color: var(--color-text-light);">
    Search our directory for providers and programs in your area.
  </p>
  <div class="flex flex-col sm:flex-row gap-4 justify-center">
    <a href="/resources/?category=education" class="btn-primary no-underline">
      Browse Resources
    </a>
    <a href="/submit-resource/" class="btn-secondary no-underline">
      Know a Resource?
    </a>
  </div>
</div>
```

### DON'T: Use Vague CTAs

```html
<!-- BAD — "Learn More" tells the user nothing -->
<a href="/about/" class="btn-primary">Learn More</a>

<!-- BAD — "Click Here" is meaningless out of context -->
<a href="/resources/">Click Here</a>
```

**Why this breaks:** Vague CTA text fails screen readers (they navigate by link text) and fails users who scan rather than read. Always describe the destination or action. See the **frontend-design** skill for accessible link patterns.

---

## Empty State Engagement

Three pages currently have empty states: Blog (1 post), Podcast (0 episodes), and Services Shop (coming soon). Empty states are engagement opportunities, not dead ends.

### DO: Convert Empty States to Signup Prompts

```html
{# src/pages/podcast.njk — current empty state, enhanced #}
{% else %}
<div class="card p-8 text-center lg:col-span-2">
  <div class="text-4xl mb-4" aria-hidden="true">&#x1F3A7;</div>
  <h3 class="text-xl font-bold mb-2" style="color: var(--color-primary);">
    Episodes Coming Soon
  </h3>
  <p class="mb-4" style="color: var(--color-text-light);">
    We're recording conversations with families, therapists, and advocates.
    Subscribe to be notified when we launch.
  </p>
  <form action="https://formspree.io/f/{{ site.formspree.newsletter }}" method="POST"
    class="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
    <label for="podcast-email" class="sr-only">Email for podcast launch</label>
    <input type="email" id="podcast-email" name="email" required
      class="form-input flex-grow" placeholder="Your email">
    <input type="hidden" name="_subject" value="Podcast launch notification">
    <button type="submit" class="btn-secondary whitespace-nowrap">Notify Me</button>
  </form>
</div>
{% endfor %}
```

### DON'T: Leave Empty States Passive

```html
<!-- BAD — no action, no hope -->
<p>No episodes yet. Check back later!</p>
```

**Why this breaks:** "Check back later" puts the burden on the user to remember. Capture their email and bring them back. Every empty state should offer at least one of: newsletter signup, related content link, or submission prompt.

---

## Newsletter Conversion

The newsletter form appears in three places: homepage hero section, homepage standalone section, and footer. All use the same Formspree endpoint.

### DO: Differentiate Value Proposition by Context

```html
{# Homepage: broad value prop #}
<p>Get updates on new resources, blog posts, and community news.</p>

{# Resource directory: specific to resources #}
<p>Get notified when new resources are added to our directory.</p>

{# Blog: content-focused #}
<p>New stories and insights delivered to your inbox.</p>
```

Use a hidden field to track which form converted:

```html
<input type="hidden" name="_source" value="resources-page">
```

### DON'T: Show Identical Newsletter CTAs Everywhere

Repeating the exact same copy reduces perceived value. Tailor the message to what the user is currently doing.

---

## WARNING: Anti-Patterns

### WARNING: Engagement Pop-ups on Informational Content

**The Problem:**

```javascript
// BAD — interrupt while reading therapy guide
setTimeout(() => {
  document.getElementById('newsletter-popup').classList.remove('hidden');
}, 10000);
```

**Why This Breaks:**
1. Caregivers reading medical information are in research mode — interruptions erode trust
2. Pop-ups on healthcare-adjacent content feel predatory
3. No dismiss persistence means it reappears every page load

**The Fix:**

Keep newsletter CTAs in the page flow (end-of-content, footer). Use the natural reading endpoint as the conversion moment, not a timer.

### WARNING: Tracking Outbound Resource Links Without Indication

```html
<!-- BAD — stealth tracking -->
<a href="/redirect?url=https://example.org" target="_blank">Visit Website</a>
```

**Why This Breaks:** Users trust that resource links go directly to the resource. Redirecting through an internal tracker breaks that trust and may trigger browser security warnings. If you need click tracking, use `navigator.sendBeacon` on click without modifying the `href`.

---

## Engagement Checklist

Copy this checklist and track progress:

- [ ] Audit every content page for a bottom-of-page CTA
- [ ] Add `?category=` cross-links from Therapy Guide, Equipment, IEP pages
- [ ] Add conditional rendering for cross-links to Blog/Podcast (only if content exists)
- [ ] Enhance all empty states with newsletter signup or related content links
- [ ] Add hidden `_source` fields to distinguish newsletter form locations
- [ ] Verify all CTA text is descriptive (no "Learn More" or "Click Here")
- [ ] Test cross-links with URL params to confirm filter pre-population works
- [ ] Run `npm run build` to verify template logic

See the **orchestrating-feature-adoption** skill for the full adoption flow design.
