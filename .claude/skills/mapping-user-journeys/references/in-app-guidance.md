# In-App Guidance Reference

## Contents
- Guidance Surfaces in This Project
- Educational Content Patterns
- Contextual CTAs
- Form Guidance
- Anti-Patterns

## Guidance Surfaces in This Project

This static site has no tooltips, modals, or interactive onboarding. All guidance is rendered as static content in Nunjucks templates. Guidance lives in three forms:

1. **Page introductions** — Descriptive text below page titles
2. **Inline educational content** — Therapy types, IEP processes, equipment categories
3. **Contextual CTAs** — Links that bridge from education to action

## Educational Content Patterns

### Therapy Guide: Card-Based Education

Each therapy type is a self-contained card with name, description, and "when beneficial" list:

```njk
{# src/pages/therapy-guide/index.njk - Card pattern #}
<div class="card p-8">
  <h3 class="text-xl font-bold mb-3" style="color: var(--color-primary);">
    Occupational Therapy (OT)
  </h3>
  <p class="mb-4" style="color: var(--color-text-light);">
    Focuses on fine motor skills, sensory processing, and daily self-care...
  </p>
  <h4 class="font-semibold mb-2">When It's Beneficial:</h4>
  <ul class="list-disc list-inside text-sm space-y-1">
    <li>Difficulty with fine motor tasks</li>
    <li>Sensory processing challenges</li>
  </ul>
</div>
```

**DO:** Follow this pattern for all educational content: title, description, actionable details.
**DON'T:** Create educational cards without a forward link. The therapy guide correctly ends with a CTA to filtered resources.

### IEP Guide: Sequential Process Steps

The IEP page uses numbered badges for multi-step processes:

```njk
{# src/pages/school-iep/index.njk - Numbered process step #}
<div class="flex items-start gap-4">
  <div class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
       font-bold text-white" style="background-color: var(--color-primary);">
    1
  </div>
  <div>
    <h4 class="font-bold mb-1">Referral</h4>
    <p class="text-sm">A parent, teacher, or doctor requests an evaluation...</p>
  </div>
</div>
```

**DO:** Use numbered badges for sequential processes. Users skim numbered lists faster than prose.
**DON'T:** Mix numbered and unnumbered items in the same process flow.

### IEP Guide: Side-by-Side Comparison

The IEP vs 504 Plan comparison uses two adjacent cards:

```njk
{# src/pages/school-iep/index.njk - Comparison pattern #}
<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
  <div class="card p-8">
    <h3 class="text-xl font-bold mb-4" style="color: var(--color-primary);">IEP</h3>
    <ul class="space-y-3 text-sm">
      <li>Governed by IDEA federal law</li>
      <li>Requires specialized instruction</li>
    </ul>
  </div>
  <div class="card p-8">
    <h3 class="text-xl font-bold mb-4" style="color: var(--color-secondary);">504 Plan</h3>
    <ul class="space-y-3 text-sm">
      <li>Governed by Section 504</li>
      <li>Provides accommodations only</li>
    </ul>
  </div>
</div>
```

**DO:** Use color differentiation (primary vs secondary) to visually distinguish compared items.

## Contextual CTAs

Every guide page ends with a contextual CTA that deep-links to filtered resources:

| Guide Page | CTA Text | Target |
|-----------|----------|--------|
| Therapy Guide | "Find Therapy Providers" | `/resources/?category=therapy` |
| School & IEP | "Find IEP Advocates & Law Firms" | `/resources/?category=legal` |
| Adaptive Equipment | "Browse All Equipment Resources" | `/resources/?category=equipment` |
| Services (coaching) | "Learn More" | `/contact/?subject=partnership` |

**DO:** Phrase CTAs as actions the user wants to take, not what you offer.
**DON'T:** Use generic "Click Here" or "Learn More" without context.

### WARNING: Missing Contextual Help in Resource Directory

**The Problem:** The resource directory (`src/pages/resources.njk`) has 29 categories in a dropdown but no explanation of what each category contains.

**Why This Breaks:** A caregiver looking for "respite care" may not know the term. One looking for "transition services" may not know it means ages 18-21+.

**The Fix:** Add `title` attributes to category options or a small help icon:

```njk
{# GOOD - Add context to category options #}
<option value="early-intervention">Early Intervention (Ages 0-3)</option>
<option value="transition">Transition Services (Ages 18-21+)</option>
<option value="respite">Respite Care (Temporary Relief for Caregivers)</option>
```

## Form Guidance

The contact form (`contact.njk:26`) uses a subject dropdown with 6 options for routing. The submit-resource form uses descriptive placeholders as inline guidance:

```njk
{# src/pages/submit-resource.njk:72 - Placeholder as guidance #}
<textarea id="resource-description" name="description" rows="4" required
  class="form-input"
  placeholder="What does this resource offer? Who does it serve?">
</textarea>
```

**DO:** Use descriptive placeholder text that tells users what information to provide.
**DON'T:** Use placeholder text as the only label. This form correctly has visible `<label>` elements above each field.

## Guidance Quality Checklist

Copy this checklist and track progress:
- [ ] Every guide page ends with a contextual CTA linking to filtered resources
- [ ] Category dropdowns have descriptive labels (not just slugs)
- [ ] Form fields have both visible labels and helpful placeholder text
- [ ] Sequential processes use numbered badges
- [ ] Comparison content uses side-by-side layout with color differentiation
