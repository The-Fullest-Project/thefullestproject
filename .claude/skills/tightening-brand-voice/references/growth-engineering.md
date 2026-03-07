# Growth Engineering Reference

## Contents
- Growth Loops in This Codebase
- Resource Submission Loop
- Newsletter Growth Loop
- Content-Driven SEO Loop
- Community Contribution Voice
- WARNING: Growth Copy That Breaks Trust
- Growth Surface Checklist

## Growth Loops in This Codebase

This project grows through **community contribution and organic search**, not paid acquisition. Three loops exist:

```
1. Resource Submission Loop
   Caregiver finds site → uses directory → submits a resource they know
   → directory grows → more caregivers find site via search

2. Newsletter Loop
   Caregiver visits → subscribes → receives updates → returns to site
   → shares with other caregivers → new visitors subscribe

3. Content SEO Loop
   Blog post ranks for caregiver query → visitor lands on post
   → reads → browses directory → subscribes or submits resource
```

Every growth surface needs brand-aligned copy that motivates action without feeling extractive.

## Resource Submission Loop

This is the highest-leverage growth mechanism. Every submitted resource makes the directory more valuable, which attracts more visitors, who submit more resources.

### The Prompt (Resources Page)

```njk
{# src/pages/resources.njk — bottom CTA #}
<h2 class="text-2xl font-bold mb-4" style="color: var(--color-primary);">
  Know a Resource We're Missing?
</h2>
<p class="mb-6" style="color: var(--color-text-light);">
  Help us grow our directory by submitting resources you know about.
</p>
<a href="/submit-resource/" class="btn-primary no-underline">Submit a Resource</a>
```

**Why this works:**
- "We're Missing" — admits the directory isn't complete (builds trust)
- "Help us grow" — positions the visitor as a community partner
- "resources you know about" — low bar, doesn't demand expertise

### The Form Intro (Submit Page)

```njk
{# src/pages/submit-resource.njk — lead-in #}
<p>Know of a program, service, or organization that supports individuals
   with disabilities? Help us build a more complete directory by sharing
   it below.</p>
```

**Voice rule:** Frame submission as sharing knowledge, not doing data entry. The visitor is a contributor, not a volunteer worker.

### The Blog CTA

```markdown
<!-- src/blog/welcome.md — embedded CTA -->
If you know of a program, service, or organization that supports individuals
with disabilities — [submit it](/submit-resource/). Every resource you add
helps another family find what they need.
```

**Why this works:** "Every resource you add helps another family" — connects the action to a human outcome. This is the growth-copy sweet spot for this brand.

## Newsletter Growth Loop

### Homepage Placement

```njk
{# src/pages/index.njk — newsletter section #}
<section class="section-warm py-16">
  <h2>Stay Connected</h2>
  <p>Get updates on new resources, blog posts, podcast episodes,
     and community news delivered to your inbox.</p>
  <form action="https://formspree.io/f/{{ site.formspree.newsletter }}" method="POST">
    <input type="email" name="email" placeholder="Enter your email" required>
    <button type="submit" class="btn-primary">Subscribe</button>
  </form>
</section>
```

### Footer Placement

```njk
{# src/_includes/components/footer.njk — compact newsletter #}
<h3>Stay Connected</h3>
<p>Get updates on new resources, blog posts, and community news.</p>
<input type="email" placeholder="Your email">
<button class="btn-primary">Subscribe</button>
```

**Growth-voice rule:** The newsletter isn't about "staying informed" — it's about not missing a resource that could help your child. Frame it that way.

### DON'T: Growth-Optimized But Off-Brand

```njk
{# BAD — urgency tactics that feel manipulative for this audience #}
<h2>Don't Miss Out!</h2>
<p>Join 500+ caregivers who already get our exclusive updates.</p>
```

**Why this breaks:** Urgency and FOMO tactics feel predatory when your audience is stressed caregivers. "Exclusive" implies gatekeeping — the opposite of the brand promise.

## Content-Driven SEO Loop

Blog posts and educational pages (therapy guide, school/IEP, adaptive equipment) drive organic search traffic.

### Blog Post Growth Pattern

```markdown
---
title: "Welcome to The Fullest Project"
excerpt: "We're excited to launch The Fullest Project — a centralized hub
         for disability resources, community, and support for caregivers."
---

[Post content with internal links to directory pages]

**Stay Connected:** Sign up for our newsletter to get updates on new resources,
blog posts, and community events.
```

**Growth voice rules for blog posts:**
- Every post must link to at least one resource directory page
- Include a newsletter CTA at the bottom
- Excerpts must be search-friendly (include keywords caregivers search for)

### Educational Page Growth Pattern

```njk
{# End of therapy guide, adaptive equipment, or school/IEP page #}
<div class="mt-12 text-center card p-8">
  <h2>Find Providers Near You</h2>
  <p>Search our resource directory for providers in your area.</p>
  <a href="/resources/?category=therapy" class="btn-primary">Browse Providers</a>
</div>
```

Every educational page should funnel readers to the resource directory — this is how informational traffic converts to engaged users.

## Community Contribution Voice

Growth copy must make contributors feel valued, not used.

### DO: Frame Contribution as Community Partnership

```njk
<p>Help us build a more complete directory by sharing it below.</p>
<p>Every resource you add helps another family find what they need.</p>
```

### DON'T: Frame Contribution as Labor

```njk
{# BAD — feels like the visitor is doing free work #}
<p>Enter the resource details in the form below to add it to our database.</p>
<p>Please fill out all required fields accurately.</p>
```

**Why this breaks:** "Enter details," "fill out fields accurately" — this is instructions for an employee, not an invitation to a community member.

## WARNING: Growth Copy That Breaks Trust

**The Problem:**

```njk
<h2>Join 10,000+ Caregivers</h2>
<p>Be part of the fastest-growing disability resource community.</p>
```

**Why This Breaks:**
1. If the number is fabricated, one skeptical visitor tanks your credibility
2. "Fastest-growing" is an unverifiable superlative
3. Growth metrics mean nothing to a caregiver looking for an OT provider

**The Fix:**

```njk
<h2>Stay Connected</h2>
<p>Get updates on new resources, blog posts, podcast episodes,
   and community news delivered to your inbox.</p>
```

State what the person gets. Not how many other people signed up.

## Growth Surface Checklist

Copy this checklist when auditing growth-facing copy:

- [ ] Resource submission CTA frames the visitor as a community partner
- [ ] "Submit a Resource" button appears on both the resources page and blog posts
- [ ] Newsletter signup lists specific content types (not just "updates")
- [ ] No fabricated numbers or unverifiable superlatives
- [ ] Every educational page ends with a CTA to the resource directory
- [ ] Blog posts include at least one internal link to a directory page
- [ ] Empty states redirect to newsletter signup or related content
- [ ] Growth copy avoids urgency/FOMO tactics (no "Don't miss out")

## Related Skills

- See the **orchestrating-feature-adoption** skill for guiding new visitors through the site
- See the **designing-lifecycle-messages** skill for newsletter email tone
- See the **mapping-user-journeys** skill for understanding caregiver paths through the site
- See the **crafting-page-messaging** skill for writing new CTA and section copy
