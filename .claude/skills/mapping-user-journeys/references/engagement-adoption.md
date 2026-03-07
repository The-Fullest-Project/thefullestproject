# Engagement & Adoption Reference

## Contents
- Core Engagement Surfaces
- Resource Discovery Flow
- Cross-Page Navigation Patterns
- Newsletter as Re-Engagement Hook
- Anti-Patterns

## Core Engagement Surfaces

This site has four engagement tiers, each with different depth:

| Tier | Surface | Engagement Signal |
|------|---------|-------------------|
| Browse | Resource directory filter/search | Applying filters, scrolling results |
| Learn | Guide pages (therapy, IEP, equipment) | Reading educational content |
| Act | External resource links, phone/tel links | Clicking "Visit Website" or calling |
| Contribute | Submit resource form, contact form | Form submission |

## Resource Discovery Flow

The resource directory (`src/js/resourceFilter.js`) is the primary engagement surface. Three filters — search, location, category — run client-side against `data-*` attributes on resource cards. See the **javascript** skill for the full filter implementation.

**DO:** Keep filter logic client-side for instant feedback on static sites.
**DON'T:** Assume `data-category` matching via `.includes()` is safe — substring matches on comma-separated values cause false positives.

### WARNING: Category Filter Substring Match Bug

**The Problem:**

```javascript
// BAD - substring match on comma-separated string
if (selectedCategory && !categories.includes(selectedCategory)) {
  show = false;
}
```

If a resource has `data-category="community,assistive-tech"`, filtering by `"assist"` would match because `"community,assistive-tech".includes("assist")` is true.

**Why This Breaks:** Currently categories are full slugs so it works by accident, but any future category that is a substring of another (e.g., `"camp"` matching `"camps"`) will produce false positives.

**The Fix:**

```javascript
// GOOD - split and exact match
if (selectedCategory && !categories.split(',').includes(selectedCategory)) {
  show = false;
}
```

## Cross-Page Navigation Patterns

Guide pages drive adoption by educating first, then linking to resources:

```
/therapy-guide/ -> Learn about 8 therapy types -> CTA: /resources/?category=therapy
/school-iep/   -> Understand IEP/504 process  -> CTA: /resources/?category=legal
/adaptive-equipment/ -> Browse equipment types -> CTA: /resources/?category=equipment
```

The services page uses contact form deep-links with subject pre-selection:

```njk
{# src/pages/services/index.njk:31 #}
<a href="/contact/?subject=partnership">Learn More</a>
```

**DO:** Always link guide page CTAs to pre-filtered resource views using URL params.
**DON'T:** Link to generic `/resources/` from contextual pages — this loses user intent.

### WARNING: Contact Subject Pre-Selection Not Implemented

**The Problem:**

```njk
{# services/index.njk links with ?subject=partnership #}
<a href="/contact/?subject=partnership">Learn More</a>
```

But `contact.njk` has no JavaScript to read `?subject=` from the URL and pre-select the dropdown.

**Why This Breaks:** Users click "Learn More" from a specific service expecting context to carry over. Instead they see the default "General Inquiry" subject.

**The Fix:** Add URL param reading to contact.njk:

```html
<script>
document.addEventListener('DOMContentLoaded', function() {
  const params = new URLSearchParams(window.location.search);
  const subject = params.get('subject');
  if (subject) {
    const select = document.getElementById('subject');
    if (select) select.value = subject;
  }
});
</script>
```

## Newsletter as Re-Engagement Hook

The newsletter form appears in three locations: homepage (`index.njk:119`), footer (`footer.njk:41`), and gig platform card (`services/index.njk:65`).

```njk
{# services/index.njk:65-70 - Best practice: hidden field for segmentation #}
<form action="https://formspree.io/f/{{ site.formspree.newsletter }}" method="POST">
  <input type="hidden" name="interest" value="gig-platform">
  <input type="email" name="email" placeholder="Get notified at launch">
  <button type="submit" class="btn-secondary text-sm">Notify Me</button>
</form>
```

**DO:** Use hidden fields like `name="interest" value="gig-platform"` to segment subscribers.
**DON'T:** Use the same generic form everywhere without differentiation — you lose segmentation data.

## Adoption Audit Checklist

Copy this checklist and track progress:
- [ ] Test resource filter with all 29 categories to verify no false-positive matches
- [ ] Verify `?subject=` param works on contact page (it doesn't currently — needs fix)
- [ ] Confirm newsletter forms have distinct hidden fields for segmentation
- [ ] Check that all guide pages end with a contextual CTA (not generic)
- [ ] Verify "Visit Website" links on resource cards open in new tabs (`target="_blank"`)
