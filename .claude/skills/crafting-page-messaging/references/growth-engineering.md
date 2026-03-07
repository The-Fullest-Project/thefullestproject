# Growth Engineering Reference

## Contents
- Growth Loops in This Project
- Resource Submission Loop
- Newsletter → Content → Share Loop
- Deep-Link Funnels as Growth Levers
- WARNING: No Share Mechanics
- WARNING: No Referral Path from Resource Pages
- Community Equipment Exchange as Growth Vector
- Growth Engineering Checklist

## Growth Loops in This Project

This is a non-profit static site, not a SaaS product. Growth means **more caregivers finding and using the resource directory**, not revenue. The primary growth loops are:

| Loop | Mechanism | Status |
|------|-----------|--------|
| Caregiver finds resource → shares with another caregiver | Word-of-mouth | No share UI exists |
| Caregiver submits resource → directory grows → more caregivers find value | Crowdsourcing | Active (submit-resource form) |
| Newsletter subscriber → reads blog/podcast → shares link | Content distribution | Placeholder (no content yet) |
| Educational page (therapy guide, IEP) → resource directory | Internal funnel | Active (deep-link CTAs) |
| Scraper runs → new resources added → pages indexed by search | Automated content | Active (weekly GitHub Action) |

## Resource Submission Loop

The strongest growth loop: caregivers submit resources, which makes the directory more valuable, which attracts more caregivers.

### Current Implementation

```njk
{# src/pages/resources.njk — bottom CTA #}
<div class="mt-12 text-center card p-8">
  <h2 class="text-2xl font-bold mb-4" style="color: var(--color-primary);">
    Know a Resource We're Missing?
  </h2>
  <p class="mb-6" style="color: var(--color-text-light);">
    Help us grow our directory by submitting resources you know about.
  </p>
  <a href="/submit-resource/" class="btn-primary no-underline">Submit a Resource</a>
</div>
```

### DO: Reinforce the Loop After Submission

After a resource is submitted, the confirmation message should encourage the submitter to share the directory:

```html
<div id="submit-success" class="card p-8 text-center">
  <h2 class="text-2xl font-bold mb-4" style="color: var(--color-primary);">Thank You!</h2>
  <p class="mb-6" style="color: var(--color-text-light);">
    We'll review your submission and add it to our directory.
    Know a caregiver who could use this resource?
  </p>
  <a href="/resources/" class="btn-primary no-underline">Share the Directory</a>
</div>
```

### DON'T: Dead-End After Submission

```html
{# BAD — no next step, loop dies #}
<p>Thanks for submitting!</p>
```

## Newsletter → Content → Share Loop

The newsletter captures emails; blog and podcast content gives subscribers a reason to return and share.

### Current Newsletter Copy

```njk
{# src/pages/index.njk — newsletter section #}
<h2 class="text-3xl font-bold mb-4">Stay Connected</h2>
<p class="mb-8 opacity-90">
  Get updates on new resources, blog posts, podcast episodes,
  and community news delivered to your inbox.
</p>
```

This works as a value prop, but the loop breaks because there's no blog or podcast content yet. Prioritize publishing one blog post to activate this loop.

### DO: Specific Value in Newsletter CTA

```njk
<p class="mb-8 opacity-90">
  New resources added weekly. Get notified when we add providers in your area.
</p>
```

### DON'T: Generic "Stay Updated"

```njk
{# BAD — no reason to subscribe #}
<p>Sign up for our newsletter.</p>
```

## Deep-Link Funnels as Growth Levers

Educational pages drive visitors to the resource directory via filtered links. This is a growth lever because it increases the perceived value of the directory (visitors see relevant results immediately, not a wall of cards).

```njk
{# Each educational page has a targeted exit CTA #}

{# therapy-guide → therapy providers #}
<a href="/resources/?category=therapy">Browse Therapy Providers</a>

{# school-iep → legal advocates #}
<a href="/resources/?category=legal">Find IEP Advocates & Law Firms</a>

{# adaptive-equipment → equipment resources #}
<a href="/resources/?category=equipment">Browse All Equipment Resources</a>
```

To maximize this lever: every new educational page should end with a filtered deep-link CTA to the resource directory.

## WARNING: No Share Mechanics

**The Problem:** No page includes share buttons, copy-link functionality, or any mechanism for visitors to share content with other caregivers.

**Why This Breaks:**
1. Caregivers frequently share resources in Facebook groups, WhatsApp chats, and email threads
2. Without a share mechanism, the visitor has to manually copy the URL
3. The biggest growth opportunity (peer-to-peer sharing) has maximum friction

**The Fix:** Add lightweight share links (no JS library needed):

```njk
{# Share section for resource directory or blog posts #}
<div class="flex gap-4 items-center">
  <span class="text-sm font-semibold" style="color: var(--color-text-light);">Share:</span>
  <a href="mailto:?subject=Disability Resources&body=Check out this resource directory: {{ site.url }}/resources/"
     class="text-sm no-underline" style="color: var(--color-accent);">Email</a>
  <a href="https://www.facebook.com/sharer/sharer.php?u={{ site.url }}{{ page.url }}"
     target="_blank" rel="noopener noreferrer"
     class="text-sm no-underline" style="color: var(--color-accent);">Facebook</a>
</div>
```

No external JS required. These are standard share URLs that work everywhere.

## WARNING: No Referral Path from Resource Pages

**The Problem:** Individual resource cards in `src/pages/resources.njk` link out to external websites but offer no way for the visitor to bookmark, share, or save resources.

**Why This Breaks:** A visitor finds a useful resource, clicks "Visit Website", and leaves the site forever. There is no re-engagement mechanism.

**The Fix:** Add a "Share this resource" or "Save for later" prompt. Even a simple "Email this to yourself" CTA works:

```njk
{# Inside resource card #}
<a href="mailto:?subject={{ resource.name | urlencode }}&body={{ resource.description | urlencode }}%0A{{ resource.website }}"
   class="text-xs no-underline" style="color: var(--color-accent);">
  Email to myself
</a>
```

## Community Equipment Exchange as Growth Vector

The adaptive equipment page has a "Buy Nothing" style community exchange CTA:

```njk
{# src/pages/adaptive-equipment.njk #}
<h2 class="text-2xl font-bold mb-4" style="color: var(--color-primary);">
  Community Equipment Exchange
</h2>
<p class="mb-6 max-w-2xl mx-auto" style="color: var(--color-text-light);">
  Join our "Buy Nothing" style community group for special needs equipment.
  Give away equipment your child has outgrown and find what you need from other families.
</p>
<a href="/contact/" class="btn-primary no-underline">Join the Community</a>
```

This is a high-potential growth loop: equipment exchange creates reciprocal value (givers and receivers both benefit), which drives repeat visits and word-of-mouth referrals.

## Growth Engineering Checklist

Copy this checklist when building or auditing growth loops:

- [ ] Resource submission CTA appears on the resource directory page
- [ ] Post-submission confirmation encourages sharing the directory
- [ ] Educational pages end with filtered deep-link CTAs to resources
- [ ] Newsletter copy states specific value (not generic "stay updated")
- [ ] Share mechanics exist on high-value pages (resources, blog posts)
- [ ] Resource cards include a re-engagement mechanism (email to self, save)
- [ ] Empty states (blog, podcast) include newsletter CTA as a fallback
- [ ] Gig platform waitlist captures interest with a hidden field for segmentation

See the **orchestrating-feature-adoption** skill for engagement patterns. See the **designing-lifecycle-messages** skill for nurture sequences after signup.
