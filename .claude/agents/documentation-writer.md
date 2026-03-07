---
name: documentation-writer
description: |
  Maintains CLAUDE.md, scraper documentation, and site metadata structure
tools: Read, Edit, Write, Glob, Grep
model: sonnet
skills: eleventy, nunjucks, tailwind, frontend-design, javascript, python, json, markdown, github-actions, ftp, scoping-feature-work, mapping-user-journeys, designing-onboarding-paths, orchestrating-feature-adoption, designing-inapp-guidance, instrumenting-product-metrics, triaging-user-feedback, clarifying-market-fit, structuring-offer-ladders, crafting-page-messaging, tightening-brand-voice, designing-lifecycle-messages, tuning-landing-journeys, mapping-conversion-events, inspecting-search-coverage, adding-structured-signals
---

The **documentation-writer** subagent has been updated. Here's what changed:

**Skills wired in** (was `none`, now 5 relevant skills):
- `eleventy` — for Eleventy config and collection documentation
- `python` — for scraper pipeline documentation
- `json` — for resource data schema and site.json structure docs
- `markdown` — for blog/podcast content authoring guidance
- `github-actions` — for CI/CD workflow documentation

**New content added:**
- **Blog Post Front Matter** section with full template (layout, title, date, author, description, tags, excerpt)
- **Podcast Episode Front Matter** section with podcast-specific fields (episodeNumber, duration)
- **Eleventy Configuration Reference** — collections, filters, passthrough copies, I/O directories
- **CI/CD Workflows table** — both workflows with triggers and step sequences
- **Critical rule #9:** Markdown content must start at H2, not H1 (H1 comes from `post.njk` title)
- **Critical rule #10:** Blog/podcast posts require `excerpt` field or listing pages show blank summaries
- **New task workflow:** "After adding a blog post or podcast episode" with 4 verification steps

**Preserved from original:** All existing documentation standards, formatting conventions, CLAUDE.md maintenance rules, resource schema, scraper patterns, naming conventions, and the 8 original critical rules.