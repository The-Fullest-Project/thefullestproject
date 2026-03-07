# Growth Engineering Reference

## Contents
- Growth Loops in This Project
- Resource Submission Loop
- Newsletter Flywheel
- WARNING: No Referral or Sharing Mechanics
- Scraper Pipeline as Growth Engine
- Progressive Engagement Ladder

## Growth Loops in This Project

This project has two natural growth loops — both are partially built:

```
Loop 1: Resource Submission
  Caregiver finds site → Uses resources → Knows one we're missing
  → Submits resource → Directory grows → More caregivers find site

Loop 2: Content + Newsletter
  Caregiver lands on blog/guide → Subscribes to newsletter
  → Receives new content → Shares with caregiver network → New visitors
```

**Neither loop has instrumentation.** You cannot measure loop velocity, drop-off points, or contribution rates without analytics.

## Resource Submission Loop

The resource submission form (`src/pages/submit-resource.njk`) is the site's primary user-generated content mechanism.

### Current entry points to the submission form:

```html
{# 1. Resources page bottom card — src/pages/resources.njk:107 #}
<a href="/submit-resource/" class="btn-primary">Submit a Resource</a>

{# 2. Footer link — src/_includes/components/footer.njk:29 #}
<a href="/submit-resource/">Submit a Resource</a>

{# 3. Contact form subject option — src/pages/contact.njk:25 #}
<option value="resource">Resource Suggestion</option>
```

### DO: Prompt submission after resource consumption

The best time to ask for a contribution is right after the user received value. Add a submission prompt to individual resource cards or after filter results:

```html
{# After resource grid in resources.njk #}
<div class="card text-center mt-8" id="submit-prompt">
  <p class="text-lg font-semibold mb-2">Found what you needed?</p>
  <p class="text-gray-600 mb-4">
    Help other caregivers by sharing a resource you know about.
  </p>
  <a href="/submit-resource/" class="btn-primary" data-cta="post-browse-submit">
    Submit a Resource
  </a>
</div>
```

### DON'T: Gate resource browsing behind signup

```html
{# BAD — caregivers need resources NOW, not friction #}
<div class="overlay">Sign up to view resources</div>
```

**Why:** This audience is under stress. Gating resources destroys trust and contradicts the mission. Growth comes from value delivered, not value withheld.

## Newsletter Flywheel

Current newsletter touchpoints:

| Placement | File | Conversion Friction |
|-----------|------|-------------------|
| Homepage section | `src/pages/index.njk:115` | Low (single field) |
| Footer (every page) | `src/_includes/components/footer.njk:37` | Low (single field) |
| Gig platform notify | `src/pages/services/index.njk:65` | Low (single field + hidden tag) |

### Missing touchpoints that drive newsletter growth:

```html
{# 1. After blog posts — src/_includes/layouts/post.njk #}
<aside class="card mt-12 p-6">
  <h3 class="font-bold text-lg">Enjoyed this post?</h3>
  <p class="text-gray-600 mb-4">Get new resources and stories weekly.</p>
  <form action="https://formspree.io/f/{{ site.formspree.newsletter }}" method="POST"
        data-form-type="newsletter-post">
    <input type="hidden" name="_source" value="blog-post">
    <input type="email" name="email" placeholder="Your email" required class="form-input">
    <button type="submit" class="btn-secondary mt-2">Subscribe</button>
  </form>
</aside>

{# 2. On thank-you page — after any form submission #}
<p>While you're here, stay in the loop:</p>
<form action="https://formspree.io/f/{{ site.formspree.newsletter }}" method="POST"
      data-form-type="newsletter-thankyou">
  <input type="hidden" name="_source" value="thank-you">
  <input type="email" name="email" placeholder="Your email" required class="form-input">
  <button type="submit" class="btn-secondary">Subscribe</button>
</form>
```

## WARNING: No Referral or Sharing Mechanics

**The Problem:** No way for users to share resources, pages, or the site with other caregivers. No share buttons, no "email this to a friend", no referral program.

**Why This Matters:** Caregiver communities are tight-knit. Word of mouth is the #1 discovery channel for disability resources. The site has zero infrastructure to facilitate this.

**Minimum Viable Fix — share links on resource cards:**

```html
{# Add to resource card template #}
<a href="mailto:?subject=Helpful resource&body=Check out {{ resource.name }}: {{ site.url }}/resources/"
   class="text-sm text-gray-500 hover:text-gray-700" aria-label="Share via email">
  Share
</a>
```

**Better Fix — native share API:**

```javascript
// src/js/main.js
document.querySelectorAll('[data-share]').forEach(btn => {
  btn.addEventListener('click', async function() {
    const data = { title: this.dataset.shareTitle, url: this.dataset.shareUrl };
    if (navigator.share) {
      await navigator.share(data);
    } else {
      await navigator.clipboard.writeText(data.url);
      this.textContent = 'Link copied!';
    }
  });
});
```

## Scraper Pipeline as Growth Engine

The weekly scraper pipeline (`scrapers/run_all.py`) is a growth mechanism: fresh data = fresh pages = more search surface area.

```
Scraper runs → New resources added → Site rebuilds
→ New pages indexed → More long-tail search traffic → More visitors
```

### DO: Track resource count growth over time

Add a build-time timestamp to track pipeline health:

```javascript
// .eleventy.js — add a global data value
eleventyConfig.addGlobalData("buildTime", () => new Date().toISOString());
```

### DO: Maximize scraper coverage

Each new scraper source in `scrapers/sources/` expands the resource directory. More resources = more category/location combinations = more search surface. See the **python** skill for scraper patterns.

## Progressive Engagement Ladder

Map users from anonymous visitor to active contributor:

```
1. Anonymous visitor    → Browse resources (no account needed)
2. Newsletter subscriber → Provide email (low friction)
3. Contact form user    → Ask a question or share feedback
4. Resource contributor → Submit a resource (medium friction)
5. Service customer     → Coaching or gig platform (future)
```

### DO: Track progression through the ladder

```javascript
// Event taxonomy for engagement ladder
gtag('event', 'ladder_step', { step: 'browse', page: window.location.pathname });
gtag('event', 'ladder_step', { step: 'subscribe' });
gtag('event', 'ladder_step', { step: 'contact' });
gtag('event', 'ladder_step', { step: 'submit_resource' });
```

### DON'T: Skip ladder steps

```html
{# BAD — asking a first-time visitor to submit a resource immediately #}
<div class="hero-overlay">
  <h2>Submit a Resource!</h2>
</div>
```

**Why:** Users need to receive value before they'll contribute value. The resource directory must deliver first.

See the **designing-onboarding-paths** skill for structuring new visitor experiences and the **orchestrating-feature-adoption** skill for progressive feature introduction.
