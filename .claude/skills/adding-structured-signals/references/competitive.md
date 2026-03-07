# Competitive Reference: Rich Result Opportunities for Caregiver Resource Sites

## Contents
- Rich Result Landscape for Disability Resources
- High-Value Schema Types for This Niche
- Competitor Structured Data Gaps
- Resource Directory Differentiation
- FAQ Rich Results Strategy
- WARNING: Schema Spam
- Local vs National Coverage Signals
- Implementation Priority Matrix

## Rich Result Landscape for Disability Resources

Most caregiver and disability resource sites do NOT implement structured data. This is a significant competitive advantage. The top types that generate visible SERP features for this content niche:

| Rich Result | Schema Type | SERP Feature | Competitive Density |
|-------------|------------|--------------|-------------------|
| FAQ dropdowns | FAQPage | Expanded answers below listing | Low — most guide sites skip this |
| Article cards | BlogPosting | Enhanced snippet with date/author | Medium — larger orgs do this |
| Breadcrumbs | BreadcrumbList | Path shown in SERP | Medium |
| Organization | Organization | Knowledge panel sidebar | Low for small orgs |
| Sitelinks | WebSite | Sub-links under main result | Medium |

## High-Value Schema Types for This Niche

**FAQPage is the highest-ROI type** for The Fullest Project. The therapy guide and school/IEP guide pages contain Q&A-formatted content that Google will render as expandable FAQ dropdowns directly in search results. This is extremely rare among disability resource sites.

**ItemList for the resource directory** can trigger carousel results for queries like "disability resources [state name]". Most competitor directories render flat HTML with no structured markup.

**BlogPosting with proper author markup** builds E-E-A-T signals. The founders have verifiable expertise (OT doctorate, executive coaching) — schema.org Person entities with `jobTitle` reinforce this.

## Competitor Structured Data Gaps

Typical disability resource sites (211.org, state-specific directories, nonprofit hubs):

1. **No JSON-LD at all** — most use no structured data
2. **Generic WebPage only** — some add minimal WebPage schema
3. **No FAQ markup** — despite having Q&A content
4. **No ItemList** — resource directories are just HTML tables or cards
5. **No Person/Author markup** — miss E-E-A-T signals entirely

The Fullest Project can outperform larger sites in rich results simply by implementing proper structured data on existing content.

## Resource Directory Differentiation

The resource directory page with `ItemList` schema creates a unique SERP presence. Structure the schema to highlight:

```html
<!-- Emphasize coverage breadth in ItemList -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Disability Resource Directory — All 50 States",
  "description": "{{ allResources | length }}+ verified resources across all 50 US states and DC.",
  "numberOfItems": {{ allResources | length }}
}
</script>
```

The `numberOfItems` count (visible in some SERP previews) signals authority over smaller directories.

## FAQ Rich Results Strategy

The therapy guide and school/IEP pages should target these high-volume caregiver queries:

**Therapy Guide targets:**
- "what is occupational therapy for children"
- "types of therapy for special needs"
- "ABA therapy explained"
- "when does a child need speech therapy"

**School/IEP Guide targets:**
- "what is an IEP"
- "IEP vs 504 plan"
- "how to request an IEP evaluation"
- "parents rights in IEP process"

Each FAQ question in the schema should match a real question caregivers search for. The answer text should be concise (2-3 sentences) in the schema, with the full answer on the visible page.

See the **crafting-page-messaging** skill for aligning page copy with search intent.

### WARNING: Schema Spam

**The Problem:**

```json
// BAD - FAQ schema with questions not visible on the page
{
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "Best disability resources near me?" },
    { "@type": "Question", "name": "Free therapy for special needs children?" }
  ]
}
```

**Why This Breaks:**
1. Google requires FAQ schema to match visible on-page content word-for-word
2. Invisible FAQ schema triggers a manual action (penalty) in Search Console
3. The penalty can suppress the ENTIRE site from search results, not just the offending page

**The Fix:**

Every Question in FAQPage schema MUST have a corresponding visible heading or question on the page. Build the schema FROM the page content, never the reverse.

**When You Might Be Tempted:** When trying to rank for more keywords by adding extra FAQ items that aren't on the page.

## Local vs National Coverage Signals

The site serves all 50 states plus national resources. Structure data to signal geographic breadth:

For the Organization schema, use `areaServed` with the full US:

```json
{
  "areaServed": {
    "@type": "Country",
    "name": "United States"
  }
}
```

For location-specific resource pages (if created in the future), use state-level `areaServed`:

```json
{
  "areaServed": {
    "@type": "State",
    "name": "Virginia"
  }
}
```

This helps Google match the site to both "disability resources" (national) and "disability resources Virginia" (state) queries.

## Implementation Priority Matrix

Ordered by effort vs. rich result impact:

| Priority | Schema | Page | Effort | Impact |
|----------|--------|------|--------|--------|
| 1 | Organization + WebSite | `base.njk` | Low | High — knowledge panel |
| 2 | BlogPosting | `post.njk` | Low | Medium — article cards |
| 3 | BreadcrumbList | All inner pages | Low | Medium — navigation in SERP |
| 4 | FAQPage | Therapy guide, School/IEP | Medium | High — FAQ dropdowns |
| 5 | ItemList | Resources page | Medium | High — carousel potential |
| 6 | ContactPage | Contact page | Low | Low — minor signal |
| 7 | PodcastEpisode | Podcast posts | Medium | Medium — podcast carousel |

Copy this checklist and track progress:
- [ ] Organization + WebSite in `base.njk`
- [ ] BlogPosting in `post.njk`
- [ ] BreadcrumbList partial for all inner pages
- [ ] FAQPage on therapy guide
- [ ] FAQPage on school/IEP guide
- [ ] ItemList on resources page
- [ ] Validate all with Rich Results Test
- [ ] Submit updated sitemap in Search Console
