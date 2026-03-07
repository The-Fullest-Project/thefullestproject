All 7 files have been created. Here's a summary of the **inspecting-search-coverage** skill:

## Files Created

```
.claude/skills/inspecting-search-coverage/
├── SKILL.md                        — Skill entry point with audit checklist and quick start
└── references/
    ├── technical.md                — Canonical URLs, sitemap date format, robots.txt, crawlability
    ├── on-page.md                  — Meta tags, OG/Twitter cards, headings, image alt, internal links
    ├── content.md                  — Blog indexability, guide keyword coverage, thin content, freshness
    ├── programmatic.md             — Data-driven page generation from JSON (location/category pages)
    ├── schema.md                   — JSON-LD: Organization, WebSite, Article, Breadcrumb, FAQ
    └── competitive.md              — Comparison pages, alternative targeting, content gap analysis
```

## Key Findings Documented

**Critical gaps identified in the codebase:**
- No `<link rel="canonical">` in `base.njk`
- Zero JSON-LD structured data anywhere
- Missing `og:image` and Twitter Card tags
- Sitemap uses human-readable dates instead of ISO 8601
- Blog posts lack `description` field (falls back to generic site description)
- Client-side resource filtering is invisible to search engines

**Highest-impact recommendations:**
1. Add canonical + OG image + Twitter Cards to `base.njk` (quick wins)
2. Add `isoDate` filter and fix sitemap format
3. Generate static location pages from JSON data (programmatic SEO)
4. Add Organization + WebSite + Article JSON-LD schemas
5. Split therapy guide into individual therapy pages

The skill cross-references **eleventy**, **nunjucks**, **adding-structured-signals**, **crafting-page-messaging**, **tuning-landing-journeys**, **mapping-conversion-events**, **markdown**, **json**, and **scoping-feature-work** skills where relevant.