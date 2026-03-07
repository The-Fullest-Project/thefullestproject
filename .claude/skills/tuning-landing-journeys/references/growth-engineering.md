# Growth Engineering Reference

## Contents
- Growth Levers in This Project
- Newsletter as Growth Engine
- Community Contribution Loop
- Content-Driven Discovery
- WARNING: Anti-Patterns
- Growth Engineering Checklist

## Growth Levers in This Project

This is a static site with no user accounts, no app store, no paid acquisition. Growth comes from three organic mechanisms:

| Lever | Mechanism | Conversion Point |
|-------|-----------|-----------------|
| Content SEO | Educational pages rank for long-tail caregiver queries | Resource discovery → newsletter signup |
| Community contribution | Caregivers submit resources → directory grows → more search traffic | Submit resource form |
| Newsletter retention | Email brings visitors back for new content/resources | Formspree newsletter capture |

## Newsletter as Growth Engine

Newsletter signup is the only re-engagement channel. It appears in two locations — both feeding the same Formspree endpoint.

### Homepage Mid-Page Placement

```njk
{# src/pages/index.njk — newsletter section #}
<section class="py-16" style="background-color: var(--color-primary);">
  <div class="max-w-4xl mx-auto text-center text-white px-4">
    <h2 class="text-3xl font-bold mb-4">Stay Connected</h2>
    <p class="text-lg mb-8">Get updates on new resources, blog posts, podcast episodes, and community news.</p>
    <form action="https://formspree.io/f/{{ site.formspree.newsletter }}" method="POST"
          class="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
      <input type="email" name="email" placeholder="Your email address" required
             class="form-input flex-grow text-gray-800">
      <button type="submit" class="btn-secondary">Subscribe</button>
    </form>
  </div>
</section>
```

### Footer Secondary Placement

```njk
{# src/_includes/components/footer.njk — newsletter column #}
<div>
  <h3 class="text-lg font-bold mb-4">Stay Connected</h3>
  <p class="text-sm opacity-80 mb-4">Get updates on new resources, blog posts, and community news.</p>
  <form action="https://formspree.io/f/{{ site.formspree.newsletter }}" method="POST">
    <input type="email" name="email" placeholder="Your email" required
           class="form-input w-full text-gray-800 mb-2">
    <button type="submit" class="btn-secondary w-full">Subscribe</button>
  </form>
</div>
```

### WARNING: No Source Attribution on Signups

**The Problem:** Both newsletter forms submit identical data. You cannot tell whether a signup came from the homepage, footer, or services page.

**Why This Breaks:** Without knowing which placement converts, you can't optimize. You might remove a high-performing placement or duplicate a low-performing one.

**The Fix:**

```njk
{# Add a hidden source field to each newsletter form #}
{# Homepage version: #}
<input type="hidden" name="_source" value="homepage-mid">

{# Footer version: #}
<input type="hidden" name="_source" value="footer">

{# Services gig-platform version (already has interest field): #}
<input type="hidden" name="_source" value="services-gig">
```

## Community Contribution Loop

The resource submission flow creates a virtuous cycle:

```
Visitor discovers resource directory
    → Uses resources, finds value
    → Notices "Know a Resource We're Missing?" CTA
    → Submits a resource via /submit-resource/
    → Team reviews and adds to directory
    → Directory grows, ranks for more queries
    → More visitors discover directory
```

### Strengthening the Loop

The submit-resource CTA currently only appears on the resources page. Add it to educational pages where visitors are most likely to know specialized resources:

```njk
{# Add to therapy-guide, adaptive-equipment, school-iep bottom sections #}
<div class="card p-6 text-center mt-8">
  <p class="font-bold" style="color: var(--color-primary);">
    Know a {{ category }} resource we're missing?
  </p>
  <a href="/submit-resource/" class="btn-primary mt-2 inline-block">Submit a Resource</a>
</div>
```

### WARNING: No Feedback After Resource Submission

**The Problem:** After submitting a resource, the visitor is redirected to Formspree's default thank-you page with no next step.

**Why This Breaks:**
1. The contributor has no confirmation their submission will be reviewed
2. No invitation to submit more resources
3. No newsletter capture from a highly engaged user

**The Fix:** Create a `/thank-you-resource/` page:

```njk
---
layout: layouts/page.njk
title: "Thank You!"
permalink: /thank-you-resource/
---
<div class="text-center py-8">
  <h2 class="text-3xl font-bold" style="color: var(--color-primary);">Thank you for contributing!</h2>
  <p class="mt-4">We'll review your submission and add it to the directory.</p>
  <div class="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
    <a href="/resources/" class="btn-secondary">Browse More Resources</a>
    <a href="/submit-resource/" class="btn-primary">Submit Another</a>
  </div>
</div>
```

Add the hidden redirect field to the submit-resource form:

```njk
<input type="hidden" name="_next" value="{{ site.url }}/thank-you-resource/">
```

## Content-Driven Discovery

Blog posts and podcast episodes serve as entry points for organic search. Each content piece should funnel visitors toward resources.

### Blog Post Template Pattern

```markdown
---
layout: layouts/post.njk
title: "Understanding Occupational Therapy for Children"
description: "A parent's guide to OT — what it is, when to seek it, and how to find providers."
date: 2026-03-01
category: therapy
---

[... content ...]

**Ready to find an OT provider?** [Browse therapy providers in our directory](/resources/?category=therapy).
```

Every blog post should end with a contextual CTA linking to a filtered resource view. See the **markdown** skill for front matter conventions.

### Educational Page as SEO Magnet

The therapy guide, adaptive equipment, and school-iep pages are structured for long-form SEO content. Their internal anchor navigation and section depth targets queries like:

- "types of therapy for children with disabilities"
- "IEP vs 504 plan differences"
- "adaptive equipment for daily living"

These pages → filtered resource directory → newsletter signup is the primary organic growth funnel.

## Growth Engineering Checklist

- [ ] Newsletter forms include `_source` hidden field on every placement
- [ ] Submit-resource CTA appears on educational pages (not just resource directory)
- [ ] Resource submission form redirects to a custom thank-you page with next actions
- [ ] Blog posts end with a contextual CTA linking to filtered resources
- [ ] Empty states (blog, podcast) include newsletter signup forms
- [ ] Services page gig-platform signup includes `interest=gig-platform` hidden field
- [ ] Footer newsletter form has `_source=footer` hidden field

See the **designing-lifecycle-messages** skill for what happens after newsletter signup.
See the **orchestrating-feature-adoption** skill for phased feature rollout.
