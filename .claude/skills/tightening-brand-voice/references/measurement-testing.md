# Measurement & Testing Reference

## Contents
- What Can Be Measured on a Static Site
- Copy Testing Without Analytics
- Voice Consistency Auditing
- A/B Testing Copy with Static Pages
- Conversion Signal Proxies
- WARNING: Vanity Metrics in Copy
- Measurement Checklist

## What Can Be Measured on a Static Site

This project has **no client-side analytics** in the current codebase. No Google Analytics, no Plausible, no Fathom. Measurement is limited to:

| Signal | Source | What It Tells You |
|--------|--------|-------------------|
| Formspree submission counts | Formspree dashboard | Contact, resource submission, newsletter conversion |
| Search Console impressions | Google Search Console (external) | Which meta descriptions drive clicks |
| Resource submission quality | Manual review of Formspree data | Whether the submit form copy attracts relevant submissions |
| Social share preview quality | OG tag rendering in social platforms | Whether distribution copy is compelling |

### WARNING: Missing Analytics

**Detected:** No analytics library in `package.json` or `base.njk`.

**Impact:** Cannot measure which pages visitors view, where they drop off, or which CTAs get clicked. All copy optimization is currently blind.

**Recommended Action:** Add a privacy-respecting analytics tool. See the **instrumenting-product-metrics** skill for implementation guidance.

## Copy Testing Without Analytics

Until analytics are added, test copy effectiveness through these proxies:

### 1. Formspree Submission Rate

The resource submission form is the highest-value conversion. Track submissions over time after copy changes.

```njk
{# src/pages/resources.njk — the CTA that drives submissions #}
<h2>Know a Resource We're Missing?</h2>
<p>Help us grow our directory by submitting resources you know about.</p>
<a href="/submit-resource/" class="btn-primary">Submit a Resource</a>
```

**Test approach:** Change the CTA copy, deploy, measure Formspree submissions for 2 weeks. Compare to previous 2-week baseline.

### 2. Newsletter Signup Rate

Two signup placements to compare:

```njk
{# Homepage — prominent section with detailed promise #}
<h2>Stay Connected</h2>
<p>Get updates on new resources, blog posts, podcast episodes,
   and community news delivered to your inbox.</p>

{# Footer — compact with abbreviated promise #}
<h3>Stay Connected</h3>
<p>Get updates on new resources, blog posts, and community news.</p>
```

**Test approach:** Use separate Formspree form IDs for homepage vs. footer signups to isolate which placement converts better.

### 3. Search Console Click-Through Rate

Meta descriptions directly affect search CTR. After editing a page's `description`, monitor its CTR in Search Console for 30 days.

```yaml
# Before: generic
description: "About The Fullest Project."
# After: specific + emotional
description: "Meet the founders of The Fullest Project and learn about our mission to support caregivers of individuals with disabilities."
```

## Voice Consistency Auditing

Systematic approach to measuring voice consistency across the site:

```bash
# Find all meta descriptions to audit for voice consistency
grep -rn "description:" src/pages/ src/blog/ --include="*.njk" --include="*.md"
```

### Audit Scoring

For each page, score against these voice criteria (1-3 scale):

| Criterion | 1 (Fails) | 2 (Partial) | 3 (Passes) |
|-----------|-----------|-------------|-------------|
| Empathy | Corporate/detached | Warm but generic | Names the caregiver's specific need |
| Specificity | Vague ("resources") | Somewhat specific | Concrete ("200+ verified resources across 51 locations") |
| Action | Passive ("are available") | Has a verb | Active + specific ("Find therapy providers near you") |
| Terminology | Uses non-canonical terms | Mixed usage | Uses canonical terms consistently |
| Jargon | Unexplained acronyms | Some spelled out | All acronyms explained on first use |

**Target:** Every page scores 2+ on all criteria. Priority fixes on any 1-scores.

## A/B Testing Copy with Static Pages

Without a proper A/B testing tool, use time-based testing:

1. **Baseline period:** Measure Formspree submissions for 2 weeks with current copy
2. **Variant period:** Deploy copy change, measure for 2 weeks
3. **Compare:** If submissions increase >20%, keep the change

```njk
{# Variant A (baseline) — current homepage hero #}
<p>Your connection hub for disability resources, programs, education, and community.</p>

{# Variant B (test) — more specific, problem-aware #}
<p>Stop searching. Start finding. Disability resources for every state,
   verified and organized so you don't have to be.</p>
```

**Limitation:** Low traffic makes small differences undetectable. Only test changes expected to have large impact.

## Conversion Signal Proxies

Without analytics, use these indirect signals:

| Signal | How to Measure | What It Means for Copy |
|--------|---------------|----------------------|
| Formspree submissions/week | Formspree dashboard | Form lead-in copy is working |
| Submission quality | Manual review: are resources relevant? | Submit form copy is attracting the right people |
| Contact form subjects | Formspree data: which dropdown option? | Whether subject options match visitor intent |
| Email replies to newsletter | Manual inbox check | Newsletter copy is engaging |
| Social share count | Manual check on social platforms | Blog/page copy is share-worthy |

## WARNING: Vanity Metrics in Copy

**The Problem:**

```njk
{# Inflated or misleading stats in copy #}
<p class="text-4xl font-extrabold">10,000+ Families Helped</p>
```

**Why This Breaks:**
1. If the number isn't real, it destroys trust the moment a visitor doubts it
2. Caregivers in this space are hypersensitive to organizations overpromising
3. "Families Helped" is unmeasurable — what counts as "helped"?

**The Fix:**

```njk
{# Real, verifiable metrics from data #}
<p class="text-4xl font-extrabold">{{ allResources | length }}+ Verified Resources</p>
<p class="text-4xl font-extrabold">51 Locations Covered</p>
```

Use data-driven numbers from `_data/resources/`. The `allResources` variable is computed in `.eleventy.js` and reflects actual directory size.

## Measurement Checklist

Copy this checklist when setting up measurement for copy changes:

- [ ] Identify which Formspree form the copy change affects
- [ ] Record baseline submission count for 2 weeks before change
- [ ] Deploy copy change and note the date
- [ ] Measure submission count for 2 weeks after change
- [ ] Check Search Console CTR for pages with updated meta descriptions (30 days)
- [ ] Review Formspree submission quality (are submissions relevant?)
- [ ] Document what changed and the result for future reference

## Related Skills

- See the **instrumenting-product-metrics** skill for adding analytics
- See the **mapping-conversion-events** skill for tracking CTA interactions
- See the **crafting-page-messaging** skill for the copy variants to test
