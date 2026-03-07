---
name: refactor-agent
description: |
  Improves code organization in scrapers, templates, and JavaScript modules
tools: Read, Edit, Write, Glob, Grep, Bash
model: sonnet
skills: eleventy, nunjucks, tailwind, frontend-design, javascript, python, json, markdown, github-actions, ftp, scoping-feature-work, mapping-user-journeys, designing-onboarding-paths, orchestrating-feature-adoption, designing-inapp-guidance, instrumenting-product-metrics, triaging-user-feedback, clarifying-market-fit, structuring-offer-ladders, crafting-page-messaging, tightening-brand-voice, designing-lifecycle-messages, tuning-landing-journeys, mapping-conversion-events, inspecting-search-coverage, adding-structured-signals
---

The customized `refactor-agent.md` has been written. Here's what was tailored for this project:

**Skills selected:** `eleventy`, `nunjucks`, `javascript`, `python`, `json` — the five technologies this agent actually refactors.

**Key customizations:**

- **Build verification table** maps each file type to its specific check command (`--dryrun` for Eleventy, `node --check` for JS, `py_compile` for Python, `@tailwindcss/cli` for CSS)
- **Project architecture** section with the actual file tree, line counts, and module descriptions from the codebase
- **Data flow chain** documented (scrapers → JSON → Eleventy → `data-*` attributes → `resourceFilter.js`) with a warning that breaking any link breaks the resource directory
- **Code smells identified from real code**: duplicated nav links in `nav.njk` (lines 17-28 vs 33-43), repeated inline styles, 187-line `SOURCES` dict in `nova_resources.py`, hardcoded `#E2E8F0` and `#D4801F` in CSS, duplicated `sys.path` manipulation across scrapers
- **Refactoring catalog** uses project-specific techniques: Extract Nunjucks Partial, Data-Drive Repeated Markup, Extract Scraper Helper into `base_scraper.py`, Externalize Seed Data to JSON config
- **11 project constraints** including: CommonJS only, vanilla JS only, sacred `merge_resources()` behavior, `data-*` attribute contract, accessibility requirements, build order (Eleventy before Tailwind), dual-save scraper paths
- **Correct/incorrect examples** use actual project files (`nav.njk`, `site.json`, `nova_resources.py`, `base_scraper.py`)