# Engagement & Adoption Reference

## Contents
- Feature Discovery Map
- Cross-Linking Patterns
- Return Visit Strategies
- Newsletter as Engagement Loop
- WARNING: Dead-End Pages
- Content Freshness Signals

## Feature Discovery Map

The site has six content sections beyond the resource directory. Visitors who land on the homepage see all six in the "How We Can Help" grid. Visitors who arrive via search or a shared link may never discover them.

| Feature | Entry Points Today | Missing Entry Points |
|---------|-------------------|---------------------|
| Resource Directory | Homepage hero, nav, footer, content page CTAs | Welcome banner, 404 page |
| Therapy Guide | Homepage grid, nav | Resource cards with therapy category |
| Adaptive Equipment | Homepage grid, nav | Resource cards with equipment category |
| School & IEP | Homepage grid, nav | Blog posts about education |
| Blog | Homepage (3 recent), nav, footer | Resource page sidebar |
| Podcast | Nav, footer | Blog posts, about page |
| Submit Resource | Resources page bottom CTA, footer | Thank-you page, 404 page |
| Newsletter | Homepage, footer, services | Every content page bottom |

## Cross-Linking Patterns

### DO: End every content page with a contextual CTA

The therapy guide, equipment, and IEP pages already do this well:

```njk
{# src/pages/therapy-guide/index.njk — existing pattern #}
<div class="text-center mt-12">
  <a href="/resources/?category=therapy" class="btn-primary">
    Browse Therapy Providers
  </a>
</div>
```

Every content page should follow this pattern. The CTA should deep-link to a pre-filtered resource view relevant to the content.

### DO: Cross-link between related content sections

```njk
{# Add to therapy guide page — connect to related content #}
<div class="card mt-8 p-6 bg-teal-50">
  <h3 class="text-lg font-semibold">Related</h3>
  <ul class="mt-2 space-y-1">
    <li><a href="/adaptive-equipment/" class="text-teal-700 underline">Adaptive Equipment Guide</a></li>
    <li><a href="/school-iep/" class="text-teal-700 underline">School & IEP Navigation</a></li>
  </ul>
</div>
```

### DON'T: Rely only on the nav for feature discovery

The nav has 10+ items. On mobile, it's hidden behind a hamburger menu. Visitors in a hurry won't browse the nav — they'll follow the content path in front of them.

## Return Visit Strategies

### DO: Use the newsletter as the primary return mechanism

This static site has no accounts or saved state. The newsletter is the only way to bring visitors back. Ensure signup forms appear:

```njk
{# Bottom of every content page — consistent CTA #}
<section class="section-warm mt-12 py-8 px-6 rounded-lg text-center">
  <h2 class="text-2xl font-bold">Stay Updated</h2>
  <p class="mt-2 text-gray-600">Get notified when we add new resources in your area.</p>
  <form action="https://formspree.io/f/{{ site.formspree.newsletter }}" method="POST" class="mt-4 flex max-w-md mx-auto gap-2">
    <input type="email" name="email" required placeholder="Your email" class="form-input flex-1">
    <button type="submit" class="btn-primary">Subscribe</button>
  </form>
</section>
```

### DO: Leverage deep links for re-engagement

When sending newsletter emails, link directly to filtered resource views rather than the homepage:

```
https://thefullestproject.org/resources/?location=Virginia&category=therapy
```

This drops returning visitors straight into relevant content. See the **javascript** skill for how `resourceFilter.js` reads URL params.

### DON'T: Add "bookmark this page" prompts

Browser bookmarking is a dying behavior. The newsletter is more reliable. Don't waste screen real estate on bookmark CTAs.

## Newsletter as Engagement Loop

The newsletter form exists in three places. Ensure consistency:

| Location | Current Copy | Recommended Improvement |
|----------|-------------|------------------------|
| Homepage | "Stay Connected" | Add: "Join X,XXX caregivers" (when data available) |
| Footer | "Newsletter" | Add: "New resources added weekly" |
| Services | "Get notified at launch" | Good — specific to gig platform |

### DO: Add newsletter to the thank-you page

After a form submission, the visitor is most engaged. The thank-you page should include a newsletter signup:

```njk
{# src/pages/thank-you.njk #}
<div class="text-center py-12">
  <h1 class="text-3xl font-bold text-teal-800">Thank You!</h1>
  <p class="mt-4 text-gray-600">We received your submission and will review it shortly.</p>
  <div class="mt-8 space-x-4">
    <a href="/resources/" class="btn-primary">Browse Resources</a>
    <a href="/" class="btn-secondary">Back to Home</a>
  </div>
  {# Newsletter CTA here #}
</div>
```

## WARNING: Dead-End Pages

**The Problem:** Several pages have no outbound CTA or next step:

- Blog post pages end with just "Back to Blog"
- The about page ends with two CTAs but no newsletter
- Podcast page (when episodes exist) will end abruptly

**Why This Breaks:** Every dead end is a bounce. A visitor who reads a blog post and sees only "Back to Blog" will likely close the tab instead of navigating deeper.

**The Fix:** Add a "What to Do Next" section at the bottom of every content template. See the **nunjucks** skill for layout inheritance patterns.

```njk
{# src/_includes/components/next-steps.njk #}
<section class="mt-12 pt-8 border-t border-gray-200">
  <h2 class="text-xl font-semibold">What to Do Next</h2>
  <div class="mt-4 grid md:grid-cols-3 gap-4">
    <a href="/resources/" class="card p-4 text-center hover:shadow-lg">
      <p class="font-semibold">Find Resources</p>
    </a>
    <a href="/submit-resource/" class="card p-4 text-center hover:shadow-lg">
      <p class="font-semibold">Submit a Resource</p>
    </a>
    <a href="/contact/" class="card p-4 text-center hover:shadow-lg">
      <p class="font-semibold">Get in Touch</p>
    </a>
  </div>
</section>
```

## Content Freshness Signals

### DO: Show "last updated" dates on resource data

```njk
{# On resources page — signal data freshness #}
<p class="text-sm text-gray-500 mt-2">
  Resources last updated: {{ resources.national[0].lastScraped | dateFormat }}
</p>
```

This builds trust. Caregivers need to know the phone numbers and websites are current, not years old.

### DON'T: Show "coming soon" without a timeline or signup

The podcast page says "Episodes coming soon!" but offers no way to be notified when they launch. Always pair "coming soon" with a newsletter signup or notification mechanism.

```njk
{# BAD — existing pattern #}
<p>Episodes coming soon!</p>

{# GOOD — add engagement hook #}
<p>Episodes coming soon!</p>
<form action="https://formspree.io/f/{{ site.formspree.newsletter }}" method="POST" class="mt-4">
  <input type="email" name="email" required placeholder="Notify me" class="form-input">
  <button type="submit" class="btn-primary mt-2">Get Notified</button>
</form>
```
