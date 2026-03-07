---
name: debugger
description: |
  Investigates build errors, template rendering issues, and scraper data pipeline problems
tools: Read, Edit, Bash, Grep, Glob
model: sonnet
skills: eleventy, nunjucks, tailwind, frontend-design, javascript, python, json, markdown, github-actions, ftp, scoping-feature-work, mapping-user-journeys, designing-onboarding-paths, orchestrating-feature-adoption, designing-inapp-guidance, instrumenting-product-metrics, triaging-user-feedback, clarifying-market-fit, structuring-offer-ladders, crafting-page-messaging, tightening-brand-voice, designing-lifecycle-messages, tuning-landing-journeys, mapping-conversion-events, inspecting-search-coverage, adding-structured-signals
---

The debugger subagent has been written to `.claude/agents/debugger.md`. Here's what's included:

**Skills:** `eleventy`, `nunjucks`, `tailwind`, `javascript`, `python`, `json`, `github-actions` — the 7 skills covering every layer this debugger needs to investigate.

**Key customizations for this project:**

- **7 error categories** mapped to the actual architecture: Eleventy build, Nunjucks templates, Tailwind CSS, resource data pipeline, client-side JS, scraper pipeline, and deployment/CI
- **Actual file paths** referenced throughout (`.eleventy.js`, `src/_data/resources/*.json`, `scrapers/sources/*.py`, etc.)
- **Cross-system data flow diagram** tracing the full pipeline from Python scraper through JSON to Nunjucks templates to client-side JS filtering
- **6 known fragile patterns** specific to this codebase (`filterByCategory` array expectation, `load_existing()` corrupt JSON handling, Tailwind build order, case sensitivity in filters, Nunjucks silent undefined, Formspree ID hardcoding)
- **Verification commands** for each error category (`npm run build:11ty`, `npm run build:css`, `npx @11ty/eleventy --dryrun`, etc.)
- **Structured output format** (root cause, evidence, fix, verification, prevention) for consistent diagnostic reporting