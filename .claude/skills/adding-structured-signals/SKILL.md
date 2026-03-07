All 7 files have been created. Here's a summary of the **adding-structured-signals** skill:

## Files Created

| File | Lines | Purpose |
|------|-------|---------|
| `SKILL.md` | ~120 | Quick start with Organization, BlogPosting, BreadcrumbList patterns; priority order; validation workflow |
| `references/technical.md` | ~130 | JSON-LD placement in layouts, Nunjucks data access, `jsonEscape` filter, duplicate block warnings |
| `references/on-page.md` | ~130 | Meta tag alignment with JSON-LD, canonical URLs, Twitter cards, og:image, per-page schema mapping |
| `references/content.md` | ~140 | Content-to-schema type mapping: homepage, blog, resources ItemList, FAQPage guides, about page |
| `references/programmatic.md` | ~130 | Required Eleventy filters (`dateISO`, `jsonEscape`), Nunjucks loop patterns, BreadcrumbList partial, build validation |
| `references/schema.md` | ~150 | Complete schema.org type reference: Organization, WebSite, BlogPosting, ItemList, FAQPage, PodcastEpisode, ContactPage |
| `references/competitive.md` | ~130 | Rich result opportunities, competitor gaps, FAQ strategy for caregiver queries, implementation priority matrix |

## Key Findings Reflected in the Skill

- **Zero existing structured data** — the site has OG tags but no JSON-LD anywhere
- **High-value opportunities**: FAQPage on therapy/IEP guides (most competitors skip this), ItemList on the resource directory, BlogPosting with E-E-A-T author signals
- **Required new Eleventy filters**: `dateISO`, `dateISOFull`, `jsonEscape` — documented with exact code
- **Anti-patterns documented**: broken JSON from unescaped quotes, trailing commas in Nunjucks loops, duplicate schema blocks across layout chain, schema spam penalties
- **Cross-references** to eleventy, nunjucks, json, inspecting-search-coverage, javascript, markdown, and crafting-page-messaging skills