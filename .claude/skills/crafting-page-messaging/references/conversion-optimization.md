# Conversion Optimization Reference

## Contents
- Conversion Surfaces in This Codebase
- CTA Hierarchy and Placement
- Form Conversion Patterns
- WARNING: Vague CTA Copy
- WARNING: Missing Confirmation Feedback
- Deep-Link Filtering for Cross-Page Funnels
- Conversion Checklist

## Conversion Surfaces in This Codebase

Every conversion happens through one of these surfaces:

| Surface | File | Conversion Goal |
|---------|------|-----------------|
| Hero CTA | `src/pages/index.njk` (line 18) | Drive to resource directory |
| Newsletter form | `src/pages/index.njk` (line 119) | Email capture |
| Footer newsletter | `src/_includes/components/footer.njk` (line 41) | Email capture (persistent) |
| Submit Resource form | `src/pages/submit-resource.njk` | Community contribution |
| Contact form | `src/pages/contact.njk` | Inbound inquiry |
| Gig platform waitlist | `src/pages/services/index.njk` (line 65) | Interest capture |
| Section CTA cards | Bottom of therapy-guide, adaptive-equipment, school-iep | Funnel to resources |

## CTA Hierarchy and Placement

### DO: One Primary CTA Per Section

```njk
{# src/pages/therapy-guide/index.njk — bottom CTA #}
<div class="mt-12 text-center card p-8">
  <h2 class="text-2xl font-bold mb-4" style="color: var(--color-primary);">Find Therapy Providers</h2>
  <p class="mb-6" style="color: var(--color-text-light);">
    Search our resource directory for therapy providers in your area.
  </p>
  <a href="/resources/?category=therapy" class="btn-primary no-underline">Browse Therapy Providers</a>
</div>
```

The CTA is specific to the page content and deep-links to a filtered view. One action, one button.

### DON'T: Competing CTAs in the Same Section

```njk
{# BAD — forces a choice, reduces clicks on both #}
<a href="/resources/" class="btn-primary no-underline">Browse Resources</a>
<a href="/submit-resource/" class="btn-primary no-underline">Submit a Resource</a>
<a href="/contact/" class="btn-primary no-underline">Contact Us</a>
```

**Why this breaks:** Three equal-weight buttons create decision paralysis. Use one `btn-primary` and demote the rest to `btn-secondary` or text links.

### DO: Primary + Ghost Button Pairing

```njk
{# src/pages/index.njk — hero CTAs #}
<div class="flex flex-col sm:flex-row gap-4 justify-center">
  <a href="/resources/" class="btn-secondary text-lg px-8 py-4 no-underline">Find Resources</a>
  <a href="/about/" class="bg-white/20 hover:bg-white/30 text-white px-8 py-4 rounded-lg
     font-semibold text-lg transition-colors no-underline">Learn More</a>
</div>
```

Primary action gets `btn-secondary` (amber, high contrast on hero). Secondary action gets a ghost style. Visual hierarchy is clear.

## Form Conversion Patterns

### DO: Qualify, Then Ask

```njk
{# src/pages/submit-resource.njk — lead-in #}
<p class="text-center mb-12" style="color: var(--color-text-light);">
  Know of a program, service, or organization that supports individuals
  with disabilities? Help us build a more complete directory by sharing it below.
</p>
```

The question qualifies the visitor (do they know a resource?). The second sentence names the impact (build a more complete directory). This primes commitment.

### DON'T: Jump Straight to Form Fields

```njk
{# BAD — no context, no motivation #}
<h1>Submit a Resource</h1>
<form>
  <input type="text" name="resourceName" placeholder="Name">
  ...
</form>
```

**Why this breaks:** Visitors don't know why they should bother. Conversion drops because there's no stated benefit for their effort.

## WARNING: Vague CTA Copy

**The Problem:**

```njk
<!-- BAD — generic, no specificity -->
<a href="/resources/" class="btn-primary no-underline">Learn More</a>
<a href="/contact/" class="btn-primary no-underline">Click Here</a>
<a href="/submit-resource/" class="btn-primary no-underline">Submit</a>
```

**Why This Breaks:**
1. "Learn More" doesn't say what they'll learn — zero information scent
2. "Click Here" is meaningless to screen readers scanning link text
3. "Submit" without context feels bureaucratic, not empowering

**The Fix:**

```njk
<!-- GOOD — verb + specific noun -->
<a href="/resources/" class="btn-primary no-underline">Browse Resources by State</a>
<a href="/contact/" class="btn-primary no-underline">Send Us a Message</a>
<a href="/submit-resource/" class="btn-primary no-underline">Submit a Resource</a>
```

**When You Might Be Tempted:** When you're unsure of the page's primary action. Fix the information architecture first, then the button text will be obvious.

## WARNING: Missing Confirmation Feedback

**The Problem:** Formspree forms redirect to a generic Formspree "thank you" page by default.

**Why This Breaks:** Visitors lose context — they're off-site, can't navigate back easily, and don't know what happens next.

**The Fix:** Add `_next` hidden field to redirect back to a custom confirmation page, or use Formspree AJAX submission with an inline success message:

```njk
{# Custom redirect after submission #}
<input type="hidden" name="_next" value="https://thefullestproject.org/thank-you/">
```

Or handle inline with vanilla JS (this project uses no framework):

```html
<div id="form-success" class="hidden card p-8 text-center">
  <h2 class="text-2xl font-bold mb-4" style="color: var(--color-primary);">Thank You!</h2>
  <p style="color: var(--color-text-light);">We'll review your submission and add it to our directory.</p>
</div>
```

## Deep-Link Filtering for Cross-Page Funnels

The resource filter reads URL params (`?category=therapy&location=Virginia`). Use this to create high-intent CTAs from educational pages:

```njk
{# From therapy-guide → filtered resource view #}
<a href="/resources/?category=therapy" class="btn-primary no-underline">Browse Therapy Providers</a>

{# From school-iep → filtered to legal/advocacy #}
<a href="/resources/?category=legal" class="btn-primary no-underline">Find IEP Advocates & Law Firms</a>

{# From adaptive-equipment → filtered to equipment #}
<a href="/resources/?category=equipment" class="btn-primary no-underline">Browse All Equipment Resources</a>
```

This pattern is already used across the site. See `src/js/resourceFilter.js` for URL param handling.

## Conversion Checklist

Copy this checklist when auditing a page:

- [ ] Page has exactly one primary CTA (highest visual weight)
- [ ] CTA button text uses verb + specific noun
- [ ] Form pages have qualifying lead-in copy
- [ ] Educational pages end with a CTA card linking to filtered resources
- [ ] Newsletter form appears in both a page section and the footer
- [ ] Empty states (no blog posts, no podcast) include a fallback CTA
- [ ] `btn-primary` (teal) is reserved for the page's primary action
- [ ] `btn-secondary` (amber) is used for secondary or hero-context actions
